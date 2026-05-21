import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHeadingSlug]}>{content}</ReactMarkdown>
    </div>
  );
}

export default WelcomeSection;
