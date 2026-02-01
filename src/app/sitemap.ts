import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { ruangInformasi } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://riska-hd.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/informasi`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic pages from ruang informasi
  try {
    const articles = await db
      .select({
        slug: ruangInformasi.slug,
        updatedAt: ruangInformasi.updatedAt,
        publishedAt: ruangInformasi.publishedAt,
      })
      .from(ruangInformasi)
      .where(
        and(
          eq(ruangInformasi.isActive, true),
          eq(ruangInformasi.isPublished, true)
        )
      )
      .orderBy(desc(ruangInformasi.publishedAt));

    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${BASE_URL}/informasi/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...articlePages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
