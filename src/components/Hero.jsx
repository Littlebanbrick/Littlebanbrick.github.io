function Hero() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 8vw, 3.5rem)',
        fontWeight: 'normal',
        color: '#111',
        marginBottom: '1rem'
      }}>
        Hello, world.
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.8'
      }}>
        This is a minimal, elegant home page — built with React and a love for simplicity.
      </p>
    </div>
  )
}

export default Hero