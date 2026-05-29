import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { getAllPosts } from '@/lib/blog';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Fluxteka | Actualités, Tutoriels et Comparatifs IA',
  description: 'Découvrez nos articles sur l\'automatisation, les agents IA, et des tutoriels sur Make, n8n et Zapier.',
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-border">
        <div className="container-page py-16 text-center">
          <h1 className="font-heading text-4xl font-bold text-text-primary md:text-5xl">
            Le Blog Fluxteka
          </h1>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Tendances, tutoriels et comparatifs pour maîtriser l'automatisation et l'IA.
          </p>
        </div>
      </div>

      <div className="container-page py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <h3 className="text-xl font-bold text-text-primary">Aucun article publié.</h3>
            <p className="mt-2 text-text-secondary">Revenez très bientôt !</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl border border-border bg-white shadow-sm hover:shadow-lg transition-all hover:border-primary-300 overflow-hidden">
                <div className="flex-1 p-6">
                  {post.tags?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-600 uppercase tracking-wider">
                          <Tag className="h-3 w-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-heading text-xl font-bold text-text-primary group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm text-text-secondary line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>
                <div className="border-t border-border bg-gray-50 p-6 pt-4 flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-primary-600 group-hover:text-primary-700">Lire <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
