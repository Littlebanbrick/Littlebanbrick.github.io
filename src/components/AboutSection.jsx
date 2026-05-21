import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHeadingSlug from '../utils/rehype-heading-slug';

// 每天变一次的版本号，强制浏览器重新请求外部图片
function dailyVersion() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function ImgWithFallback(props) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const src = props.src;
  // 只对外部 URL 拼接缓存破坏参数
  const cacheBustedSrc =
    src && (src.startsWith('http://') || src.startsWith('https://'))
      ? src + (src.includes('?') ? '&' : '?') + '_v=' + dailyVersion()
      : src;

  if (error) {
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'var(--bg-card)',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          color: 'var(--text-light)',
          fontSize: '0.9rem',
        }}
      >
        [{props.alt || 'image'} — 暂时无法加载]
      </span>
    );
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {!loaded && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            color: 'var(--text-light)',
            fontSize: '0.85rem',
          }}
        >
          LOADING...
        </span>
      )}
      <img
        {...props}
        src={cacheBustedSrc}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          maxWidth: '100%',
          ...(props.style || {}),
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
    </span>
  );
}

function AboutSection({ content }) {
  return (
    <div
      style={{
        padding: '0 1rem',
        maxWidth: '800px',
        lineHeight: 1.8,
        color: 'var(--text)',
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHeadingSlug]}
        components={{ img: ImgWithFallback }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default AboutSection;
