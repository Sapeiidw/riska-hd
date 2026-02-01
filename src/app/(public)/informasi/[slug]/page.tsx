import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Video,
  FileText,
  Megaphone,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RUANG_INFORMASI_CATEGORIES } from "@/lib/validations/ruang-informasi";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const categoryIcons: Record<string, React.ElementType> = {
  artikel: FileText,
  video: Video,
  panduan: BookOpen,
  pengumuman: Megaphone,
};

const categoryColors: Record<string, string> = {
  artikel: "bg-blue-100 text-blue-700",
  video: "bg-purple-100 text-purple-700",
  panduan: "bg-green-100 text-green-700",
  pengumuman: "bg-orange-100 text-orange-700",
};

async function getContent(slug: string) {
  const [item] = await db
    .select({
      id: ruangInformasi.id,
      title: ruangInformasi.title,
      slug: ruangInformasi.slug,
      category: ruangInformasi.category,
      content: ruangInformasi.content,
      excerpt: ruangInformasi.excerpt,
      imageUrl: ruangInformasi.imageUrl,
      videoUrl: ruangInformasi.videoUrl,
      externalLinks: ruangInformasi.externalLinks,
      authorName: user.name,
      publishedAt: ruangInformasi.publishedAt,
      viewCount: ruangInformasi.viewCount,
      createdAt: ruangInformasi.createdAt,
    })
    .from(ruangInformasi)
    .leftJoin(user, eq(ruangInformasi.authorId, user.id))
    .where(
      and(
        eq(ruangInformasi.slug, slug),
        eq(ruangInformasi.isActive, true),
        eq(ruangInformasi.isPublished, true)
      )
    )
    .limit(1);

  return item;
}

async function incrementViewCount(slug: string) {
  await db
    .update(ruangInformasi)
    .set({ viewCount: sql`${ruangInformasi.viewCount} + 1` })
    .where(eq(ruangInformasi.slug, slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    return { title: "Konten tidak ditemukan - RISKA HD" };
  }

  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === content.category)
      ?.label || content.category;

  return {
    title: `${content.title} | ${categoryLabel} - RISKA HD`,
    description: content.excerpt || `Baca artikel tentang ${content.title}`,
    keywords: [
      content.category,
      "hemodialisis",
      "cuci darah",
      "kesehatan ginjal",
      "RISKA HD",
    ],
    authors: content.authorName ? [{ name: content.authorName }] : undefined,
    openGraph: {
      title: content.title,
      description: content.excerpt || content.title,
      type: "article",
      publishedTime: content.publishedAt?.toISOString(),
      authors: content.authorName ? [content.authorName] : undefined,
      images: content.imageUrl
        ? [
            {
              url: content.imageUrl,
              width: 1200,
              height: 630,
              alt: content.title,
            },
          ]
        : [],
      siteName: "RISKA HD",
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.excerpt || content.title,
      images: content.imageUrl ? [content.imageUrl] : undefined,
    },
    alternates: {
      canonical: `/informasi/${slug}`,
    },
  };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContent(slug);

  if (!content) {
    notFound();
  }

  // Increment view count (fire and forget)
  incrementViewCount(slug);

  const Icon = categoryIcons[content.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === content.category)
      ?.label || content.category;

  let externalLinks: { title: string; url: string }[] = [];
  if (content.externalLinks) {
    try {
      externalLinks = JSON.parse(content.externalLinks);
    } catch {
      externalLinks = [];
    }
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.title,
    description: content.excerpt || content.title,
    image: content.imageUrl || undefined,
    author: content.authorName
      ? {
          "@type": "Person",
          name: content.authorName,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "RISKA HD",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    datePublished: content.publishedAt?.toISOString(),
    dateModified: content.createdAt?.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/informasi/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-sky-600">
                Beranda
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/informasi" className="hover:text-sky-600">
                Ruang Informasi
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {content.title}
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/informasi">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
        </div>

        <article className="max-w-4xl mx-auto" itemScope itemType="https://schema.org/Article">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${categoryColors[content.category]} gap-1 border-0`}>
                <Icon className="h-3 w-3" />
                {categoryLabel}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" itemProp="headline">
              {content.title}
            </h1>

            {content.excerpt && (
              <p className="text-lg text-muted-foreground mb-4" itemProp="description">
                {content.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {content.authorName && (
                <div className="flex items-center gap-1" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <User className="h-4 w-4" />
                  <span itemProp="name">{content.authorName}</span>
                </div>
              )}
              {content.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={content.publishedAt.toISOString()} itemProp="datePublished">
                    {format(new Date(content.publishedAt), "d MMMM yyyy", {
                      locale: id,
                    })}
                  </time>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {content.viewCount + 1} views
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {content.imageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={content.imageUrl}
                alt={content.title}
                fill
                className="object-cover"
                priority
                itemProp="image"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900
              prose-p:text-gray-700
              prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg
              prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50 prose-blockquote:py-1 prose-blockquote:not-italic
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: content.content }}
            itemProp="articleBody"
          />

          {/* External Links */}
          {externalLinks.length > 0 && (
            <aside className="mt-8 p-6 bg-gray-50 rounded-xl border">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Link Terkait
              </h2>
              <ul className="space-y-2">
                {externalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:underline flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>
      </div>
    </>
  );
}
