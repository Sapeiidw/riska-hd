"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { useRef, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  createRuangInformasiSchema,
  CreateRuangInformasiInput,
  RUANG_INFORMASI_CATEGORIES,
  ExternalLink,
} from "@/lib/validations/ruang-informasi";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RuangInformasiFormProps {
  data?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    content: string;
    excerpt: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    externalLinks: string | null;
    isPublished: boolean;
  } | null;
  onSuccess: () => void;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Compress image using canvas
async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              reject(new Error("Gagal mengkompresi gambar"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
  });
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload/image", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Gagal mengupload gambar");
  }
  const data = await res.json();
  return data.data.url;
}

export function RuangInformasiForm({ data, onSuccess }: RuangInformasiFormProps) {
  const [linksOpen, setLinksOpen] = useState(false);
  const [featuredImageOpen, setFeaturedImageOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageTab, setImageTab] = useState<string>(data?.imageUrl?.startsWith("data:") ? "upload" : "url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse existing external links
  let existingLinks: ExternalLink[] = [];
  if (data?.externalLinks) {
    try {
      existingLinks = JSON.parse(data.externalLinks);
    } catch {
      existingLinks = [];
    }
  }

  const form = useForm<CreateRuangInformasiInput>({
    resolver: zodResolver(createRuangInformasiSchema),
    defaultValues: {
      title: data?.title || "",
      slug: data?.slug || "",
      category: (data?.category as CreateRuangInformasiInput["category"]) || "artikel",
      content: data?.content || "",
      excerpt: data?.excerpt || "",
      imageUrl: data?.imageUrl || "",
      videoUrl: data?.videoUrl || "",
      externalLinks: existingLinks.length > 0 ? existingLinks : [],
      isPublished: data?.isPublished ?? false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "externalLinks",
  });

  const mutation = useMutation({
    mutationFn: async (formData: CreateRuangInformasiInput) => {
      const url = data
        ? `/api/master/ruang-informasi/${data.id}`
        : "/api/master/ruang-informasi";
      const res = await fetch(url, {
        method: data ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        data ? "Konten berhasil diperbarui" : "Konten berhasil ditambahkan"
      );
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan konten");
    },
  });

  const watchImageUrl = form.watch("imageUrl");

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file harus JPG, PNG, WebP, atau GIF");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const compressedFile = await compressImage(file);
        const url = await uploadImage(compressedFile);
        form.setValue("imageUrl", url);
        toast.success("Gambar berhasil diupload");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal mengupload gambar");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [form]
  );

  const handleRemoveImage = () => {
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    if (!data) {
      // Only auto-generate for new items
      form.setValue("slug", generateSlug(value));
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
        className="space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Judul konten"
                    {...field}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="slug-konten" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RUANG_INFORMASI_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Publikasi</FormLabel>
                  <FormDescription>Tampilkan ke pengguna</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ringkasan (opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ringkasan singkat konten..."
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Deskripsi singkat yang ditampilkan di daftar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rich Text Editor - Main Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Tulis konten di sini... Gunakan toolbar untuk memformat teks, menambahkan gambar, dan video YouTube."
                  title={form.watch("title")}
                />
              </FormControl>
              <FormDescription>
                Gunakan toolbar di atas untuk memformat teks, menambahkan gambar, dan embed video YouTube langsung di dalam konten.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Featured Image - Collapsible */}
        <Collapsible open={featuredImageOpen} onOpenChange={setFeaturedImageOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Gambar Utama (Featured Image)
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      featuredImageOpen ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Tabs value={imageTab} onValueChange={setImageTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-sky-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                          <p className="text-sm text-muted-foreground">Mengupload...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Klik atau drag & drop gambar di sini
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Pilih Gambar
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            JPG, PNG, WebP, GIF (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="url">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Gambar</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Masukkan URL gambar dari internet
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                {watchImageUrl && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Preview:</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                    <img
                      src={watchImageUrl}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 rounded-lg border object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* External Links - Collapsible */}
        <Collapsible open={linksOpen} onOpenChange={setLinksOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Link Eksternal
                    {fields.length > 0 && (
                      <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                        {fields.length}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      linksOpen ? "rotate-180" : ""
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50/50"
                  >
                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`externalLinks.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Judul Link</FormLabel>
                            <FormControl>
                              <Input placeholder="Judul link" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`externalLinks.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive mt-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: "", url: "" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Link
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Menyimpan..."
              : data
              ? "Perbarui"
              : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
