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

  // at-rest visible & re-entering → cover-visible (translateY(0))
  // exiting (slide up) & hidden → cover-hidden (translateY(-100%))
  const coverClass =
    stage === "cover" || stage === "content-exit"
      ? "cover-visible"
      : "cover-hidden";

  // only clickable when at rest
  const isClickable = stage === "cover";

  return (
    <div
      id="cover-root"
      ref={coverRef}
      className={coverClass}
      style={{
        background: `
          linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
          url('https://tiebapic.baidu.com/forum/pic/item/ba7cb531e924b8996b0e952728061d950a7bf642.jpg?tbpicau=2026-05-27-05_9b07e989cda2a902da48f83dbdcc31ec') center/cover no-repeat
        `,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: isClickable ? "pointer" : "default",
        pointerEvents: isClickable ? "auto" : "none",
      }}
      onClick={() => {
        if (isClickable) onCoverClick();
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
