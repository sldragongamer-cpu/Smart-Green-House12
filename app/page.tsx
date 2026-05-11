"use client";

import Sidebar from "./components/Sidebar";
import { FileText, BookOpen, Globe, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="layout">
      <header className="global-header">
        <div className="header-left">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <img src="/greenhouse-logo.png" alt="Greenhouse" width="22" height="22" style={{ objectFit: "contain" }} />
          </div>
          <span className="brand">Smart Green House</span>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">D M N K Premar...</span>
            <span className="user-email">lithula7@gmail.com</span>
          </div>
          <div className="user-avatar">D</div>
        </div>
      </header>

      <Sidebar />

      <main className="content">
        <div className="page-header">
          <h1>Home</h1>
          <div className="header-stats">
            <span>
              Devices <span className="stat-value">0 online</span>
            </span>
            <span>
              Things <span className="stat-value">2/2</span>
            </span>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Recent Files</h2>
          </div>
          <div className="section-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Creation Date</th>
                    <th>Opened At</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ESP32</td>
                    <td>-</td>
                    <td>May 10, 2026, 9:50 PM</td>
                    <td>lithula7@gmail.com</td>
                  </tr>
                  <tr>
                    <td>Green House Variables</td>
                    <td>Aug 11, 2025, 6:23 PM</td>
                    <td>May 7, 2026, 5:29 PM</td>
                    <td>lithula7@gmail.com</td>
                  </tr>
                  <tr>
                    <td>Green House</td>
                    <td>-</td>
                    <td>May 10, 2026, 11:49 PM</td>
                    <td>lithula7@gmail.com</td>
                  </tr>
                  <tr>
                    <td>Green_House_Variables_aug11a</td>
                    <td>Aug 11, 2025, 6:23 PM</td>
                    <td>May 10, 2026, 9:50 PM</td>
                    <td>lithula7@gmail.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Documentation</h2>
          </div>
          <div className="section-body">
            <ul className="docs-list">
              <li><FileText size={16} /> Hardware documentation</li>
              <li><BookOpen size={16} /> Discover our tutorials</li>
              <li><Globe size={16} /> Arduino Cloud APIs</li>
              <li><LayoutDashboard size={16} /> Cloud Dashboards &amp; Widgets</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
