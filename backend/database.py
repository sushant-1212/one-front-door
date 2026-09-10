import sqlite3
import json
import os
import random
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "one_front_door.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Audit Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        query TEXT NOT NULL,
        routed_domain TEXT NOT NULL,
        confidence REAL NOT NULL,
        scores_json TEXT NOT NULL,
        latency_ms REAL NOT NULL,
        rbac_status TEXT NOT NULL,
        response_preview TEXT NOT NULL
    )
    """)
    
    # Support Tickets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        timestamp TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        category TEXT NOT NULL,
        issue_summary TEXT NOT NULL,
        troubleshooting_log TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        assigned_team TEXT NOT NULL
    )
    """)
    
    # Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        active_domain TEXT,
        domain_state_json TEXT,
        last_activity TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def log_audit_event(
    user_id: str,
    user_name: str,
    user_role: str,
    query: str,
    routed_domain: str,
    confidence: float,
    scores: Dict[str, float],
    latency_ms: float,
    rbac_status: str,
    response_preview: str
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO audit_logs (
        timestamp, user_id, user_name, user_role, query,
        routed_domain, confidence, scores_json, latency_ms, rbac_status, response_preview
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now, user_id, user_name, user_role, query,
        routed_domain, round(confidence, 4), json.dumps(scores),
        round(latency_ms, 2), rbac_status, response_preview[:250]
    ))
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return log_id

def create_support_ticket(
    user_id: str,
    user_name: str,
    category: str,
    issue_summary: str,
    troubleshooting_log: str,
    priority: str = "HIGH",
    assigned_team: str = "Tier-2 Network Operations"
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    ticket_id = f"INC-{random.randint(10000, 99999)}"
    
    cursor.execute("""
    INSERT INTO support_tickets (
        ticket_id, timestamp, user_id, user_name, category,
        issue_summary, troubleshooting_log, status, priority, assigned_team
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id, now, user_id, user_name, category,
        issue_summary, troubleshooting_log, "OPEN", priority, assigned_team
    ))
    conn.commit()
    conn.close()
    
    return {
        "ticket_id": ticket_id,
        "timestamp": now,
        "user_name": user_name,
        "category": category,
        "issue_summary": issue_summary,
        "status": "OPEN",
        "priority": priority,
        "assigned_team": assigned_team,
        "troubleshooting_log": troubleshooting_log
    }

def get_recent_audit_logs(limit: int = 50, domain: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if domain and domain != "all":
        cursor.execute("SELECT * FROM audit_logs WHERE routed_domain = ? ORDER BY id DESC LIMIT ?", (domain, limit))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        item = dict(row)
        try:
            item["scores"] = json.loads(item["scores_json"])
        except Exception:
            item["scores"] = {}
        results.append(item)
    return results

def get_all_tickets() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM support_tickets ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_observability_metrics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM audit_logs")
    total_queries = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence), AVG(latency_ms) FROM audit_logs")
    avg_row = cursor.fetchone()
    avg_confidence = round(avg_row[0] or 0.0, 3)
    avg_latency = round(avg_row[1] or 0.0, 1)
    
    cursor.execute("SELECT routed_domain, COUNT(*) FROM audit_logs GROUP BY routed_domain")
    domain_distribution = {row[0]: row[1] for row in cursor.fetchall()}
    
    cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE rbac_status = 'DENIED'")
    rbac_denials = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE routed_domain = 'clarify'")
    clarifications_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM support_tickets")
    total_tickets = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "total_queries": total_queries,
        "avg_confidence": avg_confidence,
        "avg_latency_ms": avg_latency,
        "domain_distribution": domain_distribution,
        "rbac_denials": rbac_denials,
        "clarifications_count": clarifications_count,
        "total_tickets": total_tickets
    }

def get_or_create_session(session_id: str, user_id: str, user_name: str, user_role: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    now = datetime.now().isoformat()
    
    if row:
        session = dict(row)
        cursor.execute("UPDATE sessions SET user_role = ?, last_activity = ? WHERE session_id = ?", (user_role, now, session_id))
        conn.commit()
    else:
        cursor.execute("""
        INSERT INTO sessions (session_id, user_id, user_name, user_role, active_domain, domain_state_json, last_activity)
        VALUES (?, ?, ?, ?, NULL, NULL, ?)
        """, (session_id, user_id, user_name, user_role, now))
        conn.commit()
        session = {
            "session_id": session_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role,
            "active_domain": None,
            "domain_state_json": None,
            "last_activity": now
        }
    conn.close()
    return session

def update_session_state(session_id: str, active_domain: Optional[str], state_data: Optional[Dict[str, Any]]):
    conn = get_db_connection()
    cursor = conn.cursor()
    state_str = json.dumps(state_data) if state_data else None
    cursor.execute("""
    UPDATE sessions SET active_domain = ?, domain_state_json = ?, last_activity = ?
    WHERE session_id = ?
    """, (active_domain, state_str, datetime.now().isoformat(), session_id))
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
