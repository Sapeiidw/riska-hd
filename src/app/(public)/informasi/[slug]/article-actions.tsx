"use client";

import { useState } from "react";
import { Heart, Share, MessageCircle, BookmarkPlus, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleActionsProps {
  title: string;
  slug: string;
}

export function ArticleActions({ title, slug }: ArticleActionsProps) {
  const [clapped, setClapped] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleClap = () => {
    if (!clapped) {
      setClapped(true);
      setClapCount((prev) => prev + 1);
    } else if (clapCount < 50) {
      setClapCount((prev) => prev + 1);
    }
  };

  const handleShare = async (type: "copy" | "whatsapp" | "twitter" | "facebook") => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/informasi/${slug}` : "";
    const shareText = `${title} - RISKA HD`;

    switch (type) {
      case "copy":
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowShareMenu(false);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
    }
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={handleClap}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
              clapped ? "text-rose-500" : "text-gray-500 hover:text-rose-500"
            )}
          >
            <Heart className={cn("h-6 w-6 transition-transform", clapped && "fill-current scale-110")} />
            {clapCount > 0 && <span className="font-medium">{clapCount}</span>}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700">
            <MessageCircle className="h-6 w-6" />
          </button>

          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700"
          >
            <Share className="h-6 w-6" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-gray-700">
            <BookmarkPlus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Desktop Floating Sidebar */}
      <div className="hidden lg:flex fixed left-[calc(50%-450px)] top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-40">
        <button
          onClick={handleClap}
          className={cn(
            "group flex flex-col items-center gap-1 p-3 rounded-full border transition-all",
            clapped
              ? "border-rose-200 bg-rose-50 text-rose-500"
              : "border-gray-200 bg-white text-gray-400 hover:text-rose-500 hover:border-rose-200"
          )}
        >
          <Heart className={cn("h-6 w-6 transition-transform group-hover:scale-110", clapped && "fill-current")} />
          {clapCount > 0 && <span className="text-xs font-medium">{clapCount}</span>}
        </button>

        <button className="p-3 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all">
          <MessageCircle className="h-5 w-5" />
        </button>

        <button className="p-3 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all">
          <BookmarkPlus className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-3 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
          >
            <Share className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 lg:bg-transparent"
            onClick={() => setShowShareMenu(false)}
          />
          <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border p-4 lg:left-auto lg:right-auto lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%-380px)] lg:w-48">
            <p className="text-sm font-medium text-gray-900 mb-3">Bagikan artikel</p>
            <div className="space-y-2">
              <button
                onClick={() => handleShare("copy")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Link2 className="h-5 w-5" />}
                {copied ? "Tersalin!" : "Salin Link"}
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </>
      )}

      {/* Spacer for mobile bottom bar */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
