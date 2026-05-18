import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

function NotesSection({ categories, sectionTitle }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const folders = categories.filter((cat) => cat.title !== "Uncategorized");
  const uncategorized = categories.find(
    (cat) => cat.title === "Uncategorized",
  );

  // ---- 笔记详情 ----
  if (selectedNote) {
    return (
      <div style={{ padding: "0 1rem", maxWidth: "800px" }}>
        <button
          onClick={() => setSelectedNote(null)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text)",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            fontFamily: "inherit",
          }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <div
          className="markdown-body"
          style={{ lineHeight: 1.8, color: "var(--text)" }}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {selectedNote.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // ---- 文件夹详情 ----
  if (selectedFolder) {
    return (
      <div style={{ padding: "0 1rem", maxWidth: "800px" }}>
        <button
          onClick={() => setSelectedFolder(null)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text)",
            cursor: "pointer",
            marginBottom: "1rem",
            fontSize: "0.9rem",
            fontFamily: "inherit",
          }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h2
          style={{
            fontWeight: "normal",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.5rem",
            marginBottom: "1.5rem",
            color: "var(--header-text)",
          }}
        >
          {selectedFolder.title}
        </h2>
        {selectedFolder.items.map((note) => (
          <div key={note.id}>
            <div
              onClick={() => setSelectedNote(note)}
              style={{
                padding: "1rem 0",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                transition: "color 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "normal",
                    marginBottom: "0.25rem",
                  }}
                >
                  {note.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-light)",
                    margin: 0,
                  }}
                >
                  {note.preview}
                </p>
              </div>
              {note.pinned && (
                <i
                  className="fa-solid fa-thumbtack"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-light)",
                    opacity: 0.4,
                    transform: "rotate(45deg)",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---- 浏览（默认）视图 ----
  return (
    <div style={{ padding: "0 1rem", maxWidth: "800px" }}>
      <h2
        style={{
          fontWeight: "normal",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
          color: "var(--header-text)",
        }}
      >
        {sectionTitle}
      </h2>

      {/* 文件夹卡片 */}
      {folders.map((folder) => (
        <div
          key={folder.title}
          onClick={() => setSelectedFolder(folder)}
          role="button"
          tabIndex={0}
          style={{
            display: "block",
            cursor: "pointer",
            textDecoration: "none",
            color: "inherit",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem 2rem",
            width: "100%",
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--card-hover-shadow)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "normal",
              marginBottom: "0.5rem",
              color: "var(--text)",
            }}
          >
            {folder.title}
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-light)",
              margin: 0,
            }}
          >
            {folder.items.length}{" "}
            {folder.items.length === 1 ? "note" : "notes"}
          </p>
        </div>
      ))}

      {/* 未分类的笔记 */}
      {uncategorized && uncategorized.items.length > 0 && (
        <>
          {folders.length > 0 && (
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "normal",
                color: "var(--text-light)",
                marginBottom: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              Uncategorized
            </h3>
          )}
          {uncategorized.items.map((note) => (
            <div key={note.id}>
              <div
                onClick={() => setSelectedNote(note)}
                style={{
                  padding: "1rem 0",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  transition: "color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-light)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "normal",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {note.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-light)",
                      margin: 0,
                    }}
                  >
                    {note.preview}
                  </p>
                </div>
                {note.pinned && (
                  <i
                    className="fa-solid fa-thumbtack"
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-light)",
                      opacity: 0.4,
                      transform: "rotate(45deg)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default NotesSection;
