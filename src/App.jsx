import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import "./App.css";
import Dashboard from "./pages/Dashboard";
import EmailAnalysis from "./pages/EmailAnalysis";
import GeoLocation from "./pages/GeoLocation";
import Forensics from "./pages/Forensics";
import Reports from "./pages/Reports";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("threatIntelUser") || "");

  const handleLogout = () => {
    localStorage.removeItem("threatIntelUser");
    setUser("");
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="brand-lockup">
            <div className="brand-mark">T</div>
            <div>
              <strong>ThreatIntel</strong>
              <span>Investigation suite</span>
            </div>
          </div>

          <div className="nav-label">Workspace</div>
          <nav className="sidebar-nav">
            <NavLink to="/" end>
              <span className="nav-icon">01</span> Dashboard
            </NavLink>
            <NavLink to="/email-analysis">
              <span className="nav-icon">02</span> Email Analysis
            </NavLink>
            <NavLink to="/geolocation">
              <span className="nav-icon">03</span> GeoLocation
            </NavLink>
            <NavLink to="/forensics">
              <span className="nav-icon">04</span> Forensics
            </NavLink>
            <NavLink to="/reports">
              <span className="nav-icon">05</span> Reports
            </NavLink>
            <NavLink to="/admin">
              <span className="nav-icon">06</span> Admin Panel
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span className="status-dot" />
            <div>
              <strong>System online</strong>
              <span>All services operational</span>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <span>Security operations center</span>
            <div className="topbar-right">
              <span className="user-pill">User: {user}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/email-analysis" element={<EmailAnalysis />} />
            <Route path="/geolocation" element={<GeoLocation />} />
            <Route path="/forensics" element={<Forensics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;