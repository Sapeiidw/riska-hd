"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Minus,
  Eye,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Label } from "./label";
import { Toggle } from "./toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  title?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  tooltip,
  children,
}: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={isActive}
            onPressedChange={onClick}
            disabled={disabled}
            className={cn(
              "h-7 w-7 p-0 data-[state=on]:bg-sky-100 data-[state=on]:text-sky-700 hover:bg-gray-100",
              disabled && "opacity-40"
            )}
          >
            {children}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

// Preview template
const getPreviewHTML = (content: string, title?: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Preview"} - RISKA HD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1f2937;
      background: #f9fafb;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: #111827; }
    h2 { font-size: 1.75rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #1f2937; }
    h3 { font-size: 1.375rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #374151; }
    p { margin-bottom: 1rem; }
    a { color: #0284c7; text-decoration: underline; }
    a:hover { color: #0369a1; }
    ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.25rem; }
    blockquote {
      border-left: 4px solid #0ea5e9;
      padding-left: 1rem;
      margin: 1.5rem 0;
      color: #4b5563;
      font-style: italic;
      background: #f0f9ff;
      padding: 1rem;
      border-radius: 0 8px 8px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5rem auto;
      display: block;
    }
    iframe {
      max-width: 100%;
      border-radius: 8px;
      margin: 1.5rem auto;
      display: block;
    }
    code {
      background: #f3f4f6;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-family: 'Fira Code', 'Consolas', monospace;
      font-size: 0.875rem;
    }
    pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    pre code { background: transparent; color: inherit; }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }
    mark {
      background: #fef08a;
      padding: 0.125rem 0.25rem;
      border-radius: 2px;
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
      color: white;
      padding: 20px;
      margin: -48px -48px 32px -48px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 { color: white; margin: 0; font-size: 1.5rem; }
    .header p { opacity: 0.9; margin-top: 4px; font-size: 0.875rem; }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title || "Preview Konten"}</h1>
      <p>RISKA HD - Ruang Informasi</p>
    </div>
    <article>
      ${content || "<p style='color: #9ca3af; text-align: center;'>Belum ada konten</p>"}
    </article>
    <div class="footer">
      <p>Preview - RISKA HD &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
`;

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Tulis konten di sini...",
  className,
  title,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-sky-600 underline hover:text-sky-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto mx-auto my-4",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg mx-auto my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] p-6",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    setLinkUrl("");
    setLinkDialogOpen(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setImageDialogOpen(false);
  }, [editor, imageUrl]);

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return;

    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    setYoutubeUrl("");
    setYoutubeDialogOpen(false);
  }, [editor, youtubeUrl]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const openPreview = useCallback(() => {
    if (!editor) return;
    const html = getPreviewHTML(editor.getHTML(), title);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [editor, title]);

  if (!editor) {
    return (
      <div className={cn("border rounded-lg bg-white", className)}>
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-b px-3 py-2">
          <div className="h-7 bg-gray-200 animate-pulse rounded w-full" />
        </div>
        <div className="min-h-[400px] p-6">
          <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-white shadow-sm", className)}>
      {/* MS Word-style Ribbon Toolbar */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 border-b">
        {/* Top toolbar row */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200/50">
          <div className="flex items-center gap-1">
            {/* Undo/Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="Batalkan (Ctrl+Z)"
            >
              <Undo className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="Ulangi (Ctrl+Y)"
            >
              <Redo className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          {/* Preview Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openPreview}
            className="h-7 text-xs gap-1.5 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>

        {/* Main toolbar row */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5">
          {/* Paragraph Style Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-normal gap-1 hover:bg-gray-200/70"
              >
                {editor.isActive("heading", { level: 1 })
                  ? "Heading 1"
                  : editor.isActive("heading", { level: 2 })
                  ? "Heading 2"
                  : editor.isActive("heading", { level: 3 })
                  ? "Heading 3"
                  : "Paragraf"}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={cn(editor.isActive("paragraph") && "bg-sky-50 text-sky-700")}
              >
                <span className="text-sm">Paragraf</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive("heading", { level: 1 }) && "bg-sky-50 text-sky-700")}
              >
                <span className="text-xl font-bold">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive("heading", { level: 2 }) && "bg-sky-50 text-sky-700")}
              >
                <span className="text-lg font-bold">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(editor.isActive("heading", { level: 3 }) && "bg-sky-50 text-sky-700")}
              >
                <span className="text-base font-bold">Heading 3</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarDivider />

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="Tebal (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="Miring (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            tooltip="Garis Bawah (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            tooltip="Coret"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            tooltip="Stabilo"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            tooltip="Kode"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Rata Kiri"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Rata Tengah"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Rata Kanan"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            tooltip="Rata Kiri-Kanan"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            tooltip="Daftar Bullet"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            tooltip="Daftar Nomor"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            tooltip="Kutipan"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Garis Horizontal"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Insert */}
          <ToolbarButton
            onClick={openLinkDialog}
            isActive={editor.isActive("link")}
            tooltip="Sisipkan Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              tooltip="Hapus Link"
            >
              <Unlink className="h-3.5 w-3.5" />
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={() => setImageDialogOpen(true)}
            tooltip="Sisipkan Gambar"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setYoutubeDialogOpen(true)}
            tooltip="Sisipkan Video YouTube"
          >
            <YoutubeIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content - Word-like paper style */}
      <div className="bg-gray-100 p-4">
        <div className="bg-white shadow-sm rounded border min-h-[400px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-50 border-t px-3 py-1 flex items-center justify-between text-xs text-gray-500">
        <span>
          {editor.storage.characterCount?.characters?.() || content.replace(/<[^>]*>/g, "").length} karakter
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Siap
        </span>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">Alamat URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={setLink}>
              {linkUrl ? "Sisipkan" : "Hapus Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Gambar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL Gambar</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/gambar.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
              />
            </div>
            {imageUrl && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-40 rounded mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={addImage} disabled={!imageUrl}>
              Sisipkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Video YouTube</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">URL Video YouTube</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addYoutube()}
              />
              <p className="text-xs text-muted-foreground">
                Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={addYoutube} disabled={!youtubeUrl}>
              Sisipkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
