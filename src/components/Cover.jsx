import { useEffect, useRef } from "react";

function Cover({ stage, onCoverClick, onCoverExitEnd }) {
  const coverRef = useRef(null);

  useEffect(() => {
    const el = coverRef.current;
    if (!el) return;

    const handleTransitionEnd = (e) => {
      if (e.propertyName === "transform") {
        if (stage === "cover-exit") {
          onCoverExitEnd();
        }
      }
    };

    el.addEventListener("transitionend", handleTransitionEnd);
    return () => el.removeEventListener("transitionend", handleTransitionEnd);
  }, [stage, onCoverExitEnd]);

  const isExiting = stage === "cover-exit";
  const isVisible = stage === "cover" || stage === "cover-exit"; // 退出动画需要可见

  return (
    <div
      id="cover-root"
      ref={coverRef}
      style={{
        background: `
          linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
          url('https://i.imgur.com/Y9sQmXI.jpeg') center/cover no-repeat
        `,
        display: isVisible ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        cursor: isExiting ? "default" : "pointer",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      className={isVisible ? "cover-visible" : "cover-hidden"}
      onClick={() => {
        if (!isExiting) onCoverClick();
      }}
    >
      <div style={{ textAlign: "center", color: "#fff", userSelect: "none" }}>
        <h1
          style={{
            fontSize: "clamp(3rem, 12vw, 6rem)",
            fontWeight: "normal",
            letterSpacing: "0.05em",
            textShadow: "2px 2px 10px rgba(0,0,0,0.3)",
            marginBottom: "1rem",
          }}
        >
          Hello, world.
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.9,
            textShadow: "1px 1px 5px rgba(0,0,0,0.3)",
          }}
        >
          Click anywhere to explore
        </p>
      </div>
    </div>
  );
}

export default Cover;
