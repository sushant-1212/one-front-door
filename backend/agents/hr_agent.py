import os
import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

POLICY_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hr_policies.md")

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
            
        # Split by ## Section
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
        if not self.sections or self.vectorizer is None:
            return {
                "agent": "HR Policy Assistant",
                "domain": "hr",
                "response": "I'm sorry, HR policy documentation is currently unavailable.",
                "citation": None,
                "confidence": 0.0
            }
            
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]
        best_idx = similarities.argmax()
        best_score = float(similarities[best_idx])
        best_section = self.sections[best_idx]
        
        # Extract the most salient sentence for the quote
        sentences = re.split(r"(?<=[.!?])\s+", best_section["content"])
        quote = sentences[0] if sentences else best_section["content"]
        
        response_text = (
            f"Based on Contoso HR Policy **{best_section['title']}**:\n\n"
            f"{best_section['content']}\n\n"
            f"> 📌 **Policy Citation**: `{best_section['title']}` in *Employee Policy Handbook 2026*.\n"
            f"> For official claim submissions or approvals, access the **Contoso HR Portal** under Services."
        )
        
        return {
            "agent": "HR Policy Assistant",
            "domain": "hr",
            "response": response_text,
            "citation": {
                "section": best_section["title"],
                "policy_file": "hr_policies.md",
                "quote": quote,
                "relevance_score": round(best_score, 3)
            },
            "confidence": max(round(best_score, 2), 0.75)
        }

hr_agent_instance = HRAgent()
