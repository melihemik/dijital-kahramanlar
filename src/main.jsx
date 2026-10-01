import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "32px",
            color: "#fff",
            background: "#0f172a",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace"
          }}
        >
          <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>Bir hata oluştu</h2>
          <pre
            style={{
              background: "#1e293b",
              padding: "16px",
              borderRadius: "8px",
              maxWidth: "800px",
              overflow: "auto",
              color: "#f8fafc",
              fontSize: "14px",
              lineHeight: 1.5
            }}
          >
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
