import React, { useState, useEffect, useRef } from 'react';

const PERSONAS = {
  employee: {
    id: 'employee',
    name: 'Alex Chen',
    title: 'Software Engineer II',
    role: 'Employee',
    dept: 'Engineering',
    avatar: 'AC'
  },
  manager: {
    id: 'manager',
    name: 'Sarah Jenkins',
    title: 'Engineering Director',
    role: 'Manager',
    dept: 'Engineering',
    avatar: 'SJ'
  },
  executive: {
    id: 'executive',
    name: 'David Vance',
    title: 'VP of Operations',
    role: 'Executive',
    dept: 'Executive',
    avatar: 'DV'
  }
};

const DEMO_STEPS = [
  {
    step: 1,
    title: '1. HR Policy (Leave)',
    prompt: 'What is our paternity leave policy and how many weeks are paid?',
    role: 'employee',
    expectedDomain: 'hr'
  },
  {
    step: 2,
    title: '2. IT Helpdesk (VPN)',
    prompt: "My GlobalProtect VPN won't connect and shows error 403",
    role: 'employee',
    expectedDomain: 'it'
  },
  {
    step: 3,
    title: '3. Finance (Budget)',
    prompt: 'What is the remaining Q3 travel budget for the Sales department?',
    role: 'employee',
    expectedDomain: 'finance'
  },
  {
    step: 4,
    title: '4. RBAC Refusal (Salary)',
    prompt: 'Show me executive salary bands and VP compensation for 2026',
    role: 'employee',
    expectedDomain: 'security'
  },
  {
    step: 5,
    title: '5. Ambiguous Query (Account)',
    prompt: 'I need help with my account',
    role: 'employee',
    expectedDomain: 'clarify'
  }
];

