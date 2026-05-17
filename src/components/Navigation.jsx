function Navigation({ activeSection, onSectionChange }) {
  const sections = [
    { key: "blog", label: "My Blog" },
    { key: "notes", label: "Study Notes" },
    { key: "essays", label: "Essays" },
  ];

  return (
    <nav style={{ padding: "1rem 0" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {sections.map((sec) => (
          <li key={sec.key} style={{ marginBottom: "0.5rem" }}>
            <button
              onClick={() => onSectionChange(sec.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                color: "var(--text)",
                cursor: "pointer",
                borderRadius: "4px",
                backgroundColor:
                  activeSection === sec.key ? "var(--bg-card)" : "transparent",
                borderLeft:
                  activeSection === sec.key
                    ? "3px solid var(--text)"
                    : "3px solid transparent",
                transition: "background-color 0.2s, border-left 0.2s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-card)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeSection === sec.key ? "var(--bg-card)" : "transparent")
              }
            >
              {sec.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;
