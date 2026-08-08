/**
 * Live post embeds.
 *
 * Each platform is rendered through its own official embed surface so the
 * content stays current without us scraping anything:
 *  - TikTok    → www.tiktok.com/embed/v2/<videoId>
 *  - YouTube   → www.youtube.com/embed/<videoId>
 *  - Facebook  → www.facebook.com/plugins/post.php?href=<encoded url>
 *  - Instagram → www.instagram.com/p|reel/<shortcode>/embed/captioned
 * Shopee and Lazada do not allow third-party iframe embedding, so those cards
 * link out instead (see `isEmbeddable`).
 */

export function embedUrl(platform: string, url: string): string | null {
  switch (platform) {
    case "tiktok": {
      const match = url.match(/\/video\/(\d{6,})/);
      return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
    }
    case "youtube": {
      const patterns = [/[?&]v=([\w-]{6,})/, /youtu\.be\/([\w-]{6,})/, /shorts\/([\w-]{6,})/];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
      }
      return null;
    }
    case "facebook":
      return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
        url,
      )}&show_text=true&width=500`;
    case "instagram": {
      // Instagram's own embed route works without a token for public posts.
      const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/);
      return match ? `https://www.instagram.com/p/${match[1]}/embed/captioned/` : null;
    }
    default:
      return null;
  }
}

export function isEmbeddable(platform: string, url: string) {
  return embedUrl(platform, url) !== null;
}

export function PostEmbed({ platform, url }: { platform: string; url: string }) {
  const src = embedUrl(platform, url);
  if (!src) return null;

  const aspect =
    platform === "youtube"
      ? "aspect-video"
      : platform === "tiktok"
        ? "aspect-9/16"
        : platform === "instagram"
          ? "h-[640px]"
          : "h-[560px]";

  return (
    <div className={`w-full bg-ink/5 ${aspect}`}>
      <iframe
        src={src}
        title={`${platform} post`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
        className="h-full w-full border-0"
      />
    </div>
  );
}
