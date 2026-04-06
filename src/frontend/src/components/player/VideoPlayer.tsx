import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
}

export function VideoPlayer({ url, onEnded }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "infoDelivery" && data?.info?.playerState === 0) {
          onEnded?.();
        }
        // YT API sends 0 for ended
        if (data === 0 || data?.info?.playerState === 0) {
          onEnded?.();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onEnded]);

  // Add enablejsapi=1 for postMessage events
  const src = url.includes("?")
    ? `${url}&enablejsapi=1`
    : `${url}?enablejsapi=1`;

  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <iframe
        ref={iframeRef}
        src={src}
        title="Course video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  );
}
