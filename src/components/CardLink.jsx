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
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1.5rem 2rem',
        maxWidth: '400px',
        width: '100%',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'normal',
        marginBottom: '0.5rem',
        color: '#111'
      }}>
        {title}
      </h2>
      <p style={{ fontSize: '1rem', color: '#777' }}>
        {description}
      </p>
    </a>
  )
}

export default CardLink