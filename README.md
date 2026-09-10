# 🚪 One Front Door for Everything — Enterprise AI Orchestration Platform
### Microsoft Innovate 2026 | Focus Area 2, Problem #18 (Advanced)

> A single, unified enterprise front door that intelligently classifies employee inquiries, dynamically routes them to authoritative specialist agents (**HR Policy RAG**, **IT Support State-Machine**, **Finance Pandas Ledger**), handles ambiguity through interactive clarification, enforces Role-Based Access Control (RBAC), and maintains immutable compliance audit logs.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │   Enterprise Chat Frontend     │
                               │   (React + Vanilla CSS Tokens) │
                               │   - Single Omni-Input          │
                               │   - Dynamic Agent Badges       │
                               │   - Live Telemetry Drawer      │
                               │   - RBAC Persona Switcher      │
                               │   - 1-Click Pitch Script Bar   │
                               └───────────────┬────────────────┘
                                               │ POST /api/chat
                                               ▼
                               ┌────────────────────────────────┐
                               │    Orchestration Layer         │
                               │    (FastAPI Router Service)    │
                               │  1. Semantic TF-IDF Vectors    │
                               │  2. Calibrated Confidence Check│
                               │  3. RBAC Policy Governance     │
                               │  4. Session & FSM Memory       │
                               │  5. SQLite Audit Logging       │
                               └───────┬───────┬───────┬────────┘
             HR (Conf >= 0.50)         │       │       │ Finance (Conf >= 0.50)
            ┌──────────────────────────┘       │       └────────────────────────┐
            ▼                                  ▼ IT (Conf >= 0.50)              ▼
┌────────────────────────┐         ┌────────────────────────┐       ┌────────────────────────┐
│  HR Policy Agent (RAG) │         │ IT Service Desk Agent  │       │  Finance Data Agent    │
│  - Policy Knowledgebase│         │ - State-Machine Flow   │       │  - Pandas CSV Ledger   │
│  - Exact Section Quote │         │ - Identity Gate (PIN)  │       │  - Strictly Computed   │
│  - Citation Pill       │         │ - Auto-Ticket Creation │       │  - Zero Hallucination  │
└────────────────────────┘         └────────────────────────┘       └────────────────────────┘
            │                                  │                                │
            └──────────────────────────┬───────┴────────────────────────────────┘
                                       │
                      Low Confidence (< 0.50) or Ambiguous
                                       ▼
                       ┌────────────────────────────────┐
                       │ Clarification & Handoff Agent  │
                       │ - Disambiguation action pills  │
                       │ - Human buddy concierge ticket │
                       └────────────────────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │ SQLite Database                │
                       │ - audit_logs, tickets, sessions│
                       └────────────────────────────────┘
                                       ▲
                                       │
                       ┌────────────────────────────────┐
                       │ Streamlit Admin Dashboard      │
                       │ - Real-time Routing Telemetry  │
                       │ - RBAC Compliance Ledger       │
                       │ - Incident Ticket Backlog      │
                       └────────────────────────────────┘
```

---

## 💡 Why This Wins

1. **Subsumes Three Problems in One**:
   - **Problem #10 (HR FAQ)**: Solved with local TF-IDF semantic RAG policy handbook search with exact section citations.
   - **Problem #11 (IT Support)**: Solved with a rule-based decision tree, identity verification security gate (MFA/PIN), and auto-escalation ticket creation (`#INC-XXXX`).
   - **Problem #12 (Finance Q&A)**: Solved with a strict Pandas calculation engine over corporate expense ledger CSV with explicit zero-hallucination refusals.
2. **Deterministic & Explainable AI**:
   - Router uses cosine similarity vectors against domain semantic anchors. You can literally show the mathematical similarity scores and margin separation to judges live!
3. **Enterprise-Grade Governance**:
   - **Role-Based Access Control (RBAC)**: Role hierarchy (`Employee`, `Manager`, `Executive`). Employee querying executive compensation or department budgets gets an instant, polite compliance refusal.
   - **Immutable Audit Logging**: Every query, classification score, latency in ms, and RBAC decision is logged to SQLite.
   - **Observability Center**: Built-in telemetry inspector and standalone Streamlit admin panel.

---

## ⚡ 1-Click Live Demo Pitch Script (2–3 Minutes)

The frontend includes a **1-Click Pitch Script Ribbon** directly at the top so you can present without typing errors:

