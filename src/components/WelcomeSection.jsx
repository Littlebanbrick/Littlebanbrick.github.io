import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import normalizeMath from "../utils/math";

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
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {normalizeMath(content)}
      </ReactMarkdown>
    </div>
  );
}

export default WelcomeSection;
