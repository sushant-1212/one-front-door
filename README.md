# 🚪 One Front Door — Enterprise AI Multi-Agent Orchestration Platform

> A unified, high-performance enterprise gateway that intelligently classifies employee inquiries, dynamically routes them to authoritative specialist agents (**HR Policy RAG**, **IT Support State-Machine**, **Finance Ledger Engine**), resolves ambiguity through interactive clarification, enforces Role-Based Access Control (RBAC), and maintains immutable compliance audit logs.

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-12%20Passed-success.svg)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero API Keys Required](https://img.shields.io/badge/API%20Keys-None%20Required%20(100%25%20Offline)-brightgreen.svg)]()

---

## ⚡ Key Highlights & Engineering Principles

- **Zero External API Dependencies / 100% Offline Autonomous**: Runs entirely locally on your CPU with sub-5ms latency. Requires **NO OpenAI, Groq, or third-party API keys**, eliminating external rate limits, costs, and venue connectivity risks.
- **Explainable Intent Classification**: Powered by sub-linear TF-IDF semantic embeddings and Cosine Similarity matrices against domain anchor corpora. Mathematical confidence vectors can be inspected live.
- **Subsumed Multi-Agent Architecture**:
  - **HR Policy Specialist**: Local semantic RAG engine retrieving exact policy passages with verified section citations.
  - **IT Service Desk Specialist**: Finite State Machine (FSM) multi-step diagnostic tree with an **Identity Verification Security Gate (MFA/PIN)** and automatic ticket escalation (`#INC-XXXX`).
  - **Finance Controller Specialist**: Strict **Pandas** calculation engine executing safe aggregations over enterprise ledgers with explicit zero-hallucination refusals.
- **Enterprise Governance & RBAC**: Real-time role enforcement (`Employee`, `Manager`, `Executive`) with immediate policy intercept on restricted inquiries (e.g., executive payroll or departmental budgets).
- **Dual Observability**: Real-time in-chat telemetry inspector (similarity scores, confidence, latency) + standalone **Streamlit** compliance dashboard.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────┐
                               │   Enterprise Chat Frontend     │
                               │   (React 18 + Modern CSS)      │
                               │   - Single Omni-Input          │
                               │   - Dynamic Agent Badges       │
                               │   - Live Telemetry Drawer      │
                               │   - RBAC Persona Switcher      │
                               │   - 1-Click Demo Script Ribbon │
                               └───────────────┬────────────────┘
                                               │ POST /api/chat
                                               ▼
                               ┌────────────────────────────────┐
                               │    Orchestration Layer         │
                               │    (FastAPI Router Service)    │
                               │  1. Semantic Vector Matcher    │
                               │  2. Calibrated Confidence Gate │
                               │  3. RBAC Policy Governance     │
                               │  4. Session & FSM Memory       │
                               │  5. SQLite Compliance Audit    │
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

## 🔒 Enterprise Governance: Role-Based Access Control (RBAC)

The system embeds an enterprise access governance layer with three distinct personas:

| Role | Persona | Scope & Access Rights | Restricted Topics |
|---|---|---|---|
| **Employee** | Alex Chen (SWE II) | HR benefits, personal leave, IT self-service troubleshooting, individual expense policy. | Departmental budgets, executive compensation, personnel records. |
| **Manager** | Sarah Jenkins (Director) | All Employee access + Departmental financial ledgers, team equipment provisioning. | Company-wide executive compensation pool, board equity grants. |
| **Executive** | David Vance (VP) | Full enterprise clearance across all departmental budgets, executive compensation, and audits. | None. |

*When an unauthorized inquiry occurs, the system logs an audit event and issues a polite, governance-referenced refusal.*

---

## ⚡ 1-Click Interactive Demo Flow

The frontend features a built-in **1-Click Demo Script Ribbon** to showcase core capabilities seamlessly:

1. **Step 1: HR Policy Question**
   - *Query*: `"What is our paternity leave policy and how many weeks are paid?"`
   - *Result*: Bot classifies intent to HR (🟣 badge), highlights **12 weeks fully paid at 100% base salary**, and cites `Section 4.2: Paternity & Caregiver Leave`.
2. **Step 2: IT Troubleshooting & Auto-Ticket**
   - *Query*: `"My GlobalProtect VPN won't connect and shows error 403"`
   - *Result*: Bot walks through FSM troubleshooting (🔵 badge). Gated by identity verification (PIN `1234`), then auto-generates incident ticket `#INC-XXXX`.
3. **Step 3: Finance Budget Calculation**
   - *Query*: `"What is the remaining Q3 travel budget for the Sales department?"`
   - *Result*: Bot calculates the exact remaining balance (**$14,250 USD**) from the ledger CSV (🟢 badge) with a markdown table.
4. **Step 4: RBAC Refusal**
   - *Query*: `"Show me executive salary bands and VP compensation for 2026"`
   - *Result*: As `Employee`, the Security Gate (🔴 badge) intercepts and blocks the inquiry per **Policy RBAC-SEC-401**.
5. **Step 5: Ambiguous Query & Clarification**
   - *Query*: `"I need help with my account"`
   - *Result*: Bot detects cross-domain ambiguity (🟡 badge) and provides interactive pills (IT Login vs. HR Payroll) instead of guessing.
6. **Step 6: Observability Center**
   - View real-time telemetry, cosine similarity vectors, latency histograms, and ticket logs.

---

## 🚀 Quickstart Guide

### Option 1: 1-Click Launchers (Windows)
Run the PowerShell or batch script:
```powershell
.\start.ps1
```
or double-click `start.bat`.

### Option 2: Run Manually

1. **Install Dependencies**:
```bash
pip install -r backend/requirements.txt
```

2. **Start the FastAPI Backend & Omni Chat UI**:
```bash
python backend/main.py
```
*Access UI at `http://localhost:8000` (API documentation at `/docs`).*

3. **Start the Streamlit Admin Dashboard** (in another terminal):
```bash
streamlit run dashboard/app.py --server.port 8501
```
*Access dashboard at `http://localhost:8501`.*

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Automated Testing

Run the full automated test suite (12 tests covering intent routing, RBAC rules, citations, and calculations):
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
│   │   ├── index.css            # Modern enterprise design tokens
│   │   └── main.jsx             # React DOM entry
│   ├── index.html               # Semantic HTML5 & typography
│   ├── package.json             # Vite & React scripts
│   └── vite.config.js           # Vite dev server & API proxy
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Multi-service composition
├── start.bat                    # Windows 1-click batch launcher
├── start.ps1                    # PowerShell 1-click launcher
└── README.md                    # Project documentation & architecture
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
