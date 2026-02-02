import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { ruangInformasi, user } from "@/db/schema";
import { eq, and, sql, ne, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Eye,
  ArrowLeft,
  Video,
  FileText,
  Megaphone,
  BookOpen,
  ExternalLink,
  BookmarkPlus,
  Share,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RUANG_INFORMASI_CATEGORIES } from "@/lib/validations/ruang-informasi";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ReadingProgress } from "./reading-progress";
import { ArticleActions } from "./article-actions";

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

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ""); // Strip HTML
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

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
      authorImage: user.image,
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

async function getRelatedArticles(currentSlug: string, category: string) {
  const items = await db
    .select({
      id: ruangInformasi.id,
      title: ruangInformasi.title,
      slug: ruangInformasi.slug,
      excerpt: ruangInformasi.excerpt,
      imageUrl: ruangInformasi.imageUrl,
      authorName: user.name,
      publishedAt: ruangInformasi.publishedAt,
    })
    .from(ruangInformasi)
    .leftJoin(user, eq(ruangInformasi.authorId, user.id))
    .where(
      and(
        eq(ruangInformasi.category, category),
        eq(ruangInformasi.isActive, true),
        eq(ruangInformasi.isPublished, true),
        ne(ruangInformasi.slug, currentSlug)
      )
    )
    .orderBy(desc(ruangInformasi.publishedAt))
    .limit(3);

  return items;
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

  const readingTime = calculateReadingTime(content.content);

  let externalLinks: { title: string; url: string }[] = [];
  if (content.externalLinks) {
    try {
      externalLinks = JSON.parse(content.externalLinks);
    } catch {
      externalLinks = [];
    }
  }

  const relatedArticles = await getRelatedArticles(slug, content.category);

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

      {/* Reading Progress Bar */}
      <ReadingProgress />

      <div className="min-h-screen bg-white">
        {/* Back Button - Fixed on mobile */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:relative lg:border-0 lg:bg-transparent">
          <div className="max-w-[680px] mx-auto px-4 py-3">
            <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2 text-gray-600 hover:text-gray-900">
              <Link href="/informasi">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali ke Daftar</span>
                <span className="sm:hidden">Kembali</span>
              </Link>
            </Button>
          </div>
        </div>

        <article className="max-w-[680px] mx-auto px-4 py-8 lg:py-12" itemScope itemType="https://schema.org/Article">
          {/* Header */}
          <header className="mb-8">
            {/* Category */}
            <div className="flex items-center gap-3 mb-6">
              <Badge className={`${categoryColors[content.category]} gap-1.5 border-0 font-medium`}>
                <Icon className="h-3.5 w-3.5" />
                {categoryLabel}
              </Badge>
            </div>

            {/* Title - Medium style: Large, serif font, soft black */}
            <h1
              className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold leading-[1.25] tracking-[-0.016em] mb-6"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "rgba(41, 41, 41, 1)" }}
              itemProp="headline"
            >
              {content.title}
            </h1>

            {/* Subtitle/Excerpt - Medium style */}
            {content.excerpt && (
              <p
                className="text-[18px] sm:text-[20px] leading-[1.6] mb-8"
                style={{ fontFamily: "'Georgia', serif", color: "rgba(117, 117, 117, 1)" }}
                itemProp="description"
              >
                {content.excerpt}
              </p>
            )}

            {/* Author & Meta - Medium style */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-gray-100">
              <div className="flex items-center gap-3">
                {/* Author Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  {content.authorImage ? (
                    <Image
                      src={content.authorImage}
                      alt={content.authorName || "Author"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {content.authorName?.charAt(0) || "A"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium" style={{ color: "rgba(41, 41, 41, 1)" }} itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{content.authorName || "RISKA HD"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[14px]" style={{ color: "rgba(117, 117, 117, 1)" }}>
                    {content.publishedAt && (
                      <time dateTime={content.publishedAt.toISOString()} itemProp="datePublished">
                        {format(new Date(content.publishedAt), "d MMM yyyy", { locale: id })}
                      </time>
                    )}
                    <span>·</span>
                    <span>{readingTime} min read</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {content.viewCount + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Medium style */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <BookmarkPlus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <Share className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image - Full width bleed */}
          {content.imageUrl && (
            <figure className="relative -mx-4 sm:mx-0 mb-10">
              <div className="relative aspect-[16/9] sm:rounded-lg overflow-hidden">
                <Image
                  src={content.imageUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  priority
                  itemProp="image"
                />
              </div>
            </figure>
          )}

          {/* Video Embed */}
          {content.videoUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-10 bg-gray-100">
              <iframe
                src={content.videoUrl.replace("watch?v=", "embed/")}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {/* Content - Medium typography with optimal reading experience */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-[-0.016em]
              prose-h2:text-[22px] sm:prose-h2:text-[24px] prose-h2:mt-[2em] prose-h2:mb-[0.5em] prose-h2:leading-[1.3]
              prose-h3:text-[18px] sm:prose-h3:text-[20px] prose-h3:mt-[1.5em] prose-h3:mb-[0.4em] prose-h3:leading-[1.4]
              prose-p:text-[18px] sm:prose-p:text-[20px] prose-p:leading-[1.75] prose-p:mb-[1.5em]
              prose-a:no-underline hover:prose-a:underline prose-a:font-normal
              prose-strong:font-semibold
              prose-blockquote:border-l-[3px] prose-blockquote:pl-[1.5em] prose-blockquote:py-0 prose-blockquote:not-italic
              prose-blockquote:text-[18px] sm:prose-blockquote:text-[20px] prose-blockquote:leading-[1.75]
              prose-blockquote:bg-transparent prose-blockquote:my-[2em]
              prose-img:rounded-lg prose-img:my-[2em]
              prose-figure:my-[2.5em]
              prose-figcaption:text-center prose-figcaption:text-[14px] prose-figcaption:mt-[0.75em]
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[16px]
              prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:rounded-lg
              prose-ul:my-[1.5em] prose-ol:my-[1.5em] prose-ul:pl-[1.5em] prose-ol:pl-[1.5em]
              prose-li:text-[18px] sm:prose-li:text-[20px] prose-li:leading-[1.75] prose-li:my-[0.5em]
              prose-hr:my-[3em]
              [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "rgba(41, 41, 41, 1)",
              // CSS variables for prose colors
              "--tw-prose-body": "rgba(41, 41, 41, 1)",
              "--tw-prose-headings": "rgba(41, 41, 41, 1)",
              "--tw-prose-bold": "rgba(41, 41, 41, 1)",
              "--tw-prose-links": "rgba(16, 185, 129, 1)",
              "--tw-prose-quotes": "rgba(41, 41, 41, 1)",
              "--tw-prose-quote-borders": "rgba(41, 41, 41, 1)",
              "--tw-prose-captions": "rgba(117, 117, 117, 1)",
              "--tw-prose-hr": "rgba(230, 230, 230, 1)",
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: content.content }}
            itemProp="articleBody"
          />

          {/* External Links */}
          {externalLinks.length > 0 && (
            <aside className="mt-[3em] p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h2 className="font-semibold text-[16px] mb-4 flex items-center gap-2" style={{ color: "rgba(41, 41, 41, 1)" }}>
                <ExternalLink className="h-5 w-5" />
                Referensi & Link Terkait
              </h2>
              <ul className="space-y-3">
                {externalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-2 text-[15px]"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Article Actions - Floating on desktop */}
          <ArticleActions title={content.title} slug={slug} />

          {/* Tags / Category Footer */}
          <footer className="mt-[3em] pt-[2em] border-t border-gray-100">
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-[13px] font-normal" style={{ color: "rgba(41, 41, 41, 1)" }}>
                Hemodialisis
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-[13px] font-normal" style={{ color: "rgba(41, 41, 41, 1)" }}>
                Kesehatan Ginjal
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-[13px] font-normal" style={{ color: "rgba(41, 41, 41, 1)" }}>
                {categoryLabel}
              </Badge>
            </div>

            {/* Author Card - Medium style */}
            <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                {content.authorImage ? (
                  <Image
                    src={content.authorImage}
                    alt={content.authorName || "Author"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-2xl">
                    {content.authorName?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-[13px] mb-1" style={{ color: "rgba(117, 117, 117, 1)" }}>Ditulis oleh</p>
                <h3 className="font-semibold text-[17px]" style={{ color: "rgba(41, 41, 41, 1)" }}>
                  {content.authorName || "Tim RISKA HD"}
                </h3>
                <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: "rgba(117, 117, 117, 1)" }}>
                  Menyediakan informasi kesehatan terpercaya untuk pasien hemodialisis dan keluarga.
                </p>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-gray-100 bg-gray-50 py-12">
            <div className="max-w-[900px] mx-auto px-4">
              <h2 className="text-[22px] font-bold mb-8 text-center" style={{ color: "rgba(41, 41, 41, 1)" }}>
                Artikel Terkait
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/informasi/${article.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-[16/10] bg-gray-100">
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                          <FileText className="h-10 w-10 text-emerald-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[16px] leading-[1.4] line-clamp-2 group-hover:text-emerald-600 transition-colors" style={{ color: "rgba(41, 41, 41, 1)" }}>
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-[14px] leading-[1.5] line-clamp-2 mt-2" style={{ color: "rgba(117, 117, 117, 1)" }}>
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3 text-[12px]" style={{ color: "rgba(117, 117, 117, 1)" }}>
                        <span>{article.authorName || "RISKA HD"}</span>
                        {article.publishedAt && (
                          <>
                            <span>·</span>
                            <span>
                              {format(new Date(article.publishedAt), "d MMM", { locale: id })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
