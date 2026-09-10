import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from router import Router

def test_router_hr():
    router = Router()
    result = router.classify("What is the paternity leave policy and how many weeks are paid?")
    assert result["domain"] == "hr"
    assert result["confidence"] >= 0.50
    assert "scores" in result
    assert result["scores"]["hr"] > result["scores"]["it"]

def test_router_it():
    router = Router()
    result = router.classify("My GlobalProtect VPN won't connect and gives error 403")
    assert result["domain"] == "it"
    assert result["confidence"] >= 0.50
    assert result["scores"]["it"] > result["scores"]["hr"]

def test_router_finance():
    router = Router()
    result = router.classify("What is the remaining travel budget for the Sales department in Q3?")
    assert result["domain"] == "finance"
    assert result["confidence"] >= 0.50
    assert result["scores"]["finance"] > result["scores"]["hr"]

def test_router_ambiguity_clarify():
    router = Router()
    # Ambiguous query that touches both IT and HR
    result = router.classify("I need help with my account")
    assert result["domain"] == "clarify"
    assert "options" in result
    assert len(result["options"]) >= 2
