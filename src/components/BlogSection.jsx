import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import CardLink from './CardLink';

function BlogSection({ content }) {
  return (
    <div style={{ padding: '0 1rem', maxWidth: '800px' }}>
      <CardLink
        href="https://littlebanbrick.cn"
        title="My Blog"
        description="Visit littlebanbrick.cn"
      />
      <div style={{ marginTop: '2rem' }}>
        <div className="markdown-body" style={{ lineHeight: 1.8, color: 'var(--text)' }}>
          <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default BlogSection;
