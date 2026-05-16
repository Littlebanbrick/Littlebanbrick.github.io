import { useState } from 'react'

function Cover({ onClick, onAnimationEnd }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClick = () => {
    setIsExiting(true)
    onClick() // 通知父组件切换模式
  }

  const coverStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
      url('https://i.imgur.com/Y9sQmXI.jpeg') center/cover no-repeat
    `,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    transition: 'transform 0.7s cubic-bezier(0.65, 0.05, 0.36, 1)',
    transform: isExiting ? 'translateY(-100%)' : 'translateY(0)',
  }

  return (
    <div
      style={coverStyle}
      onClick={handleClick}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'transform' && isExiting) {
          onAnimationEnd() // 告诉父组件动画完成
        }
      }}
    >
      <div style={{
        textAlign: 'center',
        color: '#fff',
        userSelect: 'none'
      }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 12vw, 6rem)',
          fontWeight: 'normal',
          letterSpacing: '0.05em',
          textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
          marginBottom: '1rem'
        }}>
          Hello, world.
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.9,
          textShadow: '1px 1px 5px rgba(0,0,0,0.3)'
        }}>
          Click anywhere to explore
        </p>
      </div>
    </div>
  )
}

export default Cover