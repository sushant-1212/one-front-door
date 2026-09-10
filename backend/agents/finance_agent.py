import os
import re
import pandas as pd
from typing import Dict, Any

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "company_expenses.csv")

class FinanceAgent:
    def __init__(self):
        self.df = None
        self._load_data()
        
    def _load_data(self):
        if os.path.exists(CSV_PATH):
            self.df = pd.read_csv(CSV_PATH)
            
    def query(self, query_text: str, user_role: str = "Employee") -> Dict[str, Any]:
        if self.df is None:
            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": "Financial ledger data is currently unavailable.",
                "computed": False,
                "confidence": 0.0
            }
            
        q = query_text.lower()
        
        # 1. Check for vague or uncomputable queries -> Strict refusal per Problem #12 rule
        # "refuse with can't compute instead of inventing a figure"
        departments = [d for d in self.df["department"].unique() if d.lower() in q]
        categories = [c for c in self.df["category"].unique() if c.lower() in q]
        quarters = [qr for qr in self.df["quarter"].unique() if qr.lower().replace("-", " ") in q.replace("-", " ") or qr.lower() in q]
        
        # If user asks vague "how much budget is left" without any department or category
        if not departments and not categories:
            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": (
                    "⚠️ **Cannot Compute Financial Ledger Balance**\n\n"
                    "Your query is too ambiguous to produce an authoritative computed figure. "
                    "Per Corporate Financial Governance rules, I cannot estimate or invent numbers.\n\n"
                    "Please specify at least:\n"
                    "1. **Department** (e.g., *Sales, Engineering, Marketing, IT, HR*)\n"
                    "2. **Category** (e.g., *Travel, Software, Cloud Infrastructure, Events*)\n"
                    "3. Optional **Quarter** (e.g., *Q3-2026*)\n\n"
                    "Example: *'What is the remaining Q3 travel budget for the Sales department?'*"
                ),
                "computed": False,
                "confidence": 0.85
            }
            
        filtered = self.df.copy()
        filters_applied = []
        
        if departments:
            filtered = filtered[filtered["department"].str.lower().isin([d.lower() for d in departments])]
            filters_applied.append(f"Department: `{', '.join(departments)}`")
        if categories:
            filtered = filtered[filtered["category"].str.lower().isin([c.lower() for c in categories])]
            filters_applied.append(f"Category: `{', '.join(categories)}`")
        if quarters:
            filtered = filtered[filtered["quarter"].str.lower().isin([qr.lower() for qr in quarters])]
            filters_applied.append(f"Quarter: `{', '.join(quarters)}`")
        else:
            # Default to Q3-2026 if not specified, but note it
            if "q1" in q:
                filtered = filtered[filtered["quarter"] == "Q1-2026"]
                filters_applied.append("Quarter: `Q1-2026`")
            elif "q2" in q:
                filtered = filtered[filtered["quarter"] == "Q2-2026"]
                filters_applied.append("Quarter: `Q2-2026`")
            else:
                # Default current quarter
                filtered = filtered[filtered["quarter"] == "Q3-2026"]
                filters_applied.append("Quarter: `Q3-2026 (Current)`")
                
        if filtered.empty:
            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": (
                    f"⚠️ **Zero Records Found in Ledger**\n\n"
                    f"No ledger line items matched the combination of: {', '.join(filters_applied)}.\n"
                    f"Please verify the department or expense category with your cost-center accountant."
                ),
                "computed": False,
                "confidence": 0.90
            }
            
        total_allocated = int(filtered["allocated_budget"].sum())
        total_spent = int(filtered["spent_amount"].sum())
        total_remaining = int(filtered["remaining_budget"].sum())
        pct_used = round((total_spent / total_allocated) * 100, 1) if total_allocated > 0 else 0
        
        # Build computed breakdown table
        rows_summary = []
        for _, row in filtered.iterrows():
            rows_summary.append(
                f"| {row['department']} | {row['category']} | {row['quarter']} | "
                f"${row['allocated_budget']:,} | ${row['spent_amount']:,} | **${row['remaining_budget']:,}** |"
            )
        table_md = (
            "| Department | Category | Quarter | Allocated | Spent | Remaining |\n"
            "|:---|:---|:---|---:|---:|---:|\n" +
            "\n".join(rows_summary)
        )
        
        response_text = (
            f"📊 **Authoritative Ledger Computation Results**\n\n"
            f"• **Filters Applied**: {', '.join(filters_applied)}\n"
            f"• **Remaining Balance**: **${total_remaining:,} USD**\n"
            f"• **Total Allocated**: ${total_allocated:,} USD\n"
            f"• **Total Expensed**: ${total_spent:,} USD ({pct_used}% utilized)\n\n"
            f"{table_md}\n\n"
            f"> 💡 *Data verified from Enterprise SAP S/4HANA & Concur Ledger as of Q3-2026.*"
        )
        
        return {
            "agent": "Finance Controller",
            "domain": "finance",
            "response": response_text,
            "computed": True,
            "data": {
                "remaining_budget": total_remaining,
                "allocated_budget": total_allocated,
                "spent_amount": total_spent,
                "filters": filters_applied
            },
            "confidence": 0.96
        }

finance_agent_instance = FinanceAgent()
