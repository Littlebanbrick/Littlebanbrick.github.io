function CardLink({ href, title, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '1.5rem 2rem',
        width: '100%',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        marginBottom: '1rem'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--card-hover-shadow)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <h2 style={{
        fontSize: '1.2rem',
        fontWeight: 'normal',
        marginBottom: '0.5rem',
        color: 'var(--text)'
      }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
        {description}
      </p>
    </a>
  )
}

export default CardLink