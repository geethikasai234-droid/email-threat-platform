import { useEffect, useState } from "react";
import { getCases } from "../lib/cases";

function AdminPanel() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    setCases(getCases());
  }, []);

  return (
    <div className="admin-page">
      <h1>🛡️ Admin Panel</h1>
      <p className="subtitle">Security oversight and active investigation control center.</p>

      <div className="report-grid">
        <div className="report-card">
          <span>Open Cases</span>
          <strong>{cases.filter((c) => c.status === "Open").length}</strong>
        </div>
        <div className="report-card">
          <span>Flagged Signals</span>
          <strong>{cases.length}</strong>
        </div>
        <div className="report-card">
          <span>Escalations</span>
          <strong>{cases.filter((c) => c.level === "HIGH RISK").length}</strong>
        </div>
        <div className="report-card">
          <span>Analysts Online</span>
          <strong>7</strong>
        </div>
      </div>

      <div className="forensic-section">
        <h2>Recent Case Queue</h2>
        {cases.length === 0 ? (
          <div className="risk-card">No investigations recorded yet.</div>
        ) : (
          <div className="case-list">
            {cases.map((item) => (
              <div key={item.id} className="case-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <div className="case-meta">
                  <span>{item.level}</span>
                  <span>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
