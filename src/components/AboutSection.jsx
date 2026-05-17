import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

function AboutSection({ content }) {
  return (
    <div style={{ padding: '0 1rem', maxWidth: '800px', lineHeight: 1.8, color: 'var(--text)' }}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default AboutSection;