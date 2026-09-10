import os
import sys
import json
import streamlit as st
import pandas as pd

# Set path to import database from backend
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import database

st.set_page_config(
    page_title="One Front Door — Admin & Observability",
    page_icon="🚪",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🚪 One Front Door — Enterprise Observability & Audit Center")
st.caption("Microsoft Innovate 2026 | Real-time Routing Telemetry, RBAC Auditing & Incident Backlog")

# Fetch latest metrics
metrics = database.get_observability_metrics()
tickets = database.get_all_tickets()
logs = database.get_recent_audit_logs(limit=100)

# Top KPI Metric Cards
col1, col2, col3, col4, col5 = st.columns(5)
with col1:
    st.metric("Total Inquiries", metrics["total_queries"])
with col2:
    st.metric("Avg Router Confidence", f"{int(metrics['avg_confidence'] * 100)}%")
with col3:
    st.metric("Avg Latency", f"{metrics['avg_latency_ms']} ms")
with col4:
    st.metric("RBAC Policy Gates", metrics["rbac_denials"])
with col5:
    st.metric("Escalated IT Tickets", metrics["total_tickets"])

st.markdown("---")

tab1, tab2, tab3 = st.tabs(["📊 Routing Analytics", "📜 Live Compliance Audit Trail", "🎫 Incident Tickets Backlog"])

with tab1:
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("Queries by Routed Domain")
        if metrics["domain_distribution"]:
            domain_df = pd.DataFrame(
                list(metrics["domain_distribution"].items()),
                columns=["Domain", "Count"]
            ).sort_values("Count", ascending=False)
            st.bar_chart(domain_df.set_index("Domain"))
        else:
            st.info("No queries recorded yet. Send inquiries through the chat interface to populate telemetry.")
            
    with c2:
        st.subheader("Confidence & Latency Distribution")
        if logs:
            log_df = pd.DataFrame(logs)
            log_df["confidence_pct"] = (log_df["confidence"] * 100).round(1)
            st.line_chart(log_df[["confidence_pct", "latency_ms"]].head(25))
        else:
            st.info("Awaiting telemetry data.")

with tab2:
    st.subheader("Enterprise Audit Log (Immutable Record)")
    
    col_filter1, col_filter2 = st.columns(2)
    with col_filter1:
        domain_filter = st.selectbox("Filter by Domain", ["All", "hr", "it", "finance", "clarify", "rbac_denied"])
    with col_filter2:
        role_filter = st.selectbox("Filter by User Role", ["All", "Employee", "Manager", "Executive"])
        
    filtered_logs = logs
    if domain_filter != "All":
        filtered_logs = [l for l in filtered_logs if l.get("routed_domain") == domain_filter]
    if role_filter != "All":
        filtered_logs = [l for l in filtered_logs if l.get("user_role") == role_filter]
        
    if filtered_logs:
        table_data = []
        for l in filtered_logs:
            table_data.append({
                "Timestamp": l.get("timestamp")[:19].replace("T", " "),
                "User": f"{l.get('user_name')} ({l.get('user_role')})",
                "Query": l.get("query"),
                "Domain": l.get("routed_domain").upper(),
                "Confidence": f"{int(l.get('confidence', 0) * 100)}%",
                "Latency": f"{l.get('latency_ms')} ms",
                "RBAC": "🛡️ " + l.get("rbac_status")
            })
        st.dataframe(pd.DataFrame(table_data), use_container_width=True)
        
        with st.expander("🔍 Inspect Selected Record Cosine Similarity Vectors"):
            st.json(filtered_logs[0].get("scores", {}))
    else:
        st.info("No audit logs matching current filter.")

with tab3:
    st.subheader("Escalated IT & General Support Tickets")
    if tickets:
        ticket_df = pd.DataFrame(tickets)
        display_cols = ["ticket_id", "timestamp", "user_name", "category", "issue_summary", "priority", "status", "assigned_team"]
        st.dataframe(ticket_df[display_cols], use_container_width=True)
    else:
        st.info("No tickets escalated yet. Trigger an IT escalation step in chat to observe ticket generation.")

st.markdown("---")
st.caption("🔒 One Front Door Orchestration Layer • Microsoft Innovate 2026 Submission")
