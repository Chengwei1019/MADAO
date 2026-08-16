"use client";

import { useEffect, useRef, useState } from "react";
import { drawShareCard } from "@/lib/share-card";
import type { ShareCardData } from "@/lib/share-card";

type ShareCardModalProps = {
  data: ShareCardData;
  onClose: () => void;
};

export function ShareCardModal({ data, onClose }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawShareCard(canvasRef.current, data);
    }
  }, [data]);

  function download() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "metis-share-card.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setDownloaded(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <div className="w-full max-w-lg rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">分享学习记录</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="mt-4 w-full rounded-2xl border border-[var(--line)]"
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface)]"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={download}
            className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
          >
            {downloaded ? "已下载" : "下载图片"}
          </button>
        </div>
      </div>
    </div>
  );
}
