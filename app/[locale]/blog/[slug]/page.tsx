import { getPostBySlug, getPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Article introuvable - Fluxteka' };
  }

  return {
    title: `${post.title} - Blog Fluxteka`,
    description: post.description,
  };
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, ''),
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container-page py-12 md:py-20">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>
          
          {post.tags?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 uppercase tracking-wider">
                  <Tag className="h-3.5 w-3.5" /> {tag}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="font-heading text-4xl font-bold text-text-primary md:text-5xl lg:text-6xl leading-tight">
            {post.title}
          </h1>
          
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-xs">
                {post.author.charAt(0)}
              </div>
              <span className="font-medium text-text-primary">{post.author}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-page mt-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 md:p-12 shadow-sm border border-border">
          <article className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-a:text-primary-600 prose-img:rounded-2xl">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
