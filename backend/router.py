import re
from typing import Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Rich domain semantic anchors used to compute similarity
DOMAIN_ANCHORS = {
    "hr": [
        "human resources employee policy leave pto sick days maternity paternity parental vacation",
        "benefits health insurance dental vision wellness reimbursement stipend mental health",
        "bereavement time off compassionate holiday schedule employment handbook conduct standards",
        "tuition assistance professional development training education reimbursement",
        "home office desk chair ergonomic stipend remote hybrid workplace guidelines",
        "internal job transfer promotion career mobility hiring resignation notice period",
        "payroll direct deposit tax forms w2 paystub compensation benefits enrollment",
        "maternity leave weeks salary birth adoption foster caregiver leave time off"
    ],
    "it": [
        "information technology support helpdesk computer laptop hardware monitor keyboard dock mouse",
        "vpn globalprotect connection network wifi internet tunnel disconnected timeout error 403",
        "password reset sso single sign on account locked unlock multifactor mfa auth pin",
        "software install license permission access git github visual studio ide figma cloud credentials",
        "operating system windows blue screen reboot crash slow disk space performance",
        "printer setup scanner badge access security key yubikey token cert certificate flushdns",
        "troubleshooting diagnostic incident ticket tier 2 support escalation technical issue"
    ],
    "finance": [
        "finance financial expense budget ledger spent remaining balance allocation accounting",
        "department travel budget q1 q2 q3 q4 cost center navan concur flight hotel",
        "reimbursement claims corporate card receipt purchase order invoice vendor payment",
        "cloud infrastructure spending software licenses cost event catering marketing budget",
        "quarterly budget forecast fiscal year financial statement ledger line items",
        "how much budget is left how much did engineering sales marketing spend remaining"
    ]
}

# Ambiguity triggers for clarification
AMBIGUOUS_PATTERNS = [
    {
        "pattern": r"\b(my\s+account|help\s+with\s+(my\s+)?account|account\s+access|account\s+issue)\b",
        "explanation": "Your question about 'account' could relate to IT credentials or HR payroll records.",
        "options": [
            {"label": "🔑 IT: Reset Password / Unlock Login", "domain": "it", "query": "I need help unlocking my IT single sign-on account"},
            {"label": "💳 HR: Payroll & Direct Deposit Account", "domain": "hr", "query": "How do I update my direct deposit bank account with HR?"}
        ]
    },
    {
        "pattern": r"\b(stipend|reimbursement|expenses?|receipts?|claim)\b(?!.*(engineering|sales|marketing|q1|q2|q3|q4|ledger|budget))",
        "explanation": "Questions regarding stipends or expenses may belong to HR policy guidelines or Finance ledger claims.",
        "options": [
            {"label": "📋 HR: Home Office / Wellness Stipend Policy", "domain": "hr", "query": "What is the policy for home office and wellness stipend?"},
            {"label": "💵 Finance: Department Expense Balance", "domain": "finance", "query": "What is the remaining travel and expense budget?"}
        ]
    },
    {
        "pattern": r"\b(hardware|laptop|equipment)\b.*(budget|cost|price|approval)",
        "explanation": "Hardware requests involve both IT technical provisioning and Finance departmental budget.",
        "options": [
            {"label": "💻 IT: Request Laptop or Peripheral Hardware", "domain": "it", "query": "How do I request a new laptop from IT?"},
            {"label": "📊 Finance: Check Department Hardware Budget", "domain": "finance", "query": "What is the remaining hardware budget for engineering?"}
        ]
    }
]

CONFIDENCE_THRESHOLD = 0.50
MARGIN_THRESHOLD = 0.08

class Router:
    def __init__(self):
        self.domains = ["hr", "it", "finance"]
        self.vectorizer = None
        self.domain_profiles = {}
        self._fit_vectorizer()
        
    def _fit_vectorizer(self):
        # Concatenate anchors per domain into consolidated profiles
        corpus = []
        for d in self.domains:
            combined = " ".join(DOMAIN_ANCHORS[d])
            corpus.append(combined)
            
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words="english"
        )
        profile_matrix = self.vectorizer.fit_transform(corpus)
        
        for i, d in enumerate(self.domains):
            self.domain_profiles[d] = profile_matrix[i]
            
    def classify(self, query: str) -> Dict[str, Any]:
        """
        Classifies user query into 'hr', 'it', 'finance', or 'clarify'.
        Returns detailed scores and routing reasoning.
        """
        norm_query = query.lower().strip()
        
        # 1. First check explicit multi-domain ambiguity rules
        for amb in AMBIGUOUS_PATTERNS:
            if re.search(amb["pattern"], norm_query):
                return {
                    "domain": "clarify",
                    "confidence": 0.45,
                    "scores": {"hr": 0.45, "it": 0.45, "finance": 0.10},
                    "reason": f"Disambiguation Trigger: {amb['explanation']}",
                    "options": amb["options"]
                }
                
        # 2. Compute Cosine Similarities against Domain Profiles
        query_vec = self.vectorizer.transform([norm_query])
        
        raw_scores = {}
        for d in self.domains:
            sim = cosine_similarity(query_vec, self.domain_profiles[d])[0][0]
            raw_scores[d] = float(sim)
            
        # Normalize scores to pseudo-probabilities via softmax or scaled sum
        score_sum = sum(raw_scores.values())
        if score_sum > 0:
            norm_scores = {d: round(raw_scores[d] / score_sum, 3) for d in self.domains}
        else:
            norm_scores = {d: 0.333 for d in self.domains}
            
        sorted_domains = sorted(norm_scores.items(), key=lambda x: x[1], reverse=True)
        top_domain, top_score = sorted_domains[0]
        second_domain, second_score = sorted_domains[1]
        
        # Calibrated confidence (blending raw similarity magnitude with margin)
        margin = top_score - second_score
        raw_top_sim = raw_scores[top_domain]
        
        # Explainable confidence calculation
        confidence = min(round(0.40 + (raw_top_sim * 1.2) + (margin * 0.4), 2), 0.99)
        
        # 3. Check Confidence & Margin Thresholds
        if confidence < CONFIDENCE_THRESHOLD or margin < MARGIN_THRESHOLD:
            # Low confidence or tied domains -> trigger clarifying dialog
            return {
                "domain": "clarify",
                "confidence": confidence,
                "scores": norm_scores,
                "raw_scores": {d: round(raw_scores[d], 3) for d in self.domains},
                "reason": (
                    f"Low confidence ({int(confidence*100)}% < {int(CONFIDENCE_THRESHOLD*100)}%) "
                    f"or close domain margin ({round(margin, 2)} < {MARGIN_THRESHOLD}). "
                    f"Top candidates: {top_domain.upper()} ({int(top_score*100)}%) and {second_domain.upper()} ({int(second_score*100)}%)."
                ),
                "options": [
                    {
                        "label": f"📋 Ask {top_domain.upper()} Specialist",
                        "domain": top_domain,
                        "query": query
                    },
                    {
                        "label": f"🔧 Ask {second_domain.upper()} Specialist",
                        "domain": second_domain,
                        "query": query
                    },
                    {
                        "label": "👤 Handoff to Human Support Buddy",
                        "domain": "human_handoff",
                        "query": query
                    }
                ]
            }
            
        return {
            "domain": top_domain,
            "confidence": confidence,
            "scores": norm_scores,
            "raw_scores": {d: round(raw_scores[d], 3) for d in self.domains},
            "reason": f"High confidence routing to {top_domain.upper()} ({int(confidence*100)}% match, {round(margin, 2)} separation margin)."
        }

router_instance = Router()
