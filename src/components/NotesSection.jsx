import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

function NotesSection({ categories, sectionTitle }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    setSelectedNote(null);
    setSearchQuery('');
  };

  if (selectedNote) {
    return (
      <div style={{ padding: '0 1rem', maxWidth: '800px' }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h2 style={{ marginBottom: '1rem', fontWeight: 'normal' }}>
          {selectedNote.title}
        </h2>
        <div style={{ lineHeight: 1.8, color: 'var(--text)' }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {selectedNote.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  const allNotes = categories.flatMap((cat) => cat.items);

  const query = searchQuery.toLowerCase().trim();
  const filteredNotes = query
    ? allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      )
    : [];

  return (
    <div style={{ padding: '0 1rem', maxWidth: '800px' }}>
      <h2
        style={{
          fontWeight: 'normal',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
          color: 'var(--header-text)',
        }}
      >
        {sectionTitle}
      </h2>

      <div
        style={{
          marginBottom: '1.5rem',
          position: 'relative',
        }}
      >
        <i
          className="fa-solid fa-magnifying-glass"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-light)',
            fontSize: '0.9rem',
          }}
        ></i>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.2rem',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: 'var(--text)',
            backgroundColor: 'var(--bg-card)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      {query ? (
        <div>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div key={note.id}>
                <div
                  onClick={() => setSelectedNote(note)}
                  style={{
                    padding: '1rem 0',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--text-light)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--text)')
                  }
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 'normal',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {note.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      margin: 0,
                    }}
                  >
                    {note.preview}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
              No results found for “{searchQuery}”.
            </p>
          )}
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat.title} style={{ marginBottom: '2rem' }}>
            {cat.title !== 'Uncategorized' && (
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  color: 'var(--text-light)',
                  marginBottom: '0.75rem',
                  marginTop: '1rem',
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
                    padding: '1rem 0',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = 'var(--text-light)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'var(--text)')
                  }
                >
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 'normal',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {note.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-light)',
                      margin: 0,
                    }}
                  >
                    {note.preview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default NotesSection;