1. **Step 1: HR Policy Question**
   - *Query*: `"What is our paternity leave policy and how many weeks are paid?"`
   - *Result*: Bot identifies HR intent (🟣 badge), answers with **12 weeks fully paid**, and highlights the exact cited line from `Section 4.2: Paternity & Caregiver Leave`.
2. **Step 2: IT Troubleshooting & Auto-Ticket**
   - *Query*: `"My GlobalProtect VPN won't connect and shows error 403"`
   - *Result*: Bot starts the IT diagnostics flow (🔵 badge). User clicks through DNS flush $\rightarrow$ enters 4-digit PIN verification gate $\rightarrow$ gateway fails $\rightarrow$ bot automatically generates incident ticket `#INC-XXXX`.
3. **Step 3: Finance Budget Calculation**
   - *Query*: `"What is the remaining Q3 travel budget for the Sales department?"`
   - *Result*: Bot calculates the exact remaining balance (**$14,250 USD** from $45,000 allocated and $30,750 spent) from the CSV ledger with a breakdown table.
4. **Step 4: RBAC Refusal (Enterprise Wow-Moment)**
   - *Query*: `"Show me executive salary bands and VP compensation for 2026"`
   - *Result*: As `Alex Chen (Employee)`, the Security Gate (🔴 badge) intercepts and blocks the inquiry per **Policy RBAC-SEC-401**. Switch persona to `David Vance (Executive)` in the top header and re-ask to see it pass!
5. **Step 5: Ambiguous Query & Clarification**
   - *Query*: `"I need help with my account"`
   - *Result*: Bot recognizes dual ambiguity between IT single-sign-on and HR payroll account (🟡 badge). Instead of guessing, it presents interactive choice pills.
6. **Step 6: Observability Center**
   - Click **Observability Center** or open `http://localhost:8501` to show the real-time telemetry, confidence distribution, audit log with cosine similarity vectors, and ticket backlog.

---

## 🚀 Quickstart Guide

### Option 1: One-Click Windows Launcher
Run the PowerShell or batch script:
```powershell
.\start.ps1
```
or double click `start.bat`.

### Option 2: Run Locally via Python & Node

1. **Start the FastAPI Backend**:
```bash
cd backend
python main.py
```
*API and built frontend will be live at `http://localhost:8000`.*

2. **Start the Streamlit Observability Dashboard** (in another terminal):
```bash
streamlit run dashboard/app.py --server.port 8501
```
*Dashboard will be live at `http://localhost:8501`.*

3. *(Optional) Run Frontend in Vite Dev Mode*:
```bash
cd frontend
npm run dev
```
*Dev server will be live at `http://localhost:5173`.*

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Running Automated Unit Tests

Run the full test suite (12 tests covering intent classification, RBAC rules, HR RAG citations, IT state-machines, and Finance calculation logic):
```bash
python -m pytest backend/tests -v
```

---

## 📂 Project Structure

```
one-front-door/
├── backend/
│   ├── agents/
│   │   ├── hr_agent.py          # Policy RAG & citation engine
│   │   ├── it_agent.py          # Decision-tree FSM, PIN gate & ticket escalation
│   │   └── finance_agent.py     # Pandas expense ledger calculation & refusal engine
│   ├── data/
│   │   ├── hr_policies.md       # Enterprise policy handbook
│   │   ├── company_expenses.csv # Q1-Q4 departmental expense ledger
│   │   └── it_flows.json        # FSM troubleshooting flow definitions
│   ├── tests/
│   │   ├── test_agents.py       # Specialist agents verification
│   │   ├── test_rbac.py         # Role-based access control tests
│   │   └── test_router.py       # Intent router & ambiguity tests
│   ├── database.py              # SQLite audit logs, sessions & ticket store
│   ├── main.py                  # FastAPI router gateway & static serving
│   ├── rbac.py                  # Enterprise roles & security governance rules
│   ├── router.py                # TF-IDF cosine similarity classifier
│   └── requirements.txt         # Python dependencies
├── dashboard/
│   └── app.py                   # Streamlit observability & audit compliance panel
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # React omni-chat UI with demo ribbon & telemetry
│   │   ├── index.css            # Obsidian enterprise design tokens
│   │   └── main.jsx             # React DOM entry
│   ├── index.html               # Semantic HTML5 & Google Fonts
│   ├── package.json             # Vite & React scripts
│   └── vite.config.js           # Vite dev server & API proxy
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Multi-service composition
├── start.bat                    # Windows 1-click batch launcher
├── start.ps1                    # PowerShell 1-click launcher
└── README.md                    # System documentation & demo guide
```
