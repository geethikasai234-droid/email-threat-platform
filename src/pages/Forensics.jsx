function Forensics() {
  const data = JSON.parse(
    localStorage.getItem("threatIntelAnalysis") || "null"
  );

  if (!data) {
    return (
      <div className="forensics-page">
        <h1>🔎 Email Forensics</h1>

        <div className="risk-card">
          No investigation data found.
          <br />
          Please analyze an email first.
        </div>
      </div>
    );
  }

  return (
    <div className="forensics-page">
      <h1>🔎 Email Forensics</h1>

      <p className="subtitle">
        Detailed forensic investigation of the analyzed email.
      </p>

      <div className="forensic-summary">
        <div className="summary-card">
          <span>Threat Score</span>
          <strong>{data.threatScore}/100</strong>
        </div>

        <div className="summary-card">
          <span>Threat Level</span>
          <strong>{data.threatLevel}</strong>
        </div>

        <div className="summary-card">
          <span>Classification</span>
          <strong>{data.classification}</strong>
        </div>

        <div className="summary-card">
          <span>URLs Found</span>
          <strong>{data.urls.length}</strong>
        </div>
      </div>

      <div className="forensic-section">
        <h2>📧 Email Information</h2>

        <div className="info-grid">
          <div>
            <span>Sender</span>
            <p>{data.sender}</p>
          </div>

          <div>
            <span>Associated IP</span>
            <p>{data.ip}</p>
          </div>

          <div>
            <span>Classification</span>
            <p>{data.classification}</p>
          </div>

          <div>
            <span>URLs</span>
            <p>{data.urls.length} detected</p>
          </div>
        </div>
      </div>

      <div className="forensic-section">
        <h2>🛡️ Email Authentication</h2>

        <div className="auth-grid">
          <div className="auth-card">
            <h3>SPF</h3>
            <strong>{data.spf}</strong>
            <p>Sender authentication</p>
          </div>

          <div className="auth-card">
            <h3>DKIM</h3>
            <strong>{data.dkim}</strong>
            <p>Digital signature</p>
          </div>

          <div className="auth-card">
            <h3>DMARC</h3>
            <strong>{data.dmarc}</strong>
            <p>Domain protection</p>
          </div>
        </div>
      </div>

      <div className="forensic-section">
        <h2>⚠️ Threat Indicators</h2>

        <div className="indicator-list">
          {data.indicators.map((item, index) => (
            <div key={index}>⚠️ {item}</div>
          ))}
        </div>
      </div>

      <div className="forensic-section">
        <h2>🔗 Detected URLs</h2>

        {data.urls.length === 0 ? (
          <p>No URLs detected.</p>
        ) : (
          data.urls.map((url, index) => (
            <p key={index}>
              🔗 URL {index + 1}: {url}
            </p>
          ))
        )}
      </div>

      <div className="final-assessment">
        <h2>🚨 Forensic Assessment</h2>

        <p>
          The investigation identified multiple indicators that require
          further verification.
        </p>

        <div className="assessment-status">
          {data.threatLevel}
        </div>
      </div>
    </div>
  );
}

export default Forensics;