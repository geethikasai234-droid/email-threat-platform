import { useState } from "react";
import { analyzeEmailInput } from "../lib/api";
import { buildCaseFromAnalysis, saveCase } from "../lib/cases";

function EmailAnalysis() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeEmail = async () => {
    if (!email.trim()) {
      setError("Please paste an email first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeEmailInput(email);
      setResult(data);
      localStorage.setItem("threatIntelAnalysis", JSON.stringify(data));
      saveCase(buildCaseFromAnalysis(data));
    } catch (err) {
      setError(err.message || "Unable to analyze this email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-analysis-page">
      <h1>📧 Email Threat Analysis</h1>

      <p className="subtitle">Analyze suspicious emails and identify potential threats.</p>

      <div className="geo-input-card">
        <h2>Enter Email Message</h2>

        <textarea
          rows="12"
          placeholder="Paste a suspicious email or phishing message..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={analyzeEmail} disabled={loading}>
          {loading ? "Analyzing..." : "🔍 Analyze Email"}
        </button>

        {error && <div className="error-box">{error}</div>}
      </div>

      {result && (
        <div className="forensic-section">
          <h2>📊 Analysis Result</h2>

          <div className="report-grid">
            <div className="report-card">
              <span>Threat Score</span>
              <strong>{result.threatScore}/100</strong>
            </div>

            <div className="report-card">
              <span>Threat Level</span>
              <strong>{result.threatLevel}</strong>
            </div>

            <div className="report-card">
              <span>Classification</span>
              <strong>{result.classification}</strong>
            </div>

            <div className="report-card">
              <span>URLs Detected</span>
              <strong>{result.urls.length}</strong>
            </div>
          </div>

          <div className="risk-card">
            <h3>⚠️ Threat Indicators</h3>

            {result.indicators.map((indicator, index) => (
              <p key={`${indicator}-${index}`}>• {indicator}</p>
            ))}
          </div>

          <div className="risk-card">
            <h3>🧠 AI Summary</h3>
            <p>{result.summary}</p>
          </div>

          <p>✅ Analysis saved. You can now open GeoLocation, Forensics, and Reports.</p>
        </div>
      )}
    </div>
  );
}

export default EmailAnalysis;