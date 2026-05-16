export function extractTextFromTiptap(node: any): string {
  // If current node itself is text
  if (node.type === "text") {
    return node.text || "";
  }

  // If node has children, recursively visit them
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child: any) => extractTextFromTiptap(child))
      .join(" ");
  }

  // Fallback for nodes without text/content
  return "";
}