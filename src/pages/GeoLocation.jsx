import { useState } from "react";
import { analyzeGeoIP } from "../lib/api";

function GeoLocation() {
  const savedData = JSON.parse(localStorage.getItem("threatIntelAnalysis") || "null");

  const [ip, setIp] = useState(savedData?.ip || "103.22.44.10");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeIP = async () => {
    if (!ip.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await analyzeGeoIP(ip);
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to analyze IP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="geo-page">
      <h1>🌍 GeoLocation Intelligence</h1>

      <p className="subtitle">Analyze the geographical origin associated with the investigation.</p>

      {savedData && (
        <div className="risk-card">
          📧 Investigation loaded from Email Analysis
          <br />
          Threat Level: <strong>{savedData.threatLevel}</strong>
        </div>
      )}

      <div className="geo-input-card">
        <h2>IP Address Analysis</h2>

        <input
          type="text"
          placeholder="Enter IP address..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />

        <button onClick={analyzeIP} disabled={loading}>
          {loading ? "Checking location..." : "🌍 Analyze Location"}
        </button>

        {error && <div className="error-box">{error}</div>}
      </div>

      {result && (
        <div className="geo-results">
          <h2>📍 Location Intelligence</h2>

          <div className="geo-grid">
            <div className="geo-card">
              <span>Country</span>
              <strong>{result.country}</strong>
            </div>

            <div className="geo-card">
              <span>City</span>
              <strong>{result.city}</strong>
            </div>

            <div className="geo-card">
              <span>Region</span>
              <strong>{result.region}</strong>
            </div>

            <div className="geo-card">
              <span>ISP</span>
              <strong>{result.org}</strong>
            </div>

            <div className="geo-card">
              <span>Latitude</span>
              <strong>{result.latitude}</strong>
            </div>

            <div className="geo-card">
              <span>Longitude</span>
              <strong>{result.longitude}</strong>
            </div>
          </div>

          <div className="risk-card">
            ⚠️ Location Risk: <strong>{result.risk}</strong>
          </div>

          <div className="map-placeholder">
            <div className="map-pin">📍</div>
            <h3>{result.city}, {result.country}</h3>
            <p>Coordinates: {result.latitude}, {result.longitude}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeoLocation;