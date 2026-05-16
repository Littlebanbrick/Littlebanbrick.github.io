import { useState } from 'react';
import Header from './Header';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';

function ContentLayout({ onBackToCover, toggleTheme, theme }) {
  const [showArrow, setShowArrow] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header 放在顶部 */}
      <Header toggleTheme={toggleTheme} theme={theme} />

      {/* 顶部热区，用于返回封面 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '30px',
          zIndex: 500,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: '5px',
        }}
        onMouseEnter={() => setShowArrow(true)}
        onMouseLeave={() => setShowArrow(false)}
        onClick={onBackToCover}
      >
        <i
          className="fa-solid fa-chevron-up"
          style={{
            fontSize: '1.5rem',
            color: 'var(--text)',
            opacity: showArrow ? 1 : 0,
            transform: showArrow ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        ></i>
      </div>

      {/* 三栏内容区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}
      >
        <div style={{ width: '25%', paddingRight: '1rem' }}>
          <LeftPanel />
        </div>
        <div style={{ width: '50%', padding: '0 1rem' }}>
          <CenterPanel />
        </div>
        <div style={{ width: '25%', paddingLeft: '1rem' }}>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default ContentLayout;