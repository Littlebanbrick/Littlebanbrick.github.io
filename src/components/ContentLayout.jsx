import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import CenterPanel from "./CenterPanel";
import RightPanel from "./RightPanel";

function ContentLayout({
  stage,
  onBackToCover,
  onContentExitEnd,
  toggleTheme,
  theme,
}) {
  const [showArrow, setShowArrow] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleTransitionEnd = (e) => {
      if (e.propertyName === "transform") {
        if (stage === "content-exit") {
          onContentExitEnd();
        }
      }
    };

    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [stage, onContentExitEnd]);

  const isExiting = stage === "content-exit";
  const isVisible = stage === "content" || stage === "content-exit";

  return (
    <div
      id="content-root"
      ref={contentRef}
      className={isVisible ? "content-visible" : "content-hidden"}
      style={{
        display: isVisible ? "flex" : "none",
        flexDirection: "column",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <Header toggleTheme={toggleTheme} theme={theme} />

      {/* 顶部中央热区 */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50px",
          height: "40px",
          zIndex: 501,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: showArrow ? "rgba(0,0,0,0.05)" : "transparent",
          borderRadius: "0 0 20px 20px",
          transition: "background 0.2s",
        }}
        onMouseEnter={() => setShowArrow(true)}
        onMouseLeave={() => setShowArrow(false)}
        onClick={onBackToCover}
      >
        <i
          className="fa-solid fa-chevron-up"
          style={{
            fontSize: "1.5rem",
            color: "var(--text)",
            opacity: showArrow ? 1 : 0,
            transform: showArrow ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        ></i>
      </div>

      {/* 三栏内容 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <div style={{ width: "25%", paddingRight: "1rem" }}>
          <LeftPanel />
        </div>
        <div style={{ width: "50%", padding: "0 1rem" }}>
          <CenterPanel />
        </div>
        <div style={{ width: "25%", paddingLeft: "1rem" }}>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default ContentLayout;
