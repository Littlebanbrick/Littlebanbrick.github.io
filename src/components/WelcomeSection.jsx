import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHeadingSlug from "../utils/rehype-heading-slug";

function WelcomeSection({ content }) {
  return (
    <div
      style={{
        padding: "0 1rem",
        maxWidth: "800px",
        lineHeight: 1.8,
        color: "var(--text)",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeHeadingSlug, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default WelcomeSection;
