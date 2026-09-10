import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from agents.hr_agent import hr_agent_instance
from agents.it_agent import it_agent_instance
from agents.finance_agent import finance_agent_instance
import database

def test_hr_agent_paternity_citation():
    resp = hr_agent_instance.answer("What is the paternity leave allowance?")
    assert resp["agent"] == "HR Policy Assistant"
    assert "Section 4.2: Paternity & Caregiver Leave" in resp["response"]
    assert resp["citation"] is not None
    assert "Section 4.2" in resp["citation"]["section"]

def test_finance_agent_exact_computation():
    resp = finance_agent_instance.query("What is the remaining travel budget for Sales in Q3?")
    assert resp["computed"] is True
    assert resp["data"]["remaining_budget"] == 14250
    assert "$14,250" in resp["response"]

def test_finance_agent_refusal_on_vague():
    # Per Problem #12 rule: refuse with cannot compute instead of inventing
    resp = finance_agent_instance.query("How much budget is left?")
    assert resp["computed"] is False
    assert "Cannot Compute Financial Ledger Balance" in resp["response"]

def test_it_agent_flow_and_ticket():
    # Test starting IT VPN flow
    res1 = it_agent_instance.handle_message("VPN is disconnected")
    assert res1["agent"] == "IT Service Desk"
    assert "options" in res1
    assert len(res1["options"]) > 0
    
    # Test escalation action creating a ticket in DB
    res_esc = it_agent_instance.handle_message(
        query="escalate",
        session_state={"flow_key": "vpn_troubleshooting", "step_key": "step_4_action", "failed_attempts": 2, "is_verified": True},
        action_payload={"next_step": "escalate"}
    )
    assert "ticket" in res_esc
    assert res_esc["ticket"]["ticket_id"].startswith("INC-")
    assert res_esc["ticket"]["status"] == "OPEN"
