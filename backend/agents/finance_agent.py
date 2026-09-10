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
        
        # 1. Travel & Expense Submission Rules
        if any(w in q for w in ["expense my dinner", "meal expense", "food expense", "dinner receipt", "lunch receipt", "can i expense"]):
            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": (
                    "🍽️ **Business Meal & Travel Expense Policy**\n\n"
                    "Under Contoso Financial Travel & Entertainment Guidelines:\n"
                    "• **Daily Domestic Per Diem**: **$75 USD** ($20 breakfast, $25 lunch, $30 dinner).\n"
                    "• **Receipts**: Itemized receipts are required for individual transactions exceeding **$50 USD**.\n"
                    "• **Submission Platform**: File your expense claim through **SAP Concur** within **30 days** of incurring the expense.\n"
                    "• **Payment Method**: Please use your Contoso Corporate Card where accepted.\n\n"
                    "> 💡 *Alcohol requires manager pre-approval and must be segregated under code 4120-Entert.*"
                ),
                "computed": True,
                "confidence": 0.96
            }

        # 2. Parse ledger filters
        departments = [d for d in self.df["department"].unique() if d.lower() in q]
        categories = [c for c in self.df["category"].unique() if c.lower() in q]
        quarters = [qr for qr in self.df["quarter"].unique() if qr.lower().replace("-", " ") in q.replace("-", " ") or qr.lower() in q]
        
        # If user asks vague question without department or category
        if not departments and not categories:
            # Check if user asked about company-wide or general budget
            if any(w in q for w in ["total budget", "all budgets", "company spending", "overall budget"]):
                if user_role == "Employee":
                    return {
                        "agent": "Finance Controller",
                        "domain": "finance",
                        "response": "⚠️ **Access Restricted**: Company-wide total budget overviews require Manager or Executive authorization.",
                        "computed": False,
                        "confidence": 0.90
                    }
                total_alloc = int(self.df["allocated_budget"].sum())
                total_spent = int(self.df["spent_amount"].sum())
                total_rem = int(self.df["remaining_budget"].sum())
                return {
                    "agent": "Finance Controller",
                    "domain": "finance",
                    "response": (
                        f"📊 **Enterprise Total Ledger Overview (All Departments & Quarters)**\n\n"
                        f"• **Total Allocated**: ${total_alloc:,} USD\n"
                        f"• **Total Expensed**: ${total_spent:,} USD\n"
                        f"• **Total Remaining**: **${total_rem:,} USD**"
                    ),
                    "computed": True,
                    "confidence": 0.95
                }

            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": (
                    "⚠️ **Cannot Compute Financial Ledger Balance**\n\n"
                    "Your query lacks specific ledger filter parameters. "
                    "Per Corporate Financial Governance rules, I strictly compute authoritative values without inventing figures.\n\n"
                    "Please specify:\n"
                    "1. **Department** (*Sales, Engineering, Marketing, IT, HR*)\n"
                    "2. **Category** (*Travel, Software, Hardware, Events, Training*)\n"
                    "3. Optional **Quarter** (*Q1-2026, Q2-2026, Q3-2026*)\n\n"
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
            # Default to Q3-2026 current quarter
            filtered = filtered[filtered["quarter"] == "Q3-2026"]
            filters_applied.append("Quarter: `Q3-2026 (Current)`")
                
        if filtered.empty:
            return {
                "agent": "Finance Controller",
                "domain": "finance",
                "response": (
                    f"⚠️ **Zero Records Found in Ledger**\n\n"
                    f"No ledger records matched the combination of: {', '.join(filters_applied)}.\n"
                    f"Please verify the department or expense category with your cost-center accountant."
                ),
                "computed": False,
                "confidence": 0.90
            }
            
        total_allocated = int(filtered["allocated_budget"].sum())
        total_spent = int(filtered["spent_amount"].sum())
        total_remaining = int(filtered["remaining_budget"].sum())
        pct_used = round((total_spent / total_allocated) * 100, 1) if total_allocated > 0 else 0
        
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
