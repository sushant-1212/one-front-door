import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rbac import evaluate_rbac

def test_rbac_employee_blocked_on_salary():
    allowed, msg, meta = evaluate_rbac("Employee", "What is the executive compensation and VP salary band for 2026?", "finance")
    assert allowed is False
    assert "Access Restricted" in msg
    assert meta["required_role"] == "Executive"

def test_rbac_employee_blocked_on_dept_budget():
    allowed, msg, meta = evaluate_rbac("Employee", "Show me the entire departmental budget and discretionary funds", "finance")
    assert allowed is False
    assert meta["required_role"] == "Manager"

def test_rbac_manager_allowed_on_dept_budget():
    allowed, msg, meta = evaluate_rbac("Manager", "Show me the departmental budget for Engineering", "finance")
    assert allowed is True

def test_rbac_executive_allowed_on_salary():
    allowed, msg, meta = evaluate_rbac("Executive", "Show me the executive compensation pool for Q3", "finance")
    assert allowed is True
