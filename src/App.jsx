import { useState, useEffect } from 'react';
import Cover from './components/Cover';
import ContentLayout from './components/ContentLayout';

function App() {
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('cover');
  const [coverAnimatedOut, setCoverAnimatedOut] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleCoverClick = () => {
    setViewMode('content');
  };

  const handleCoverAnimationEnd = () => {
    setCoverAnimatedOut(true);
  };

  const handleBackToCover = () => {
    setCoverAnimatedOut(false);
    setViewMode('cover');
  };

  return (
    <>
      {viewMode === 'cover' && (
        <Cover onClick={handleCoverClick} onAnimationEnd={handleCoverAnimationEnd} />
      )}
      {(viewMode === 'content' || coverAnimatedOut) && (
        <ContentLayout
          onBackToCover={handleBackToCover}
          toggleTheme={toggleTheme}
          theme={theme}
        />
      )}
    </>
  );
}

export default App;