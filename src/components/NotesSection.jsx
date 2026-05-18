import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

function NotesSection({ categories, sectionTitle }) {
  const [selectedNote, setSelectedNote] = useState(null);

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
        <h2 style={{ marginBottom: "1rem", fontWeight: "normal" }}>
          {selectedNote.title}
        </h2>
        <div className="markdown-body" style={{ lineHeight: 1.8, color: "var(--text)" }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {selectedNote.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

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
      {categories.map((cat) => (
        <div key={cat.title} style={{ marginBottom: "2rem" }}>
          {/* 如果分类不是默认的 “Uncategorized”，显示分类标题 */}
          {cat.title !== "Uncategorized" && (
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: "normal",
                color: "var(--text-light)",
                marginBottom: "0.75rem",
                marginTop: "1rem",
              }}
            >
              {cat.title}
            </h3>
          )}
          {cat.items.map((note) => (
            <div key={note.id}>
              <div
                onClick={() => setSelectedNote(note)}
                style={{
                  padding: "1rem 0",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--border)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-light)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text)")
                }
              >
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
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default NotesSection;
