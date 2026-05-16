import Header from './components/Header'
import Hero from './components/Hero'
import CardLink from './components/CardLink'

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '2rem',
      maxWidth: '960px',
      margin: '0 auto'
    }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Hero />
        <section style={{
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <CardLink
            href="https://littlebanbrick.cn"
            title="My Blog"
            description="Read more on littlebanbrick.cn"
          />
        </section>
      </main>
    </div>
  )
}

export default App