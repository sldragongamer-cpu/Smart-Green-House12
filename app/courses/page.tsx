"use client";

import Sidebar from "../components/Sidebar";
import { BookOpen, ArrowRight, Clock, Award } from "lucide-react";

const COURSES = [
  { id: "c1", title: "Getting Started with IoT", lessons: 8, duration: "2 hours", level: "Beginner", progress: 100 },
  { id: "c2", title: "ESP32 Fundamentals", lessons: 12, duration: "3 hours", level: "Intermediate", progress: 60 },
  { id: "c3", title: "Cloud Dashboard Design", lessons: 6, duration: "1.5 hours", level: "Intermediate", progress: 0 },
  { id: "c4", title: "Advanced Sensor Integration", lessons: 10, duration: "4 hours", level: "Advanced", progress: 0 },
];

export default function Courses() {
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
          <h1>Courses</h1>
        </div>

        <div className="dashboard-grid">
          {COURSES.map((c) => (
            <div key={c.id} className="dashboard-card" style={{ cursor: "pointer" }}>
              <div className="dashboard-card-cover" style={{ background: c.progress === 100 ? "linear-gradient(135deg, #059669, #34d399)" : c.progress > 0 ? "linear-gradient(135deg, #00979d, #00bcd4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <BookOpen size={40} color="#fff" className="cover-icon" />
                <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>{c.level}</span>
              </div>
              <div className="dashboard-card-body">
                <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{c.title}</h3>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-light)", marginBottom: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12} />{c.lessons} lessons</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{c.duration}</span>
                </div>
                {c.progress > 0 && (
                  <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${c.progress}%`, height: "100%", background: "var(--teal)", borderRadius: 4 }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--text-light)" }}>{c.progress === 100 ? <><Award size={12} style={{ color: "#f59e0b" }} /> Completed</> : `${c.progress}% complete`}</span>
                  <ArrowRight size={14} style={{ color: "var(--teal)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
