"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ArrowLeft, CalendarDays, ChevronRight, Clock, Facebook, FileText, Instagram, Link as LinkIcon, UserRound, Youtube } from 'lucide-react';

import { apiRequest } from '../lib/api';

const formatDate = (value) => {
  if (!value) return 'Recently updated';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    
    // Only set loading to true initially, not on background polls
    setLoading(true);

    const loadBlog = async () => {
      try {
        const data = await apiRequest(`/blogs/${slug}`);
        if (cancelled) return;
        setBlog(data.blog);

        const relatedData = await apiRequest('/blogs?limit=4');
        if (cancelled) return;
        setRelatedBlogs((relatedData.blogs || []).filter((item) => item.slug !== data.blog.slug).slice(0, 3));
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Blog not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBlog();
    const interval = setInterval(loadBlog, 3000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16">
        <div className="container mx-auto max-w-4xl px-6">
          <p className="rounded-2xl bg-white p-8 text-sm font-bold text-muted">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-border bg-white p-8 text-center">
            <p className="text-lg font-extrabold text-text">Article not found</p>
            <p className="mt-2 text-sm font-medium text-muted">{error || 'This article may have been removed.'}</p>
            <Link href="/blogs" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white">Back to blogs</Link>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = String(blog.content || '').split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.coverImage || '/hero-bg.jpg',
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'Plotyards Editorial'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Plotyards'
    },
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt
  };

  return (
    <div className="min-h-screen bg-surface pt-28 pb-16">
      
      <div className="container mx-auto max-w-5xl px-6 lg:px-12">
        <Link href="/blogs" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-extrabold text-text shadow-sm transition-colors hover:border-primary hover:text-primary">
          <ArrowLeft size={16} />
          Back to blogs
        </Link>

        <article className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-white shadow-sm">
          <div className="aspect-[16/8] min-h-72 overflow-hidden bg-surface">
            <img src={blog.coverImage || '/hero-bg.jpg'} alt={blog.title} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{blog.category || 'Real Estate'}</span>
              {blog.featured && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Featured</span>}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-text lg:text-5xl">{blog.title}</h1>
            <p className="mt-5 text-base font-medium leading-8 text-muted">{blog.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-border py-4 text-sm font-bold text-muted">
              <span className="inline-flex items-center gap-2"><UserRound size={16} /> {blog.author?.name || 'Plotyards Editorial'}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
              <span className="inline-flex items-center gap-2"><Clock size={16} /> {blog.readingTime || 1} min read</span>
            </div>

            <div className="mt-8 space-y-6 text-base font-medium leading-8 text-text/80 lg:text-lg lg:leading-9">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {blog.socialLinks?.length > 0 && (
              <div className="mt-8 rounded-2xl bg-surface p-6">
                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-muted">Follow Author on Social Media</h3>
                <div className="flex flex-wrap items-center gap-4">
                  {blog.socialLinks.map((link, index) => {
                    const Icon = link.platform === 'instagram' ? Instagram : link.platform === 'facebook' ? Facebook : link.platform === 'youtube' ? Youtube : LinkIcon;
                    const hoverColor = link.platform === 'instagram' ? 'hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50' : link.platform === 'facebook' ? 'hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50' : link.platform === 'youtube' ? 'hover:text-red-600 hover:border-red-200 hover:bg-red-50' : 'hover:text-primary hover:border-primary/20 hover:bg-primary/5';
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-extrabold text-text shadow-sm transition-all ${hoverColor}`}
                      >
                        <Icon size={18} />
                        {link.label || 'Link'}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {blog.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {blog.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {relatedBlogs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold text-text">More articles</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {relatedBlogs.map((item) => (
                <Link key={item.slug} href={`/blogs/${item.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <div className="aspect-video overflow-hidden bg-surface">
                    <img src={item.coverImage || '/hero-bg.jpg'} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-primary">{item.category}</p>
                    <h3 className="mt-2 text-base font-extrabold leading-tight text-text group-hover:text-primary">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;
