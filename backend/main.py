import time
import os
import uuid
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

import database
import rbac
from router import router_instance
from agents.hr_agent import hr_agent_instance
from agents.it_agent import it_agent_instance
from agents.finance_agent import finance_agent_instance

app = FastAPI(title="One Front Door Orchestration Layer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    role: Optional[str] = "Employee"
    persona_key: Optional[str] = "employee"
    action_payload: Optional[Dict[str, Any]] = None
    force_domain: Optional[str] = None

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "One Front Door Orchestration Gateway"}

@app.get("/api/personas")
def get_personas():
    return rbac.PERSONAS

@app.get("/api/stats")
def get_stats():
    return database.get_observability_metrics()

@app.get("/api/audit")
def get_audit(limit: int = 50, domain: Optional[str] = None):
    return database.get_recent_audit_logs(limit=limit, domain=domain)

@app.get("/api/tickets")
def get_tickets():
    return database.get_all_tickets()

@app.post("/api/reset-session")
def reset_session(session_id: str):
    database.update_session_state(session_id, None, None)
    return {"status": "reset", "session_id": session_id}

@app.post("/api/chat")
def chat(req: ChatRequest):
    start_time = time.time()
    session_id = req.session_id or str(uuid.uuid4())
    
    # Resolve persona details
    persona = rbac.PERSONAS.get(req.persona_key or "employee", rbac.PERSONAS["employee"])
    user_id = persona["user_id"]
    user_name = persona["name"]
    user_role = req.role or persona["role"]
    
    session = database.get_or_create_session(session_id, user_id, user_name, user_role)
    session_state = {}
    if session.get("domain_state_json"):
        import json
        try:
            session_state = json.loads(session["domain_state_json"])
        except Exception:
            session_state = {}
            
    # Check if this is an interactive continuation of an IT flow
    if req.action_payload and session.get("active_domain") == "it":
        it_resp = it_agent_instance.handle_message(
            query=req.message,
            session_state=session_state,
            user_id=user_id,
            user_name=user_name,
            action_payload=req.action_payload
        )
        database.update_session_state(session_id, "it" if it_resp.get("state") else None, it_resp.get("state"))
        latency = (time.time() - start_time) * 1000
        database.log_audit_event(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            query=f"[IT Action] {req.action_payload}",
            routed_domain="it",
            confidence=it_resp.get("confidence", 0.95),
            scores={"it": 1.0, "hr": 0.0, "finance": 0.0},
            latency_ms=latency,
            rbac_status="ALLOWED",
            response_preview=it_resp.get("response", "")
        )
        return {
            **it_resp,
            "session_id": session_id,
            "telemetry": {
                "routed_domain": "it",
                "confidence": it_resp.get("confidence", 0.95),
                "scores": {"it": 1.0, "hr": 0.0, "finance": 0.0},
                "latency_ms": round(latency, 1),
                "rbac_status": "ALLOWED",
                "reason": "Direct session continuation within IT Service Desk FSM"
            }
        }

    # 1. RBAC Security Check
    is_allowed, refusal_message, rbac_meta = rbac.evaluate_rbac(user_role, req.message, "general")
    if not is_allowed:
        latency = (time.time() - start_time) * 1000
        database.log_audit_event(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            query=req.message,
            routed_domain="rbac_denied",
            confidence=1.0,
            scores={"hr": 0.0, "it": 0.0, "finance": 0.0},
            latency_ms=latency,
            rbac_status="DENIED",
            response_preview=refusal_message
        )
        return {
            "agent": "Enterprise Security Gateway",
            "domain": "security",
            "response": refusal_message,
            "session_id": session_id,
            "rbac_denied": True,
            "telemetry": {
                "routed_domain": "security",
                "confidence": 1.0,
                "scores": {"hr": 0.0, "it": 0.0, "finance": 0.0},
                "latency_ms": round(latency, 1),
                "rbac_status": "DENIED",
                "reason": f"RBAC Gate: Restricted by policy {rbac_meta.get('policy_id')}"
            }
        }
        
    # 2. Intent Classification & Routing
    if req.force_domain:
        routed_domain = req.force_domain
        classification = {
            "domain": routed_domain,
            "confidence": 0.99,
            "scores": {d: (1.0 if d == routed_domain else 0.0) for d in ["hr", "it", "finance"]},
            "reason": f"Explicitly routed by user selection to {routed_domain.upper()}."
        }
    else:
        classification = router_instance.classify(req.message)
        routed_domain = classification["domain"]
        
    # 3. Handle Clarification / Low Confidence
    if routed_domain == "clarify":
        latency = (time.time() - start_time) * 1000
        clarify_text = (
            "🤔 **I want to make sure I get you to the exact right team.**\n\n"
            f"{classification.get('reason', 'Your request touches multiple enterprise domains.')}\n\n"
            "Please select which department best matches your intended goal:"
        )
        database.log_audit_event(
            user_id=user_id,
            user_name=user_name,
            user_role=user_role,
            query=req.message,
            routed_domain="clarify",
            confidence=classification["confidence"],
            scores=classification.get("scores", {}),
            latency_ms=latency,
            rbac_status="ALLOWED",
            response_preview=clarify_text
        )
        return {
            "agent": "System Orchestrator",
            "domain": "clarify",
            "response": clarify_text,
            "options": classification.get("options", []),
            "session_id": session_id,
            "telemetry": {
                "routed_domain": "clarify",
                "confidence": classification["confidence"],
                "scores": classification.get("scores", {}),
                "latency_ms": round(latency, 1),
                "rbac_status": "ALLOWED",
                "reason": classification.get("reason")
            }
        }
        
    # 4. Dispatch to Specialist Agent
    if routed_domain == "hr":
        agent_result = hr_agent_instance.answer(req.message, user_role)
        database.update_session_state(session_id, "hr", None)
    elif routed_domain == "it":
        agent_result = it_agent_instance.handle_message(
            query=req.message,
            session_state=session_state,
            user_id=user_id,
            user_name=user_name,
            action_payload=req.action_payload
        )
        database.update_session_state(session_id, "it" if agent_result.get("state") else None, agent_result.get("state"))
    elif routed_domain == "finance":
        agent_result = finance_agent_instance.query(req.message, user_role)
        database.update_session_state(session_id, "finance", None)
    elif routed_domain == "human_handoff":
        ticket = database.create_support_ticket(
            user_id=user_id,
            user_name=user_name,
            category="General Inquiry",
            issue_summary=f"Human handoff requested: {req.message}",
            troubleshooting_log="User requested live human specialist handoff from front door clarification menu.",
            priority="MEDIUM",
            assigned_team="Enterprise Concierge / Human Buddy"
        )
        agent_result = {
            "agent": "Human Buddy Concierge",
            "domain": "concierge",
            "response": f"👋 I've connected you with our **Human Enterprise Buddy** desk. Your concierge ticket has been created and our team will follow up via Teams within 15 minutes.",
            "ticket": ticket,
            "confidence": 1.0
        }
        database.update_session_state(session_id, None, None)
    else:
        agent_result = {
            "agent": "System Orchestrator",
            "domain": "unknown",
            "response": "Could not determine appropriate specialist.",
            "confidence": 0.0
        }

    latency = (time.time() - start_time) * 1000
    database.log_audit_event(
        user_id=user_id,
        user_name=user_name,
        user_role=user_role,
        query=req.message,
        routed_domain=routed_domain,
        confidence=classification["confidence"],
        scores=classification.get("scores", {}),
        latency_ms=latency,
        rbac_status="ALLOWED",
        response_preview=agent_result.get("response", "")
    )
    
    return {
        **agent_result,
        "session_id": session_id,
        "telemetry": {
            "routed_domain": routed_domain,
            "confidence": classification["confidence"],
            "scores": classification.get("scores", {}),
            "latency_ms": round(latency, 1),
            "rbac_status": "ALLOWED",
            "reason": classification.get("reason", f"Routed to {routed_domain.upper()}")
        }
    }

# Mount static build of frontend if it exists
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
