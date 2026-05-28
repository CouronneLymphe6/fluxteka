import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  coverImage?: string;
  tags: string[];
  content: string;
}

export function getPostSlugs() {
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const realSlug = slug.replace(/\.mdx?$/, '');
    const fullPath = path.join(contentDir, `${realSlug}.md`);
    let fileContents;
    try {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } catch {
      fileContents = fs.readFileSync(path.join(contentDir, `${realSlug}.mdx`), 'utf8');
    }
    
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author || 'Fluxteka Team',
      coverImage: data.coverImage || null,
      tags: data.tags || [],
      content,
    };
  } catch (err) {
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
