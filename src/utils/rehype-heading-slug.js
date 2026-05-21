/**
 * Custom rehype plugin: add `id` to heading elements (<h1>–<h6>)
 * so that internal markdown links like [text](#my-slug) can scroll to them.
 *
 * The slug function preserves CJK characters (\u4e00–\u9fff) so that
 * bilingual headings like "## Heap / 堆" produce predictable, matching IDs.
 */

function getText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  let out = "";
  if (node.children) {
    for (const child of node.children) {
      out += getText(child);
    }
  }
  return out;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff\-]+/g, "")
    .replace(/\-{2,}/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/** IDs already assigned — skip them so we don't overwrite explicit IDs. */
const seen = new Set();

export default function rehypeHeadingSlug() {
  return (tree) => {
    seen.clear();

    (function walk(node) {
      if (!node || node.type !== "element") return;

      if (/^h[1-6]$/.test(node.tagName)) {
        const text = getText(node);
        const slug = slugify(text);

        if (slug && !seen.has(slug)) {
          node.properties = node.properties || {};
          node.properties.id = slug;
          seen.add(slug);
        }
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    })(tree);
  };
}
