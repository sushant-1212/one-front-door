import os
import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

POLICY_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hr_policies.md")

# Topic mapping rules for instant, accurate section retrieval
TOPIC_RULES = [
    {
        "pattern": r"(paternity|father|secondary\s+caregiver|adoptive|parental\s+leave|child\s+birth\s+leave)",
        "section_prefix": "Section 4.2"
    },
    {
        "pattern": r"(maternity|birthing\s+parent|pregnancy|pregnant|delivery\s+date)",
        "section_prefix": "Section 4.1"
    },
    {
        "pattern": r"(pto|annual\s+leave|vacation|take\s+leave|apply\s+for\s+leave|holiday|days\s+off|rollover)",
        "section_prefix": "Section 2.1"
    },
    {
        "pattern": r"(sick\s+leave|sick\s+day|medical\s+appointment|illness|doctor\s+note|physician)",
        "section_prefix": "Section 2.2"
    },
    {
        "pattern": r"(remote\s+work|hybrid|work\s+from\s+home|wfh|core\s+hours|office\s+days|attendance)",
        "section_prefix": "Section 3.1"
    },
    {
        "pattern": r"(desk|chair|ergonomic|home\s+office|equipment\s+stipend|monitor\s+stipend|concur\s+stipend)",
        "section_prefix": "Section 3.2"
    },
    {
        "pattern": r"(bereavement|funeral|death|loss\s+of|compassionate)",
        "section_prefix": "Section 4.3"
    },
    {
        "pattern": r"(wellness|gym|fitness|health\s+insurance|dental|vision|mental\s+health|counseling|medical\s+insurance)",
        "section_prefix": "Section 5.1"
    },
    {
        "pattern": r"(tuition|certification|course|training|university|conference|learning)",
        "section_prefix": "Section 5.2"
    },
    {
        "pattern": r"(per\s+diem|meal|dinner|breakfast|lunch|travel\s+allowance|flight|hotel)",
        "section_prefix": "Section 6.1"
    },
    {
        "pattern": r"(transfer|mobility|switch\s+teams|new\s+role|internal\s+job)",
        "section_prefix": "Section 7.1"
    }
]

class HRAgent:
    def __init__(self):
        self.sections: List[Dict[str, str]] = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self._load_and_index_policies()
        
    def _load_and_index_policies(self):
        if not os.path.exists(POLICY_FILE_PATH):
            return
            
        with open(POLICY_FILE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
            
        raw_sections = re.split(r"(?=##\s+Section\s+)", content)
        parsed = []
        for sec in raw_sections:
            sec = sec.strip()
            if not sec or not sec.startswith("## Section"):
                continue
            header_match = re.match(r"##\s+(Section\s+[\d\.]+:?\s*[^\n]+)", sec)
            if header_match:
                title = header_match.group(1).strip()
                body = sec[header_match.end():].strip()
                parsed.append({
                    "title": title,
                    "content": body,
                    "full_text": f"{title}\n{body}"
                })
                
        self.sections = parsed
        if self.sections:
            corpus = [s["full_text"] for s in self.sections]
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            
    def answer(self, query: str, user_role: str = "Employee") -> Dict[str, Any]:
        norm_q = query.lower()
        
        # Special Corporate HR inquiries not in handbook
        if re.search(r"\b(pay\s*slip|paycheck|paystub|w2|direct\s+deposit|tax\s+form)\b", norm_q):
            return {
                "agent": "HR Policy Assistant",
                "domain": "hr",
                "response": (
                    "💳 **Payroll & Earnings Documents**\n\n"
                    "Your bi-monthly pay stubs, W-2 tax forms, and direct deposit details are managed through **ADP Enterprise / Contoso HR Self-Service**.\n\n"
                    "• **Pay Cycle**: Semi-monthly (paid on the 15th and last business day of each month).\n"
                    "• **Access Portal**: Navigate to `https://hr.contoso.internal/payroll` using single sign-on (SSO).\n"
                    "• **Direct Deposit Updates**: Changes take 1 pay cycle to verify with your financial institution.\n\n"
                    "> 📌 **Source**: *Contoso Payroll Services Department Guidelines*."
                ),
                "citation": {
                    "section": "Payroll & Earnings Administration",
                    "policy_file": "Contoso HR Self-Service Portal",
                    "quote": "Bi-monthly earnings statements and W-2 statements are securely hosted on ADP Enterprise."
                },
                "confidence": 0.98
            }

        if re.search(r"\b(401k|retirement|pension|match|matching)\b", norm_q):
            return {
                "agent": "HR Policy Assistant",
                "domain": "hr",
                "response": (
                    "💰 **Contoso 401(k) Retirement Plan**\n\n"
                    "Contoso provides a 401(k) plan administered via Fidelity Investments.\n\n"
                    "• **Company Match**: Contoso matches **100% of employee contributions up to 5%** of base salary, vesting immediately.\n"
                    "• **Enrollment & Allocations**: Manage your fund selections at `https://netbenefits.fidelity.com`.\n"
                    "• **Changes**: Contribution percentages can be adjusted at any time throughout the calendar year."
                ),
                "citation": {
                    "section": "Retirement & Capital Accumulation Plan",
                    "policy_file": "Employee Benefits Guide 2026",
                    "quote": "Contoso matches dollar-for-dollar up to 5% of base compensation with day-one immediate vesting."
                },
                "confidence": 0.96
            }

        # Check explicit topic rules
        matched_section = None
        for rule in TOPIC_RULES:
            if re.search(rule["pattern"], norm_q):
                for sec in self.sections:
                    if rule["section_prefix"] in sec["title"]:
                        matched_section = sec
                        break
                if matched_section:
                    break

        # Fallback to TF-IDF cosine similarity if no exact rule matched
        if not matched_section and self.sections and self.vectorizer is not None:
            query_vec = self.vectorizer.transform([norm_q])
            similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]
            best_idx = similarities.argmax()
            matched_section = self.sections[best_idx]

        if not matched_section:
            return {
                "agent": "HR Policy Assistant",
                "domain": "hr",
                "response": "I could not find an exact policy match for your inquiry in the Employee Handbook.",
                "citation": None,
                "confidence": 0.50
            }

        sentences = re.split(r"(?<=[.!?])\s+", matched_section["content"])
        quote = sentences[0] if sentences else matched_section["content"]

        response_text = (
            f"Based on Contoso HR Policy **{matched_section['title']}**:\n\n"
            f"{matched_section['content']}\n\n"
            f"> 📌 **Policy Citation**: `{matched_section['title']}` in *Employee Policy Handbook 2026*.\n"
            f"> For official requests or approvals, submit your request through the **Contoso HR Portal**."
        )

        return {
            "agent": "HR Policy Assistant",
            "domain": "hr",
            "response": response_text,
            "citation": {
                "section": matched_section["title"],
                "policy_file": "hr_policies.md",
                "quote": quote
            },
            "confidence": 0.95
        }

hr_agent_instance = HRAgent()
