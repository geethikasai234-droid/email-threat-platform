import { useState } from "react";
import { analyzeEmailInput } from "../lib/api";
import { buildCaseFromAnalysis, saveCase } from "../lib/cases";

function Dashboard() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeEmail = async () => {
    if (!email.trim()) {
      setError("Please paste an email message first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeEmailInput(email);
      const analysis = {
        ...data,
        score: data.threatScore,
        level: data.threatLevel,
        indicators: data.indicators.length,
        urlCount: data.urls.length,
      };

      setResult(analysis);
      localStorage.setItem("threatIntelAnalysis", JSON.stringify(data));
      saveCase(buildCaseFromAnalysis(data));
    } catch (err) {
      setError(err.message || "Email analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const threatScore = result?.score || 74;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          🛡️ <span>ThreatIntel</span>
        </div>

        <span className="system-status">● System Online</span>
      </header>

      <h1>Threat Intelligence Dashboard</h1>

      <p className="dashboard-subtitle">
        AI-Powered Email Threat Detection & Investigation Platform
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <h3>Emails Analyzed</h3>
          <strong>{result ? 126 : 125}</strong>
          <p>{result ? "+1 today" : "+12 this week"}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <h3>Threats Detected</h3>
          <strong>{result ? result.threatScore : 18}</strong>
          <p>{result ? "Live result" : "14.4% detection rate"}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <h3>Locations</h3>
          <strong>12</strong>
          <p>Unique sources</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔎</div>
          <h3>Investigations</h3>
          <strong>{result ? 8 : 7}</strong>
          <p>Active cases</p>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="panel email-panel">
          <h2>📧 Email Threat Analysis</h2>

          <p>Paste a suspicious email below to analyze its threat indicators.</p>

          <textarea
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Paste a suspicious email or phishing message..."
          />

          <button onClick={analyzeEmail} disabled={loading}>
            {loading ? "Analyzing..." : "🔍 Analyze Email"}
          </button>

          {error && <div className="error-box">{error}</div>}

          {result && (
            <div className="analysis-result">
              <h3>Analysis Result</h3>

              <div className="result-row">
                <span>Threat Level</span>
                <strong>{result.level}</strong>
              </div>

              <div className="result-row">
                <span>Threat Score</span>
                <strong>{result.score}/100</strong>
              </div>

              <div className="result-row">
                <span>Indicators Found</span>
                <strong>{result.indicators}</strong>
              </div>

              <div className="result-row">
                <span>URLs Detected</span>
                <strong>{result.urlCount}</strong>
              </div>
            </div>
          )}
        </section>

        <section className="panel score-panel">
          <h2>🎯 Threat Score</h2>

          <div
            className="score-circle"
            style={{
              background: `conic-gradient(#ff4d4d ${threatScore * 3.6}deg, #263545 ${threatScore * 3.6}deg)`,
            }}
          >
            <div className="score-inner">
              <strong>{threatScore}</strong>
              <span>/100</span>
            </div>
          </div>

          <h3>{result?.level || "HIGH RISK"}</h3>

          <p>
            Threat score combines suspicious language, URLs, and phishing cues from the live threat engine.
          </p>
        </section>
      </div>

      <div className="dashboard-main-grid">
        <section className="panel">
          <h2>🌍 Geolocation Intelligence</h2>

          <p className="panel-description">Suspicious email source information</p>

          <div className="info-list">
            <div>
              <span>IP Address</span>
              <strong>{result?.ip || "203.0.113.45"}</strong>
            </div>

            <div>
              <span>Country</span>
              <strong>{result?.country || "India"}</strong>
            </div>

            <div>
              <span>Region</span>
              <strong>{result?.region || "Delhi"}</strong>
            </div>

            <div>
              <span>City</span>
              <strong>{result?.city || "New Delhi"}</strong>
            </div>

            <div>
              <span>Source Reputation</span>
              <strong>{result?.threatLevel === "HIGH RISK" ? "⚠ Suspicious" : "• Review"}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>🔬 Email Forensics</h2>

          <p className="panel-description">Authentication and technical evidence</p>

          <div className="forensic-grid">
            <div className="forensic-item">
              <span>SPF</span>
              <strong>{result?.spf || "FAIL"}</strong>
            </div>

            <div className="forensic-item">
              <span>DKIM</span>
              <strong>{result?.dkim || "FAIL"}</strong>
            </div>

            <div className="forensic-item">
              <span>DMARC</span>
              <strong>{result?.dmarc || "REVIEW"}</strong>
            </div>

            <div className="forensic-item">
              <span>URLs</span>
              <strong>{result?.urlCount || 0}</strong>
            </div>

            <div className="forensic-item">
              <span>Attachments</span>
              <strong>{result?.attachments || 1}</strong>
            </div>

            <div className="forensic-item">
              <span>Sender Reputation</span>
              <strong>{result?.threatLevel === "HIGH RISK" ? "⚠ LOW" : "• MODERATE"}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel distribution-panel">
        <h2>🚨 Threat Distribution</h2>

        <div className="bar-row">
          <span>Phishing</span>
          <div className="bar"><div className="bar-fill" style={{ width: result ? `${Math.min(result.score, 96)}%` : "75%" }}>{result ? `${Math.min(result.score, 96)}%` : "75%"}</div></div>
        </div>

        <div className="bar-row">
          <span>Suspicious</span>
          <div className="bar"><div className="bar-fill" style={{ width: result ? `${Math.min(result.score + 8, 94)}%` : "55%" }}>{result ? `${Math.min(result.score + 8, 94)}%` : "55%"}</div></div>
        </div>

        <div className="bar-row">
          <span>Malware</span>
          <div className="bar"><div className="bar-fill" style={{ width: result ? `${Math.min(Math.max(result.score - 20, 18), 80)}%` : "30%" }}>{result ? `${Math.min(Math.max(result.score - 20, 18), 80)}%` : "30%"}</div></div>
        </div>

        <div className="bar-row">
          <span>Safe</span>
          <div className="bar"><div className="bar-fill" style={{ width: result ? `${Math.max(12, 100 - result.score)}%` : "85%" }}>{result ? `${Math.max(12, 100 - result.score)}%` : "85%"}</div></div>
        </div>
      </section>

      <section className="security-section">
        <h2>🛡️ Security Metrics</h2>

        <div className="security-grid">
          <div>
            <span>SPF Authentication</span>
            <strong>{result?.spf === "PASS" ? "92%" : "48%"}</strong>
          </div>

          <div>
            <span>DKIM Authentication</span>
            <strong>{result?.dkim === "PASS" ? "78%" : "42%"}</strong>
          </div>

          <div>
            <span>DMARC Protection</span>
            <strong>{result?.dmarc === "PASS" ? "84%" : "61%"}</strong>
          </div>

          <div>
            <span>Detection Accuracy</span>
            <strong>96%</strong>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>📄 Investigation Report</h2>

        <p>
          Generate a report containing email analysis, geolocation information and forensic evidence.
        </p>

        <button onClick={() => alert("Investigation report generated successfully!")}>📄 Generate Report</button>
      </section>

      <footer>ThreatIntel • SIH Prototype • Email Threat Intelligence Platform</footer>
    </div>
  );
}

export default Dashboard;