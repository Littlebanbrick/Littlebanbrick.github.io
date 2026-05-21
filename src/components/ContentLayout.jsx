import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import BlogSection from "./BlogSection";
import NotesSection from "./NotesSection";
import AboutSection from "./AboutSection";
import WelcomeSection from "./WelcomeSection";

const studyGlob = import.meta.glob("../notes/study/**/*.md", {
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

const aboutGlob = import.meta.glob("../notes/about/*.md", {
  query: "?raw",
  import: "default",
});

const welcomeGlob = import.meta.glob("../notes/welcome/*.md", {
  query: "?raw",
  import: "default",
});

function stripMarkdown(text) {
  return text
    .replace(/^>\s*/gm, "") // blockquote
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold **text**
    .replace(/__(.*?)__/g, "$1") // bold __text__
    .replace(/\*(.*?)\*/g, "$1") // italic *text*
    .replace(/_(.*?)_/g, "$1") // italic _text_
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links [text](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images ![alt](url)
    .replace(/^[-*+]\s+/gm, "") // unordered list markers
    .replace(/^\d+\.\s+/gm, "") // ordered list markers
    .replace(/\n{2,}/g, " ") // multiple newlines → space
    .replace(/\n/g, " ") // single newlines → space
    .trim();
}

async function loadNotesFromGlob(glob) {
  const entries = Object.entries(glob);
  const categoryMap = new Map(); // key: category, value: notes array

  await Promise.all(
    entries.map(async ([path, loader]) => {
      const content = await loader();
      const relativePath = path
        .replace("../notes/study/", "")
        .replace("../notes/essays/", ""); // 去掉前缀
      const parts = relativePath.split("/");
      let category = "Uncategorized"; // 默认分类
      let fileName;

      if (parts.length > 1) {
        // 有子文件夹，分类是文件夹名
        category = parts[0];
        fileName = parts[parts.length - 1].replace(".md", "");
      } else {
        // 根目录下的文件
        fileName = parts[0].replace(".md", "");
      }

      const firstLine = content.split("\n")[0].replace(/^#\s+/, "");
      const title = firstLine || fileName;
      const bodyWithoutTitle = content.replace(/^#\s+.*\n?/, "").trim();

      // 检查是否通过 HTML 注释自定义了预览
      // 格式：<!-- preview: 自定义摘要文字 -->
      const previewMatch = bodyWithoutTitle.match(
        /<!--\s*preview\s*:\s*(.*?)\s*-->/,
      );
      let preview;
      if (previewMatch) {
        preview = previewMatch[1].trim();
      } else {
        // 自动生成：剥离 Markdown 语法后取前 150 字符
        preview = stripMarkdown(bodyWithoutTitle);
        preview =
          preview.substring(0, 150) + (preview.length > 150 ? "..." : "");
      }

      // 检查是否置顶
      // 格式：<!-- pinned: true -->（不写或 false 则不置顶）
      const pinnedMatch = bodyWithoutTitle.match(
        /<!--\s*pinned\s*:\s*(true|false)\s*-->/,
      );
      const pinned = pinnedMatch ? pinnedMatch[1] === "true" : false;

      const note = { id: fileName, title, preview, content, pinned };

      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category).push(note);
    }),
  );

  // 转换为排序后的数组：每个分类内按置顶 + 标题字母序排序
  const categories = Array.from(categoryMap.entries()).map(([cat, items]) => ({
    title: cat,
    items: items.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    }),
  }));
  return categories;
}

function ContentLayout({
  stage,
  onBackToCover,
  onContentExitEnd,
  toggleTheme,
  theme,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showArrow, setShowArrow] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("welcome");
  const contentRef = useRef(null);
  const mainRef = useRef(null);

  // 响应式边栏宽度
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 监听主内容区滚动，控制回到顶部按钮显隐
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setShowBackToTop(el.scrollTop > 400);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Scroll `<main>` when the URL hash points to a heading inside content. */
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (!id || !mainRef.current) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [studyCategories, setStudyCategories] = useState([]);
  const [essayCategories, setEssayCategories] = useState([]);
  const [blogContent, setBlogContent] = useState("");
  const [aboutContent, setAboutContent] = useState("");
  const [welcomeContent, setWelcomeContent] = useState("");

  useEffect(() => {
    loadNotesFromGlob(studyGlob).then(setStudyCategories);
    loadNotesFromGlob(essaysGlob).then(setEssayCategories);

    // 加载 blog 文件
    const loadBlog = async () => {
      const entries = Object.entries(blogGlob);
      if (entries.length > 0) {
        const content = await entries[0][1]();
        setBlogContent(content);
      }
    };
    loadBlog();

    // 加载 about 文件
    const loadAbout = async () => {
      const entries = Object.entries(aboutGlob);
      if (entries.length > 0) {
        const content = await entries[0][1]();
        setAboutContent(content);
      }
    };
    loadAbout();

    // 加载 welcome 文件
    const loadWelcome = async () => {
      const entries = Object.entries(welcomeGlob);
      if (entries.length > 0) {
        const content = await entries[0][1]();
        setWelcomeContent(content);
      }
    };
    loadWelcome();
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
          overflow: "hidden",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <aside
          style={{
            width: sidebarOpen ? (isMobile ? 160 : 220) + "px" : "32px",
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            paddingRight: sidebarOpen ? (isMobile ? "0.5rem" : "1rem") : "0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: sidebarOpen ? "space-between" : "center",
              alignItems: "center",
              padding: sidebarOpen ? "0 0 0.75rem 0" : "0.75rem 0",
              borderBottom: sidebarOpen ? "1px solid var(--border)" : "none",
              marginBottom: sidebarOpen ? "0.75rem" : "0",
            }}
          >
            {sidebarOpen && (
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  lineHeight: 1,
                }}
              >
                Navigation
              </span>
            )}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-light)",
                fontSize: "1rem",
                padding: "0.25rem",
                borderRadius: "4px",
                transition: "color 0.2s",
                marginLeft: sidebarOpen ? "auto" : "0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-light)")
              }
            >
              <i
                className={`fa-solid fa-chevron-${sidebarOpen ? "left" : "right"}`}
              ></i>
            </button>
          </div>
          {sidebarOpen && (
            <Navigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          )}
        </aside>

        <main
          ref={mainRef}
          style={{ flex: 1, overflow: "auto", paddingLeft: "1.5rem" }}
        >
          {activeSection === "blog" && <BlogSection content={blogContent} />}
          {activeSection === "notes" && (
            <NotesSection
              categories={studyCategories}
              sectionTitle="Study Notes"
            />
          )}
          {activeSection === "essays" && (
            <NotesSection categories={essayCategories} sectionTitle="Essays" />
          )}
          {activeSection === "about" && <AboutSection content={aboutContent} />}
          {activeSection === "welcome" && (
            <WelcomeSection content={welcomeContent} />
          )}
        </main>

        {/* Back to top — fixed to viewport */}
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: `max(1.5rem, ${(sidebarOpen ? (isMobile ? 160 : 220) : 32) / 2}px)`,
            transform: sidebarOpen ? "translateX(-50%)" : "none",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            color: "var(--text-light)",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            opacity: showBackToTop && stage === "content" ? 1 : 0,
            pointerEvents:
              showBackToTop && stage === "content" ? "auto" : "none",
            transition: "opacity 0.25s ease, color 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
            e.currentTarget.style.borderColor = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-light)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <i className="fa-solid fa-arrow-up"></i>
          Top
        </button>
      </div>
    </div>
  );
}

export default ContentLayout;
