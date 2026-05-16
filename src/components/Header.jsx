function Header({ toggleTheme, theme }) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          fontSize: '1.2rem',
          fontWeight: 'normal',
          letterSpacing: '0.05em',
          color: 'var(--header-text)',
        }}
      >
        Littlebanbrick
      </span>
      <button
        onClick={toggleTheme}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: '2.5rem',
          height: '2.5rem',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-card)',
        }}
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? (
          <i className="fa-regular fa-moon"></i>
        ) : (
          <i className="fa-regular fa-sun"></i>
        )}
      </button>
    </header>
  );
}

export default Header;