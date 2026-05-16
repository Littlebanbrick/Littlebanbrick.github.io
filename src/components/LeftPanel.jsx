import CardLink from './CardLink'

function LeftPanel() {
  return (
    <div>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'normal',
        marginBottom: '1.5rem',
        color: 'var(--header-text)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        Links
      </h2>
      <CardLink
        href="https://littlebanbrick.cn"
        title="My Blog"
        description="Visit littlebanbrick.cn"
      />
      {/* 未来可以继续添加更多 CardLink */}
    </div>
  )
}

export default LeftPanel