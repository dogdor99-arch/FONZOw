import { cn } from "@/lib/utils";

/**
 * Renders editorial HTML coming from the legacy Fonzo CMS.
 *
 * The source HTML is authored in the brand's own CMS (headings, paragraphs,
 * anchors, images) and is styled through the `.prose-fonzo` token set.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose-fonzo max-w-none text-[15px]", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
