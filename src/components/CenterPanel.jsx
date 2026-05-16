import { useState } from 'react'

const notes = [
  {
    id: 1,
    title: 'Learning React Hooks',
    content: `## React Hooks\n\nHooks let you use state and other React features without writing a class.\n\n- useState\n- useEffect\n- useContext\n...`
  },
  {
    id: 2,
    title: 'CSS Grid Layout',
    content: `## CSS Grid\n\nA two-dimensional layout system for the web.\n\n\`\`\`css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n}\n\`\`\``
  },
  {
    id: 3,
    title: 'Git Workflow Tips',
    content: `## Git Tips\n\n- \`git rebase -i\` to squash commits\n- \`git stash\` for temporary changes\n- \`git cherry-pick\` to apply specific commits`
  }
]

function CenterPanel() {
  const [selectedNote, setSelectedNote] = useState(null)

  const handleNoteClick = (note) => {
    setSelectedNote(note)
  }

  const handleBack = () => {
    setSelectedNote(null)
  }

  return (
    <div>
      <h2 style={{
        fontSize: '1.3rem',
        fontWeight: 'normal',
        marginBottom: '1.5rem',
        color: 'var(--header-text)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
      }}>
        Notes
      </h2>
      {!selectedNote ? (
        <div>
          {notes.map(note => (
            <div key={note.id}>
              <div
                onClick={() => handleNoteClick(note)}
                style={{
                  padding: '1rem 0',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'color 0.2s',
                  fontSize: '1.1rem',
                  color: 'var(--text)'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-light)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
              >
                {note.title}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
          {/* 这里用 dangerouslySetInnerHTML 简单渲染 Markdown，或者后续安装 react-markdown */}
          <div dangerouslySetInnerHTML={{ __html: selectedNote.content.replace(/\n/g, '<br/>') }} style={{ color: 'var(--text)', lineHeight: 1.8 }} />
        </div>
      )}
    </div>
  )
}

export default CenterPanel