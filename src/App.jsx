import { useState, useEffect } from "react";
import Cover from "./components/Cover";
import ContentLayout from "./components/ContentLayout";

function App() {
  const [theme, setTheme] = useState("light");
  const [stage, setStage] = useState("cover"); // 'cover' | 'cover-exit' | 'content' | 'content-exit'

  // 主题逻辑
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // 封面点击 → 开始退出动画
  const handleCoverClick = () => {
    setStage("cover-exit");
  };

  // 封面退出动画结束 → 进入内容阶段
  const handleCoverExitEnd = () => {
    setStage("content");
  };

  // 从内容区返回封面 → 内容区开始退出动画
  const handleBackToCover = () => {
    setStage("content-exit");
  };

  // 内容区退出动画结束 → 封面重新进入
  const handleContentExitEnd = () => {
    setStage("cover");
  };

  // 根据 stage 决定组件的动画类名
  const coverClassName =
    stage === "cover" || stage === "cover-exit"
      ? "cover-visible"
      : "cover-hidden";
  const contentClassName =
    stage === "content" || stage === "content-exit"
      ? "content-visible"
      : "content-hidden";

  return (
    <>
      <Cover
        stage={stage}
        onCoverClick={handleCoverClick}
        onCoverExitEnd={handleCoverExitEnd}
      />
      <ContentLayout
        stage={stage}
        onBackToCover={handleBackToCover}
        onContentExitEnd={handleContentExitEnd}
        toggleTheme={toggleTheme}
        theme={theme}
      />
    </>
  );
}

export default App;
