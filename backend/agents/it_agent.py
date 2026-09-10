import os
import json
import re
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
        session_state = session_state or {}
        active_flow_key = session_state.get("flow_key")
        current_step_key = session_state.get("step_key")
        failed_attempts = session_state.get("failed_attempts", 0)
        is_verified = session_state.get("is_verified", False)
        
        # Action Payload handling (Buttons or PIN verification)
        if action_payload:
            selected_next = action_payload.get("next_step")
            provided_pin = action_payload.get("pin")
            
            if provided_pin:
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
                        "response": "❌ Invalid PIN entered. Security authorization failed. Please enter your 4-digit Employee PIN to proceed.",
                        "requires_verification": True,
                        "state": session_state,
                        "confidence": 0.95
                    }
                    
            if selected_next:
                if selected_next == "resolved":
                    return {
                        "agent": "IT Service Desk",
                        "domain": "it",
                        "response": "🎉 Excellent! The technical issue has been resolved. Your session has been marked completed. Let me know if you need any other assistance.",
                        "options": [],
                        "state": {},
                        "confidence": 0.95
                    }
                elif selected_next == "escalate":
                    category = "IT Service Escalation"
                    if "vpn" in (active_flow_key or ""):
                        category = "Network / VPN"
                    elif "display" in (active_flow_key or "") or "screen" in (active_flow_key or ""):
                        category = "Hardware & Display"
                    elif "wifi" in (active_flow_key or ""):
                        category = "Office Wireless"
                        
                    ticket = create_support_ticket(
                        user_id=user_id,
                        user_name=user_name,
                        category=category,
                        issue_summary=f"Automated diagnostics unresolved for flow: {active_flow_key}",
                        troubleshooting_log=f"User followed self-service steps for {active_flow_key} without resolution. Escalated to Tier-2.",
                        priority="HIGH",
                        assigned_team="Tier-2 IT Operations"
                    )
                    return {
                        "agent": "IT Service Desk",
                        "domain": "it",
                        "response": "🚨 Diagnostics did not resolve the issue. I have generated an official incident ticket for Tier-2 Support.",
                        "ticket": ticket,
                        "state": {},
                        "confidence": 0.98
                    }
                else:
                    failed_attempts += 1
                    return self._render_step(active_flow_key, selected_next, failed_attempts, is_verified, user_id, user_name)

        q_lower = query.lower()

        # Specific IT Category Detections
        if any(w in q_lower for w in ["screen", "monitor", "display", "flicker", "flickering", "hdmi", "resolution"]):
            return {
                "agent": "IT Service Desk",
                "domain": "it",
                "response": (
                    "🖥️ **Display & Monitor Diagnostics**\n\n"
                    "Let's troubleshoot your screen issue:\n"
                    "1. **Check Cables**: Disconnect and firmly re-seat your HDMI/DisplayPort cable or USB-C dock connection.\n"
                    "2. **Refresh Rate**: Right-click Desktop $\\rightarrow$ **Display settings** $\\rightarrow$ **Advanced display** $\\rightarrow$ Ensure refresh rate is set to **60 Hz**.\n"
                    "3. **Dock Power**: Power-cycle your docking station by unplugging power for 10 seconds.\n\n"
                    "Did these steps resolve the flickering or display problem?"
                ),
                "options": [
                    { "label": "Yes, screen is working normally", "next_step": "resolved" },
                    { "label": "No, need replacement monitor / ticket", "next_step": "escalate" }
                ],
                "state": { "flow_key": "display_diagnostics", "step_key": "step_1", "failed_attempts": 0, "is_verified": False },
                "confidence": 0.96
            }

        if any(w in q_lower for w in ["wifi", "wi-fi", "wireless", "ssid", "office internet"]):
            return {
                "agent": "IT Service Desk",
                "domain": "it",
                "response": (
                    "📶 **Corporate Wi-Fi Connectivity**\n\n"
                    "To connect to Contoso high-speed wireless:\n"
                    "1. Select SSID: **`Contoso-Corporate`** (do not use *Contoso-Guest* for internal tools).\n"
                    "2. When prompted, select **EAP Method: PEAP** and enter your corporate Single Sign-On credentials.\n"
                    "3. Accept the **Contoso Enterprise Root Certificate**.\n\n"
                    "If you cannot connect, would you like to escalate to Network Operations?"
                ),
                "options": [
                    { "label": "Connected successfully", "next_step": "resolved" },
                    { "label": "Still failing to authenticate", "next_step": "escalate" }
                ],
                "state": { "flow_key": "wifi_diagnostics", "step_key": "step_1", "failed_attempts": 0, "is_verified": False },
                "confidence": 0.96
            }

        if any(w in q_lower for w in ["mouse", "keyboard", "charger", "dock", "cable", "adapter"]):
            return {
                "agent": "IT Service Desk",
                "domain": "it",
                "response": (
                    "🖱️ **Standard Peripherals & Accessories Request**\n\n"
                    "Standard peripherals (Dell Dual 27\" 4K monitors, ergonomic keyboards, wireless mice, and 90W USB-C chargers) are pre-approved under the **IT FastTrack Catalog**.\n\n"
                    "Would you like me to submit an automated hardware dispatch request to your office desk or registered home address?"
                ),
                "options": [
                    { "label": "Submit Hardware Dispatch Request", "next_step": "escalate" }
                ],
                "state": { "flow_key": "hardware_dispatch", "step_key": "step_1", "failed_attempts": 0, "is_verified": False },
                "confidence": 0.95
            }

        if any(w in q_lower for w in ["password", "unlock", "forgot password", "login locked", "reset my password"]):
            active_flow_key = "password_reset"
            current_step_key = "step_1"
            return self._render_step(active_flow_key, current_step_key, failed_attempts, is_verified, user_id, user_name)

        if any(w in q_lower for w in ["vpn", "globalprotect", "tunnel", "disconnect", "error 403"]):
            active_flow_key = "vpn_troubleshooting"
            current_step_key = "step_1"
            return self._render_step(active_flow_key, current_step_key, failed_attempts, is_verified, user_id, user_name)

        # General technical troubleshooting flow
        return {
            "agent": "IT Service Desk",
            "domain": "it",
            "response": (
                f"🔧 **Contoso IT Service Desk**\n\n"
                f"I've received your inquiry: *\"{query}\"*\n\n"
                f"To help resolve this quickly, please select what type of assistance you need or proceed directly to an incident ticket:"
            ),
            "options": [
                { "label": "🔑 Password / Account Reset", "query": "I need to reset my corporate password" },
                { "label": "🌐 VPN & Remote Access", "query": "My GlobalProtect VPN won't connect" },
                { "label": "🖥️ Hardware or Peripherals", "query": "My computer monitor is having issues" },
                { "label": "🚨 Create Level-2 IT Support Ticket", "next_step": "escalate" }
            ],
            "state": { "flow_key": "general_it", "step_key": "step_1", "failed_attempts": 0, "is_verified": False },
            "confidence": 0.90
        }
        
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