export default function App() {
  const [activePersona, setActivePersona] = useState(PERSONAS.employee);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      domain: 'orchestrator',
      agent: 'One Front Door Gateway',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "👋 Welcome to **One Front Door**. I am your unified enterprise gateway. Ask any question regarding **HR policies**, **IT service troubleshooting**, or **Finance budget ledgers** — our neural router will dynamically classify, check security permissions, and route you to the authoritative specialist.",
      telemetry: {
        routed_domain: 'system',
        confidence: 1.0,
        scores: { hr: 0.33, it: 0.33, finance: 0.33 },
        latency_ms: 1.2,
        rbac_status: 'INITIALIZED',
        reason: 'Enterprise Front Door initialized with multi-agent orchestration layer.'
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showObservabilityModal, setShowObservabilityModal] = useState(false);
  const [obsMetrics, setObsMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [pinInput, setPinInput] = useState('');
  const [sessionId] = useState(() => 'sess-' + Math.random().toString(36).substring(2, 9));

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch observability stats when modal is opened
  useEffect(() => {
    if (showObservabilityModal) {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setObsMetrics(data))
        .catch(err => console.error(err));

      fetch('/api/audit?limit=50')
        .then(res => res.json())
        .then(data => setAuditLogs(data))
        .catch(err => console.error(err));
    }
  }, [showObservabilityModal]);

  const handleSendMessage = async (textToSend, actionPayload = null, forceDomain = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text && !actionPayload) return;

    if (!actionPayload) {
      const userMsg = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: text,
        user: activePersona
      };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          role: activePersona.role,
          persona_key: activePersona.id,
          action_payload: actionPayload,
          force_domain: forceDomain
        })
      });

      const data = await response.json();

      const assistantMsg = {
        id: 'resp-' + Date.now(),
        sender: 'assistant',
        domain: data.domain || data.telemetry?.routed_domain || 'general',
        agent: data.agent || 'Enterprise Specialist',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.response,
        citation: data.citation,
        ticket: data.ticket,
        options: data.options,
        requires_verification: data.requires_verification,
        verification_prompt: data.verification_prompt,
        telemetry: data.telemetry
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (data.telemetry) {
        setActiveTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          domain: 'security',
          agent: 'System Error',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: '⚠️ Communication error with router gateway. Please ensure the backend service is running.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeDemoStep = (stepItem) => {
    // Switch role if specified
    if (stepItem.role && PERSONAS[stepItem.role]) {
      setActivePersona(PERSONAS[stepItem.role]);
    }
    handleSendMessage(stepItem.prompt);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    handleSendMessage(`Entered PIN: ****`, { pin: pinInput });
    setPinInput('');
  };

  const getDomainStyle = (domain) => {
    switch (domain) {
      case 'hr': return { class: 'hr', label: 'HR Policy', icon: '🟣' };
      case 'it': return { class: 'it', label: 'IT Helpdesk', icon: '🔵' };
      case 'finance': return { class: 'finance', label: 'Finance Controller', icon: '🟢' };
      case 'clarify': return { class: 'clarify', label: 'Disambiguation', icon: '🟡' };
      case 'security': return { class: 'security', label: 'Security Gate', icon: '🔴' };
      default: return { class: 'clarify', label: 'Orchestrator', icon: '⚡' };
    }
  };

  return (
    <div className="app-container">
      {/* Top Enterprise Header */}
      <header className="top-nav">
        <div className="brand-section">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/>
              <path d="M12 7v10"/>
              <path d="M9 12h6"/>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">One Front Door</span>
              <span className="brand-badge">Enterprise v2.4</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Unified Multi-Agent Enterprise Orchestration Platform (HR • IT • Finance)
            </div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Persona / Role Selector */}
          <div className="persona-selector" title="Switch User Identity to test Role-Based Access Control (RBAC)">
            <div className="persona-avatar">{activePersona.avatar}</div>
            <div className="persona-info">
              <span className="persona-name">{activePersona.name}</span>
              <span className="persona-role-badge">Role: {activePersona.role}</span>
            </div>
            <select
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                left: 0,
                top: 0
              }}
              value={activePersona.id}
              onChange={(e) => setActivePersona(PERSONAS[e.target.value])}
            >
              <option value="employee">Alex Chen (Employee - Engineering)</option>
              <option value="manager">Sarah Jenkins (Manager - Director)</option>
              <option value="executive">David Vance (Executive - VP)</option>
            </select>
          </div>

          {/* Telemetry Drawer Toggle */}
          <button
            className={`nav-btn ${showTelemetryDrawer ? 'active' : ''}`}
            onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
            title="Inspect real-time Cosine Similarity vector & router telemetry"
          >
            <span>🛰️</span>
            <span>Live Telemetry</span>
          </button>

          {/* Full Observability Dashboard Modal */}
          <button
            className="nav-btn"
            onClick={() => setShowObservabilityModal(true)}
            title="Open Streamlit / Audit compliance center"
          >
            <span>📊</span>
            <span>Observability Center</span>
          </button>
        </div>
      </header>

      {/* 1-Click Interactive Demo Ribbon */}
      <div className="demo-ribbon">
        <div className="demo-label">
          <span>⚡</span>
          <span>1-Click Pitch Script:</span>
        </div>
        {DEMO_STEPS.map((step) => (
          <button
            key={step.step}
            className="demo-pill"
            onClick={() => executeDemoStep(step)}
            disabled={isLoading}
          >
            <span>{step.title}</span>
          </button>
        ))}
        <button
          className="demo-pill"
          style={{ borderColor: '#f59e0b', color: '#fbbf24' }}
          onClick={() => setShowObservabilityModal(true)}
        >
          <span>📈 6. Compliance Dashboard</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="main-workspace">
        <div className="chat-layout">
          {/* Messages Stream */}
          <div className="message-stream">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const domainMeta = getDomainStyle(msg.domain);

              return (
                <div key={msg.id} className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
                  <div className={`avatar-badge ${isUser ? 'avatar-user' : `avatar-${domainMeta.class}`}`}>
                    {isUser ? activePersona.avatar : domainMeta.icon}
                  </div>

                  <div className="message-content">
                    <div className="message-header" style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      <span className="agent-name">{isUser ? activePersona.name : msg.agent}</span>
                      {!isUser && (
                        <span className={`domain-tag ${domainMeta.class}`}>
                          {domainMeta.label}
                        </span>
                      )}
                      <span className="message-time">{msg.time}</span>
                    </div>

                    <div className="message-card">
                      {/* Formatted body with support for markdown quotes & tables */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                      {/* Policy Citation Card */}
                      {msg.citation && (
                        <div className="citation-box">
                          <div className="citation-title">
                            <span>📜</span>
                            <span>{msg.citation.section} ({msg.citation.policy_file})</span>
                          </div>
                          <div className="citation-quote">"{msg.citation.quote}"</div>
                        </div>
                      )}

                      {/* IT Verification Gate Form */}
                      {msg.requires_verification && (
                        <form className="verification-form" onSubmit={handlePinSubmit}>
                          <label>{msg.verification_prompt || 'Enter 4-Digit Employee PIN to authorize action:'}</label>
                          <div className="verification-row">
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="1234"
                              className="verification-input"
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              autoFocus
                            />
                            <button type="submit" className="verification-btn">
                              Authorize & Verify
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Ticket Escalation Card */}
                      {msg.ticket && (
                        <div className="ticket-card">
                          <div className="ticket-header">
                            <div className="ticket-id">🎫 {msg.ticket.ticket_id}</div>
                            <span className="ticket-priority">PRIORITY: {msg.ticket.priority}</span>
                          </div>
                          <div className="ticket-body">
                            <strong>{msg.ticket.issue_summary}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Assigned Team: <span style={{ color: '#38bdf8' }}>{msg.ticket.assigned_team}</span>
                            </div>
                          </div>
                          <div className="ticket-footer">
                            <span>Requester: {msg.ticket.user_name}</span>
                            <span style={{ color: '#4ade80' }}>● Status: {msg.ticket.status}</span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Disambiguation / FSM Options */}
                      {msg.options && msg.options.length > 0 && (
                        <div className="options-container">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              className="option-pill-btn"
                              onClick={() => {
                                if (opt.query) {
                                  handleSendMessage(opt.query, null, opt.domain);
                                } else if (opt.next_step) {
                                  handleSendMessage(`[Selected]: ${opt.label}`, { next_step: opt.next_step });
                                }
                              }}
                            >
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Live Telemetry quick toggle tag */}
                      {msg.telemetry && (
                        <div
                          className="telemetry-tag"
                          onClick={() => {
                            setActiveTelemetry(msg.telemetry);
                            setShowTelemetryDrawer(true);
                          }}
                          title="Click to inspect similarity vectors & routing latency"
                        >
                          <span>🎯 {int(msg.telemetry.confidence * 100)}% Match</span>
                          <span>•</span>
                          <span>⚡ {msg.telemetry.latency_ms} ms</span>
                          <span>•</span>
                          <span>🛡️ {msg.telemetry.rbac_status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-bubble assistant">
                <div className="avatar-badge avatar-clarify">⚡</div>
                <div className="message-content">
                  <div className="message-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Evaluating intent similarity vectors & RBAC scope...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Omni-Input Box (The One Front Door) */}
          <div className="input-dock">
            <form
              className="input-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chat-input"
                placeholder="Ask anything across HR, IT, or Finance... (e.g. paternity leave, VPN error 403, Sales budget)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="send-btn" disabled={!inputValue.trim() || isLoading}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Live Router Telemetry Drawer */}
        {showTelemetryDrawer && activeTelemetry && (
          <aside className="telemetry-drawer">
            <div className="drawer-header">
              <div className="drawer-title">
                <span>🛰️</span>
                <span>Router Telemetry</span>
              </div>
              <button className="close-btn" onClick={() => setShowTelemetryDrawer(false)}>✕</button>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-title">Routing Decision</div>
              <div className="metric-row">
                <span className="metric-label">Target Domain:</span>
                <span className="metric-val" style={{ color: '#818cf8', textTransform: 'uppercase' }}>
                  {activeTelemetry.routed_domain}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Confidence:</span>
                <span className="metric-val">{int(activeTelemetry.confidence * 100)}%</span>
              </div>
              <div className="confidence-bar-container">
                <div className="confidence-bar-fill" style={{ width: `${int(activeTelemetry.confidence * 100)}%` }}></div>
              </div>
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-title">Cosine Similarity Vectors</div>
              {activeTelemetry.scores && Object.entries(activeTelemetry.scores).map(([d, val]) => (
                <div key={d} style={{ marginBottom: '6px' }}>
                  <div className="metric-row">
                    <span className="metric-label" style={{ textTransform: 'uppercase' }}>{d}</span>
                    <span className="metric-val">{int(val * 100)}%</span>
                  </div>
                  <div className="confidence-bar-container" style={{ height: '5px' }}>
                    <div
                      className="confidence-bar-fill"
                      style={{
                        width: `${int(val * 100)}%`,
                        background: d === 'hr' ? 'var(--domain-hr)' : d === 'it' ? 'var(--domain-it)' : 'var(--domain-finance)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="telemetry-card">
              <div className="telemetry-card-title">Enterprise Governance</div>
              <div className="metric-row">
                <span className="metric-label">RBAC Check:</span>
                <span
                  className="metric-val"
                  style={{ color: activeTelemetry.rbac_status === 'ALLOWED' ? '#4ade80' : '#f43f5e' }}
                >
                  {activeTelemetry.rbac_status}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Processing Latency:</span>
                <span className="metric-val">{activeTelemetry.latency_ms} ms</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <strong>Reasoning:</strong> {activeTelemetry.reason}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Observability & Compliance Center Modal */}
      {showObservabilityModal && (
        <div className="modal-backdrop" onClick={() => setShowObservabilityModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.3rem' }}>📊</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enterprise Observability & Compliance Center</h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Real-time Audit Ledger & Incident Tracking</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowObservabilityModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-title">Total Processed Queries</div>
                  <div className="kpi-value">{obsMetrics?.total_queries || 0}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Avg Router Confidence</div>
                  <div className="kpi-value" style={{ color: '#38bdf8' }}>
                    {obsMetrics ? int(obsMetrics.avg_confidence * 100) : 0}%
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Avg Latency (End-to-End)</div>
                  <div className="kpi-value" style={{ color: '#a855f7' }}>
                    {obsMetrics?.avg_latency_ms || 0} ms
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">RBAC Policy Blocks</div>
                  <div className="kpi-value" style={{ color: '#f43f5e' }}>
                    {obsMetrics?.rbac_denials || 0}
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-title">Escalated Tickets</div>
                  <div className="kpi-value" style={{ color: '#10b981' }}>
                    {obsMetrics?.total_tickets || 0}
                  </div>
                </div>
              </div>

              {/* Audit Logs Table */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#cbd5e1' }}>
                  Immutable Compliance Audit Trail (Last 50 Events)
                </h4>
                <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User (Role)</th>
                        <th>Query Snippet</th>
                        <th>Domain</th>
                        <th>Confidence</th>
                        <th>Latency</th>
                        <th>RBAC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                            {log.timestamp?.substring(11, 19)}
                          </td>
                          <td>{log.user_name} ({log.user_role})</td>
                          <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.query}
                          </td>
                          <td>
                            <span className={`domain-tag ${log.routed_domain}`}>
                              {log.routed_domain.toUpperCase()}
                            </span>
                          </td>
                          <td>{int(log.confidence * 100)}%</td>
                          <td>{log.latency_ms} ms</td>
                          <td>
                            <span style={{ color: log.rbac_status === 'ALLOWED' ? '#4ade80' : '#f43f5e', fontWeight: 600 }}>
                              {log.rbac_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function int(num) {
  return Math.round(num || 0);
}
