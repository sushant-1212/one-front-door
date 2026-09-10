import os
import json
from typing import Dict, Any, Optional
try:
    from database import create_support_ticket
except (ImportError, ModuleNotFoundError):
    try:
        from ..database import create_support_ticket
    except (ImportError, ValueError):
        import sys
        sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
        from database import create_support_ticket

FLOWS_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "it_flows.json")

class ITAgent:
    def __init__(self):
        self.flows = {}
        self._load_flows()
        
    def _load_flows(self):
        if os.path.exists(FLOWS_FILE_PATH):
            with open(FLOWS_FILE_PATH, "r", encoding="utf-8") as f:
                self.flows = json.load(f)
                
    def handle_message(
        self,
        query: str,
        session_state: Optional[Dict[str, Any]] = None,
        user_id: str = "EMP-10492",
        user_name: str = "Alex Chen",
        action_payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handles incoming IT queries or state transitions.
        """
        session_state = session_state or {}
        active_flow_key = session_state.get("flow_key")
        current_step_key = session_state.get("step_key")
        failed_attempts = session_state.get("failed_attempts", 0)
        is_verified = session_state.get("is_verified", False)
        
        # Check if user passed an interactive button response or verification
        if action_payload:
            selected_next = action_payload.get("next_step")
            provided_pin = action_payload.get("pin")
            
            # If currently waiting on verification
            if provided_pin:
                # Mock verification: PIN '1234' or any 4 digits
                if len(str(provided_pin).strip()) == 4:
                    is_verified = True
                    flow = self.flows.get(active_flow_key, {})
                    step_data = flow.get("steps", {}).get(current_step_key, {})
                    next_step = step_data.get("on_verified_next_step", "step_4_action")
                    return self._render_step(
                        active_flow_key, next_step, failed_attempts, is_verified,
                        user_id, user_name, "✅ **Identity Verified.** Security token authenticated via Contoso Authenticator."
                    )
                else:
                    return {
                        "agent": "IT Service Desk",
                        "domain": "it",
                        "response": "❌ Invalid PIN entered. Security authorization failed. Please provide your 4-digit Employee PIN to proceed.",
                        "requires_verification": True,
                        "state": session_state,
                        "confidence": 0.95
                    }
                    
            if selected_next:
                if selected_next == "resolved":
                    return {
                        "agent": "IT Service Desk",
                        "domain": "it",
                        "response": "🎉 Great! Glad to hear the connection issue has been resolved. Your session has been marked as completed. Feel free to ask if you need anything else.",
                        "options": [],
                        "state": {}, # reset state
                        "confidence": 0.95
                    }
                elif selected_next == "escalate":
                    ticket = create_support_ticket(
                        user_id=user_id,
                        user_name=user_name,
                        category="Network / VPN",
                        issue_summary="GlobalProtect VPN recurring disconnect & authentication lease expiry",
                        troubleshooting_log="Step 1: Connection refresh failed. Step 2: DNS flush completed. Step 3: Identity verified (PIN authorized). Step 4: Gateway US-EAST-04 lease renewal rejected.",
                        priority="HIGH",
                        assigned_team="Tier-2 Network Operations"
                    )
                    return {
                        "agent": "IT Service Desk",
                        "domain": "it",
                        "response": f"🚨 Automated troubleshooting has been exhausted. I have escalated this incident directly to Tier-2 Network Operations. An engineer has been paged.",
                        "ticket": ticket,
                        "state": {}, # reset
                        "confidence": 0.98
                    }
                else:
                    failed_attempts += 1
                    return self._render_step(active_flow_key, selected_next, failed_attempts, is_verified, user_id, user_name)

        # Detect intent to select flow if not in active flow
        q_lower = query.lower()
        if not active_flow_key:
            if any(w in q_lower for w in ["vpn", "globalprotect", "disconnect", "tunnel", "wifi", "network", "remote connect"]):
                active_flow_key = "vpn_troubleshooting"
            elif any(w in q_lower for w in ["password", "reset", "unlock", "sso", "login locked"]):
                active_flow_key = "password_reset"
            elif any(w in q_lower for w in ["laptop", "monitor", "hardware", "dock", "mouse", "keyboard", "macbook"]):
                active_flow_key = "hardware_provisioning"
            else:
                active_flow_key = "vpn_troubleshooting"
                
            current_step_key = "step_1"
            failed_attempts = 0
            is_verified = False
            
        return self._render_step(active_flow_key, current_step_key, failed_attempts, is_verified, user_id, user_name)
        
    def _render_step(
        self,
        flow_key: str,
        step_key: str,
        failed_attempts: int,
        is_verified: bool,
        user_id: str,
        user_name: str,
        prefix_note: str = ""
    ) -> Dict[str, Any]:
        flow = self.flows.get(flow_key, {})
        step = flow.get("steps", {}).get(step_key, {})
        
        # Check if step triggers auto ticket escalation after multiple failures
        if step_key == "escalate" or failed_attempts >= 3:
            ticket = create_support_ticket(
                user_id=user_id,
                user_name=user_name,
                category="IT Incident Escalation",
                issue_summary="Self-service troubleshooting steps failed to resolve issue.",
                troubleshooting_log=f"Flow: {flow.get('title')}. Steps attempted: {failed_attempts}.",
                priority="HIGH",
                assigned_team="IT Tier-2 Support"
            )
            return {
                "agent": "IT Service Desk",
                "domain": "it",
                "response": "Automated self-service diagnostics failed to resolve the issue. An incident ticket has been created and assigned to Tier-2 IT Support.",
                "ticket": ticket,
                "options": [],
                "state": {},
                "confidence": 0.95
            }
            
        message = step.get("message", "How can IT Support assist you further?")
        if prefix_note:
            message = f"{prefix_note}\n\n{message}"
            
        options = step.get("options", [])
        requires_verification = step.get("requires_verification", False) and not is_verified
        
        new_state = {
            "flow_key": flow_key,
            "step_key": step_key,
            "failed_attempts": failed_attempts,
            "is_verified": is_verified
        }
        
        return {
            "agent": "IT Service Desk",
            "domain": "it",
            "response": message,
            "options": options,
            "requires_verification": requires_verification,
            "verification_prompt": step.get("verification_prompt", "") if requires_verification else "",
            "state": new_state,
            "confidence": 0.95
        }

it_agent_instance = ITAgent()
