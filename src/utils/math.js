/**
 * Normalize LaTeX math delimiters to the dollar-sign syntax
 * that remark-math / rehype-katex can parse.
 *
 *   \( ... \)  ->  $ ... $      (inline math)
 *   \[ ... \]  ->  $$ ... $$    (display math)
 *
 * CommonMark treats \( as an escaped parenthesis and strips the
 * backslash before remark-math ever sees it, so the native
 * \(...\) support in micromark-extension-math does not work here.
 */
export default function normalizeMath(text) {
  return text
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$$$")
    .replace(/\\\]/g, "$$$$");
}
