import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import BlogSection from "./BlogSection";
import NotesSection from "./NotesSection";

const studyGlob = import.meta.glob("../notes/study/*.md", {
  query: "?raw",
  import: "default",
});
const essaysGlob = import.meta.glob("../notes/essays/*.md", {
  query: "?raw",
  import: "default",
});
const blogGlob = import.meta.glob("../notes/blog/*.md", {
  query: "?raw",
  import: "default",
});

function stripMarkdown(text) {
  return text
    .replace(/^>\s*/gm, '')                    // blockquote
    .replace(/\*\*(.*?)\*\*/g, '$1')            // bold **text**
    .replace(/__(.*?)__/g, '$1')                // bold __text__
    .replace(/\*(.*?)\*/g, '$1')                // italic *text*
    .replace(/_(.*?)_/g, '$1')                  // italic _text_
    .replace(/`([^`]+)`/g, '$1')                // inline code
    .replace(/^#{1,6}\s+/gm, '')                // heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // links [text](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')   // images ![alt](url)
    .replace(/^[-*+]\s+/gm, '')                 // unordered list markers
    .replace(/^\d+\.\s+/gm, '')                 // ordered list markers
    .replace(/\n{2,}/g, ' ')                    // multiple newlines → space
    .replace(/\n/g, ' ')                        // single newlines → space
    .trim();
}

async function loadNotesFromGlob(glob) {
  const entries = Object.entries(glob);
  const notes = await Promise.all(
    entries.map(async ([path, loader]) => {
      const content = await loader();
      const fileName = path.split("/").pop().replace(".md", "");

      // 提取标题（第一行 # title）
      const firstLine = content.split("\n")[0].replace(/^#\s+/, "");
      const title = firstLine || fileName;

      // 正文（去掉标题行）
      const bodyWithoutTitle = content.replace(/^#\s+.*\n?/, "").trim();

      // 检查是否通过 HTML 注释自定义了预览
      // 格式：<!-- preview: 自定义摘要文字 -->
      const previewMatch = bodyWithoutTitle.match(/<!--\s*preview\s*:\s*(.*?)\s*-->/);

      let preview;
      if (previewMatch) {
        preview = previewMatch[1].trim();
      } else {
        // 自动生成：剥离 Markdown 语法后取前 150 字符
        preview = stripMarkdown(bodyWithoutTitle);
        preview = preview.substring(0, 150) + (preview.length > 150 ? "..." : "");
      }

      return { id: fileName, title, preview, content };
    }),
  );
  return notes;
}

function ContentLayout({
  stage,
  onBackToCover,
  onContentExitEnd,
  toggleTheme,
  theme,
}) {
  const [showArrow, setShowArrow] = useState(false);
  const [activeSection, setActiveSection] = useState("blog");
  const contentRef = useRef(null);

  const [studyNotes, setStudyNotes] = useState([]);
  const [essaysNotes, setEssaysNotes] = useState([]);
  const [blogContent, setBlogContent] = useState("");

  useEffect(() => {
    loadNotesFromGlob(studyGlob).then(setStudyNotes);
    loadNotesFromGlob(essaysGlob).then(setEssaysNotes);

    // 加载 blog 文件
    const loadBlog = async () => {
      const entries = Object.entries(blogGlob);
      if (entries.length > 0) {
        const content = await entries[0][1]();
        setBlogContent(content);
      }
    };
    loadBlog();
  }, []);

  // 动画过渡结束监听
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

  const contentClass =
    stage === "content" || stage === "cover-exit"
      ? "content-visible"
      : "content-hidden";
  const isInteractive = stage === "content";

  return (
    <div
      id="content-root"
      ref={contentRef}
      className={contentClass}
      style={{
        display: "flex",
        flexDirection: "column",
        pointerEvents: isInteractive ? "auto" : "none",
      }}
    >
      <Header toggleTheme={toggleTheme} theme={theme} />

      {/* 返回封面热区 */}
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

      {/* 主内容区：左侧导航 + 右侧内容 */}
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
        <aside
          style={{
            width: "220px",
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            paddingRight: "1rem",
          }}
        >
          <Navigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </aside>

        <main style={{ flex: 1, overflow: "auto", paddingLeft: "1.5rem" }}>
          {activeSection === "blog" && <BlogSection content={blogContent} />}
          {activeSection === "notes" && (
            <NotesSection notes={{ title: "Study Notes", items: studyNotes }} />
          )}
          {activeSection === "essays" && (
            <NotesSection notes={{ title: "Essays", items: essaysNotes }} />
          )}
        </main>
      </div>
    </div>
  );
}

export default ContentLayout;
