import React from "react";

export default function Navbar({ user, onLogout }) {
  const getInitials = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  // hello
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#818cf8" }}
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Testify Admin</span>
        </div>

        {user ? (
          <div className="navbar-menu">
            <span className="navbar-item active">Dashboard</span>
            <div className="navbar-user">
              <div className="user-avatar" title={user.userId}>
                {getInitials(user.userId)}
              </div>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#cbd5e1",
                  fontWeight: 500,
                }}
              >
                {user.userId}
              </span>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-icon"
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  marginLeft: "0.5rem",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-menu">
            <span className="navbar-item">Admin Portal</span>
          </div>
        )}
      </div>
    </header>
  );
}
