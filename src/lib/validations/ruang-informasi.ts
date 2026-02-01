import { z } from "zod";

// External link schema
const externalLinkSchema = z.object({
  title: z.string().min(1, "Judul link wajib diisi"),
  url: z.string().url("URL tidak valid"),
});

// Categories for ruang informasi
export const RUANG_INFORMASI_CATEGORIES = [
  { value: "artikel", label: "Artikel" },
  { value: "video", label: "Video" },
  { value: "panduan", label: "Panduan" },
  { value: "pengumuman", label: "Pengumuman" },
] as const;

export type RuangInformasiCategory = (typeof RUANG_INFORMASI_CATEGORIES)[number]["value"];

// Create validation schema
export const createRuangInformasiSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung"),
  category: z.enum(["artikel", "video", "panduan", "pengumuman"]),
  content: z.string().min(1, "Konten wajib diisi"),
  excerpt: z.string().optional().nullable(),
  imageUrl: z.string().url("URL gambar tidak valid").optional().nullable().or(z.literal("")),
  videoUrl: z.string().url("URL video tidak valid").optional().nullable().or(z.literal("")),
  externalLinks: z.array(externalLinkSchema).optional().nullable(),
  isPublished: z.boolean(),
});

// Update validation schema (all fields optional)
export const updateRuangInformasiSchema = createRuangInformasiSchema.partial();

// Type exports
export type CreateRuangInformasiInput = z.infer<typeof createRuangInformasiSchema>;
export type UpdateRuangInformasiInput = z.infer<typeof updateRuangInformasiSchema>;
export type ExternalLink = z.infer<typeof externalLinkSchema>;
