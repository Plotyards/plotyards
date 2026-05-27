"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ArrowRight, BookOpen, CalendarDays, Search } from 'lucide-react';

import { apiRequest, buildQuery } from '../lib/api';

const formatDate = (value) => {
  if (!value) return 'Recently updated';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiRequest(`/blogs${buildQuery({
          limit: 24,
          category: selectedCategory,
          search
        })}`);
        if (cancelled) return;
        setBlogs(data.blogs || []);
        setCategories(data.categories || []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Unable to load blogs.');
        setBlogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBlogs();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, search]);

  const featuredBlog = blogs[0];
  const restBlogs = featuredBlog ? blogs.slice(1) : blogs;
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Plotyards Blogs and Articles',
    description: 'Real estate investment guides, property buying checklists, broker marketing tips, and plot investment articles.',
    url: (typeof window !== 'undefined' ? window.location.href : '')
  };

  return (
    <div className="min-h-screen bg-surface pb-28 pt-4 md:pb-16 md:pt-28">
      
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12">
        <section className="grid gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm md:gap-8 md:rounded-[2rem] md:p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <span className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary md:inline-flex">
              <BookOpen size={14} />
              Real estate insights
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-text md:mt-5 md:text-4xl lg:text-5xl">Blogs & Articles</h1>
            <p className="mt-4 hidden max-w-3xl text-base font-medium leading-8 text-muted md:block">
              Practical guides for plot buyers, real estate investors, and brokers who want clearer property decisions.
            </p>
          </div>
          <div className="grid gap-3 rounded-xl bg-surface p-3 md:rounded-2xl md:border md:border-border md:p-4">
            <label className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-white px-4">
              <Search size={17} className="text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 w-full bg-transparent text-sm font-semibold text-text outline-none placeholder:text-muted"
                placeholder="Search articles..."
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap md:overflow-visible md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${!selectedCategory ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'}`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${selectedCategory === category ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-primary">{error}</p>}

        {loading ? (
          <p className="mt-10 rounded-2xl bg-white p-8 text-sm font-bold text-muted">Loading articles...</p>
        ) : blogs.length ? (
          <>
            {featuredBlog && (
              <Link href={`/blogs/${featuredBlog.slug}`} className="group mt-6 grid overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl md:mt-8 md:rounded-[2rem] lg:grid-cols-[0.95fr_1.05fr]">
                <div className="aspect-[16/10] overflow-hidden bg-surface md:min-h-72 md:aspect-auto">
                  <img src={featuredBlog.coverImage || '/hero-bg.jpg'} alt={featuredBlog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-center p-5 md:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{featuredBlog.category}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Featured</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold leading-tight text-text group-hover:text-primary md:text-3xl">{featuredBlog.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-muted md:mt-4">{featuredBlog.excerpt}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-muted">
                    <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(featuredBlog.publishedAt || featuredBlog.createdAt)}</span>
                    <span>{featuredBlog.readingTime || 1} min read</span>
                    <span>{featuredBlog.author?.name || 'Plotyards'}</span>
                  </div>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-extrabold text-primary">
                    Read article <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {restBlogs.map((blog) => (
                <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <div className="aspect-[16/10] overflow-hidden bg-surface">
                    <img src={blog.coverImage || '/hero-bg.jpg'} alt={blog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary">{blog.category}</span>
                    <h3 className="mt-4 text-xl font-extrabold leading-tight text-text group-hover:text-primary">{blog.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-muted">{blog.excerpt}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-muted">
                      <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                      <span>{blog.readingTime || 1} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <BookOpen size={30} className="mx-auto text-primary" />
            <p className="mt-3 text-sm font-extrabold text-text">No articles found.</p>
            <p className="mt-1 text-xs font-semibold text-muted">Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
