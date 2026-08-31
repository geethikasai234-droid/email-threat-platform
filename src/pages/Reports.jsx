function Reports() {
  const data = JSON.parse(localStorage.getItem("threatIntelAnalysis") || "null");

  if (!data) {
    return (
      <div className="reports-page">
        <h1>📋 Threat Investigation Report</h1>

        <div className="risk-card">
          No report data available.
          <br />
          Please analyze an email first.
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📋 Threat Investigation Report</h1>

      <p className="subtitle">Consolidated report generated from the email investigation.</p>

      <div className="report-header">
        <div>
          <span>Report ID</span>
          <strong>RPT-2026-001</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>COMPLETED</strong>
        </div>

        <div>
          <span>Classification</span>
          <strong>{data.classification}</strong>
        </div>
      </div>

      <div className="report-section">
        <h2>🚨 Threat Summary</h2>

        <div className="report-grid">
          <div className="report-card">
            <span>Threat Score</span>
            <strong>{data.threatScore}/100</strong>
          </div>

          <div className="report-card">
            <span>Threat Level</span>
            <strong>{data.threatLevel}</strong>
          </div>

          <div className="report-card">
            <span>URLs Detected</span>
            <strong>{data.urls.length}</strong>
          </div>

          <div className="report-card">
            <span>Indicators</span>
            <strong>{data.indicators.length}</strong>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h2>🔍 Investigation Results</h2>

        <div className="analysis-result">
          <p><strong>Sender:</strong> {data.sender || "unknown"}</p>
          <p><strong>IP Address:</strong> {data.ip || "203.0.113.45"}</p>
          <p><strong>Classification:</strong> {data.classification}</p>
          <p><strong>SPF:</strong> {data.spf}</p>
          <p><strong>DKIM:</strong> {data.dkim}</p>
          <p><strong>DMARC:</strong> {data.dmarc}</p>
        </div>
      </div>

      <div className="report-section">
        <h2>⚠️ Detected Indicators</h2>

        <ul className="report-indicators">
          {data.indicators.map((indicator, index) => (
            <li key={`${indicator}-${index}`}>{indicator}</li>
          ))}
        </ul>
      </div>

      <div className="recommendation">
        <h2>🛡️ Recommended Action</h2>
        <p>
          Treat the analyzed email as suspicious and verify the sender, authentication results and links before any action.
        </p>
      </div>

      <div className="report-footer">
        <p>ThreatIntel • Email Threat Investigation Platform</p>
        <p>SIH Prototype Investigation Report</p>
      </div>
    </div>
  );
}

export default Reports;