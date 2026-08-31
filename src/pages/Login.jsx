import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      alert("Please enter a username.");
      return;
    }

    localStorage.setItem("threatIntelUser", trimmed);
    onLogin(trimmed);
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-badge">ThreatIntel</div>
        <h1>Security Operations Login</h1>
        <p>AI-powered email threat detection and investigation console</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button type="submit">Login to Dashboard</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
