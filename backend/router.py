import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Comprehensive enterprise semantic anchors
DOMAIN_ANCHORS = {
    "hr": [
        "human resources employee policy handbook rules guidelines conduct harassment equal opportunity",
        "leave pto annual leave vacation time off holiday calendar days off accrual rollover",
        "sick leave medical appointment illness doctor note health sick days physician",
        "maternity leave pregnancy birthing parent baby newborn delivery weeks paid salary",
        "paternity leave father non-birthing parent secondary caregiver adoption foster parental",
        "bereavement leave compassionate funeral death loss of family member",
        "health insurance medical dental vision benefits coverage provider doctor subsidy",
        "wellness credit reimbursement gym fitness tracker apps mental health counseling therapy",
        "professional development tuition assistance certification courses training classes conference",
        "remote work hybrid work work from home wfh guidelines core hours office attendance days",
        "home office desk chair ergonomic monitor setup stipend allowance purchase",
        "travel allowance meal per diem domestic international breakfast lunch dinner hotel flight",
        "internal job transfer promotion career mobility job opening apply department switch",
        "payroll direct deposit paycheck pay slip paystub tax forms w2 w-4 compensation bank account",
        "resignation notice period quitting exit interview severance offboarding retirement 401k pension"
    ],
    "it": [
        "information technology tech support helpdesk service desk customer service ticket",
        "wifi office wifi wireless network internet connection connect ssid 802.1x access point signal",
        "vpn globalprotect virtual private network tunnel disconnected gateway timeout error 403 500",
        "password reset forgot password change password unlock account sso single sign-on locked out",
        "authenticator mfa multi-factor 2fa two-factor authentication security key yubikey verification pin code",
        "hardware computer laptop macbook dell thinkpad desktop pc workstation replacement upgrade",
        "screen monitor display flickering black screen dual monitor resolution hdmi displayport",
        "keyboard mouse dock docking station charger power adapter usb cable headphones webcam",
        "software application install license download update permission git github visual studio code ide",
        "crash blue screen bsod freeze frozen reboot slow computer performance memory disk space",
        "printer scanner printing print badge door access card rfid scanner driver",
        "email outlook teams slack zoom audio microphone camera video call conference room"
    ],
    "finance": [
        "finance financial accounting accounts payable ledger balance audit",
        "budget departmental budget allocation allocated remaining remaining budget spent spending",
        "expense expenses expense report reimbursement receipt receipts claim concur navan invoice",
        "cost center department spending engineering sales marketing it hr executive q1 q2 q3 q4",
        "travel budget flight airline hotel lodging car rental taxi uber meal per diem expense",
        "cloud infrastructure aws azure gcp server hosting costs software license cost event budget",
        "discretionary fund company spending financial forecast ledger line items fiscal year",
        "can i expense receipt submission corporate credit card amex visa card payment vendor"
    ]
}

# Strong keyword priority rules for instant high-confidence routing
KEYWORD_RULES = {
    "hr": [
        r"\b(paternity|maternity|pto|annual\s+leave|sick\s+leave|bereavement|vacation|time\s+off|take\s+leave|apply\s+for\s+leave|parental\s+leave|wellness\s+credit|tuition|wfh|work\s+from\s+home|hybrid\s+work|ergonomic\s+chair|home\s+office\s+stipend|pay\s*slip|paycheck|paystub|w2|direct\s+deposit|job\s+transfer|notice\s+period)\b"
    ],
    "it": [
        r"\b(vpn|globalprotect|wifi|wi-fi|ssid|flushdns|flickering|blue\s+screen|bsod|macbook|laptop|keyboard|mouse|monitor|docking\s+station|charger|usb|printer|password\s+reset|reset\s+my\s+password|unlock\s+account|sso|authenticator|mfa|2fa|yubikey|software\s+install|git|github|vscode|visual\s+studio)\b"
    ],
    "finance": [
        r"\b(remaining\s+budget|allocated\s+budget|travel\s+budget|department(al)?\s+budget|marketing\s+budget|sales\s+budget|engineering\s+budget|it\s+budget|hr\s+budget|expense\s+report|concur|navan|per\s+diem|ledger|receipts?|invoice|how\s+much\s+(did|is|have)\s+.*(spend|spent|budget|cost))\b"
    ]
}

