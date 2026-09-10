import re
from typing import Dict, Any, Tuple

# Mock personas for the demo
PERSONAS = {
    "employee": {
        "user_id": "EMP-10492",
        "name": "Alex Chen",
        "title": "Software Engineer II",
        "role": "Employee",
        "department": "Engineering"
    },
    "manager": {
        "user_id": "MGR-40281",
        "name": "Sarah Jenkins",
        "title": "Engineering Director",
        "role": "Manager",
        "department": "Engineering"
    },
    "executive": {
        "user_id": "EXE-00104",
        "name": "David Vance",
        "title": "VP of Operations",
        "role": "Executive",
        "department": "Executive"
    }
}

# Sensitive regex patterns requiring elevated privileges
SENSITIVE_POLICIES = [
    {
        "pattern": r"(executive\s+compensation|salary\s+band|bonus\s+pool|vp\s+payroll|officer\s+equity|director\s+shares)",
        "min_role": "Executive",
        "policy_id": "RBAC-SEC-401",
        "description": "Executive Compensation & Equity Data"
    },
    {
        "pattern": r"(department(al)?\s+budget|cost\s+center|discretionary\s+funds?|company-wide\s+spending|team\s+budget)",
        "min_role": "Manager",
        "policy_id": "RBAC-SEC-402",
        "description": "Departmental Financial Allocation & Budget Control"
    },
    {
        "pattern": r"(disciplinary\s+record|termination\s+severance|employee\s+performance\s+review)",
        "min_role": "Manager",
        "policy_id": "RBAC-SEC-403",
        "description": "Confidential Employee Conduct & Personnel Records"
    }
]

ROLE_HIERARCHY = {
    "Employee": 1,
    "Manager": 2,
    "Executive": 3
}

def evaluate_rbac(user_role: str, query: str, domain: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Evaluates whether the user's role has authorization to query the requested topic.
    Returns (is_allowed, refusal_message_or_empty, metadata)
    """
    user_level = ROLE_HIERARCHY.get(user_role, 1)
    normalized_query = query.lower()
    
    for rule in SENSITIVE_POLICIES:
        if re.search(rule["pattern"], normalized_query):
            required_level = ROLE_HIERARCHY.get(rule["min_role"], 3)
            if user_level < required_level:
                refusal_message = (
                    f"🔒 **Access Restricted [Security Policy {rule['policy_id']}]**\n\n"
                    f"Your current role (**{user_role}**) is not authorized to query **{rule['description']}**.\n\n"
                    f"• **Required Minimum Privilege**: `{rule['min_role']}`\n"
                    f"• **Policy Reference**: Enterprise Security Governance Framework (v2.6, Article 9)\n"
                    f"• **Audit Notice**: This unauthorized access attempt has been logged in the compliance audit trail.\n\n"
                    f"If you require temporary escalation for business operations, please request cost-center access through your department leadership or IT Identity Governance."
                )
                return False, refusal_message, {
                    "policy_id": rule["policy_id"],
                    "required_role": rule["min_role"],
                    "reason": rule["description"]
                }
                
    return True, "", {}
