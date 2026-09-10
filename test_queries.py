import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))
from router import router_instance
from agents.hr_agent import hr_agent_instance
from agents.it_agent import it_agent_instance
from agents.finance_agent import finance_agent_instance

queries = [
    "Can I take leave next Monday?",
    "How do I connect to office wifi?",
    "Where is my pay slip?",
    "I want to apply for vacation",
    "My computer screen is flickering",
    "How much money did marketing spend in Q3?",
    "Can I work from home on Friday?",
    "What is the policy on maternity leave?",
    "How do I reset my password?",
    "Can I get a new mouse and keyboard?",
    "I lost my laptop charger",
    "What is our medical insurance coverage?",
    "Show me travel expenses for engineering",
    "I need help with my 401k",
    "Can I expense my dinner from last night?",
    "My GlobalProtect VPN won't connect"
]

print("=== ROUTING & AGENT QUALITY TEST ===")
for q in queries:
    res = router_instance.classify(q)
    d = res['domain']
    print(f"[{d.upper():7}] (conf: {res['confidence']:.2f}) Query: {q}")
    if d == 'hr':
        ans = hr_agent_instance.answer(q)
        cite = ans.get('citation', {}).get('section', 'N/A') if ans.get('citation') else 'None'
        print(f"   -> HR Section: {cite}")
    elif d == 'it':
        ans = it_agent_instance.handle_message(q)
        flow = ans.get('state', {}).get('flow_key', 'general') if ans.get('state') else 'none'
        print(f"   -> IT Flow/Type: {flow}")
    elif d == 'finance':
        ans = finance_agent_instance.query(q)
        rem = ans.get('data', {}).get('remaining_budget', 'N/A') if ans.get('data') else 'N/A'
        print(f"   -> Finance Rem: {rem}")
    elif d == 'clarify':
        print(f"   -> Clarify Reason: {res['reason']}")
    print("-" * 50)