# Ambiguity triggers that require clarification
AMBIGUOUS_PATTERNS = [
    {
        "pattern": r"^\s*(i\s+need\s+)?help\s+with\s+(my\s+)?account\s*$",
        "explanation": "Your question about 'account' could relate to IT login credentials or HR payroll records.",
        "options": [
            {"label": "🔑 IT: Reset Password / Unlock Login", "domain": "it", "query": "I need help unlocking my IT single sign-on account"},
            {"label": "💳 HR: Payroll & Direct Deposit Account", "domain": "hr", "query": "How do I update my direct deposit bank account with HR?"}
        ]
    }
]

class Router:
    def __init__(self):
        self.domains = ["hr", "it", "finance"]
        self.vectorizer = None
        self.domain_profiles = {}
        self._fit_vectorizer()
        
    def _fit_vectorizer(self):
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
        norm_query = query.lower().strip()
        
        # 1. Check explicit multi-domain ambiguity rules
        for amb in AMBIGUOUS_PATTERNS:
            if re.search(amb["pattern"], norm_query):
                return {
                    "domain": "clarify",
                    "confidence": 0.45,
                    "scores": {"hr": 0.45, "it": 0.45, "finance": 0.10},
                    "reason": f"Disambiguation Trigger: {amb['explanation']}",
                    "options": amb["options"]
                }
                
        # 2. Check Strong Keyword Rules for High-Confidence Routing
        for domain, patterns in KEYWORD_RULES.items():
            for pat in patterns:
                if re.search(pat, norm_query):
                    scores = {d: (0.92 if d == domain else 0.04) for d in self.domains}
                    return {
                        "domain": domain,
                        "confidence": 0.94,
                        "scores": scores,
                        "raw_scores": scores,
                        "reason": f"High-confidence semantic match to {domain.upper()} domain based on enterprise domain lexicon."
                    }
                    
        # 3. Fallback to Vectorized Cosine Similarity
        query_vec = self.vectorizer.transform([norm_query])
        raw_scores = {}
        for d in self.domains:
            sim = cosine_similarity(query_vec, self.domain_profiles[d])[0][0]
            raw_scores[d] = float(sim)
            
        score_sum = sum(raw_scores.values())
        if score_sum > 0:
            norm_scores = {d: round(raw_scores[d] / score_sum, 3) for d in self.domains}
        else:
            norm_scores = {d: 0.333 for d in self.domains}
            
        sorted_domains = sorted(norm_scores.items(), key=lambda x: x[1], reverse=True)
        top_domain, top_score = sorted_domains[0]
        second_domain, second_score = sorted_domains[1]
        
        margin = top_score - second_score
        raw_top_sim = raw_scores[top_domain]
        confidence = min(round(0.45 + (raw_top_sim * 1.3) + (margin * 0.5), 2), 0.99)
        
        # If low confidence and no clear winner
        if confidence < 0.48 or (raw_top_sim < 0.05 and margin < 0.06):
            return {
                "domain": "clarify",
                "confidence": confidence,
                "scores": norm_scores,
                "raw_scores": {d: round(raw_scores[d], 3) for d in self.domains},
                "reason": (
                    f"Your inquiry could span multiple departments. "
                    f"Top matching candidates: {top_domain.upper()} ({int(top_score*100)}%) and {second_domain.upper()} ({int(second_score*100)}%)."
                ),
                "options": [
                    {"label": f"📋 Route to {top_domain.upper()} Specialist", "domain": top_domain, "query": query},
                    {"label": f"🔧 Route to {second_domain.upper()} Specialist", "domain": second_domain, "query": query},
                    {"label": "👤 Handoff to Human Concierge", "domain": "human_handoff", "query": query}
                ]
            }
            
        return {
            "domain": top_domain,
            "confidence": confidence,
            "scores": norm_scores,
            "raw_scores": {d: round(raw_scores[d], 3) for d in self.domains},
            "reason": f"High confidence routing to {top_domain.upper()} ({int(confidence*100)}% match)."
        }

router_instance = Router()
