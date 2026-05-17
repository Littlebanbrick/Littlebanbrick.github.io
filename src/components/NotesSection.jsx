import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

function NotesSection({ notes }) {
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
        {notes.title || "Notes"}
      </h2>
      {notes.items.map((note) => (
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
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
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
  );
}

export default NotesSection;
