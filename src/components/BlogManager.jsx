"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { CheckCircle2, Edit3, ExternalLink, FileText, Image, Plus, Trash2, Upload, XCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import DropdownSelect from './DropdownSelect';

const BLOG_CATEGORIES = [
  'Investment Guide',
  'Buyer Checklist',
  'Location Strategy',
  'Associate Partner Marketing',
  'Market Trends',
  'Legal & Documents',
  'Real Estate News'
];

const emptyBlogForm = {
  title: '',
  excerpt: '',
  category: 'Investment Guide',
  tags: '',
  coverImage: '',
  content: '',
  status: 'published',
  featured: false,
  socialLinks: []
};

const splitTags = (value) => String(value || '')
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean)
  .slice(0, 10);

const formatBlogDate = (value) => {
  if (!value) return 'Not published';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const BlogManager = ({
  title = 'Blogs & Articles',
  description = 'Create practical property content for buyers and investors.',
  canCreate = true,
  lockedMessage = '',
  showAuthor = false,
  showFeatured = false
}) => {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyBlogForm);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({ provider: 'manual', uploadPreset: '', cloudName: '', message: '' });
  const [tagDraft, setTagDraft] = useState('');
  const [status, setStatus] = useState('');

  const loadBlogs = useCallback(async () => {
    try {
      const data = await apiRequest('/blogs/mine');
      setBlogs(data.blogs || []);
    } catch (error) {
      setBlogs([]);
      setStatus(error.message || 'Unable to load blogs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadBlogs();
      apiRequest('/service/uploads/signature')
        .then((data) => setUploadConfig(data))
        .catch(() => setUploadConfig((current) => ({ ...current, provider: 'manual', message: 'Image upload is not configured.' })));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBlogs]);

  const resetForm = () => {
    setEditingBlog(null);
    setForm(emptyBlogForm);
    setTagDraft('');
  };

  const editBlog = (blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      category: blog.category || 'Investment Guide',
      tags: (blog.tags || []).join(', '),
      coverImage: blog.coverImage || '',
      content: blog.content || '',
      status: blog.status || 'published',
      featured: Boolean(blog.featured),
      socialLinks: blog.socialLinks || []
    });
    setTagDraft('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitBlog = async (event) => {
    event.preventDefault();
    if (!canCreate) return;

    try {
      setSaving(true);
      setStatus('');
      const payload = {
        ...form,
        tags: splitTags([form.tags, tagDraft].filter(Boolean).join(', '))
      };
      const endpoint = editingBlog ? `/blogs/${editingBlog._id}` : '/blogs';
      const method = editingBlog ? 'PATCH' : 'POST';
      await apiRequest(endpoint, { method, body: payload });
      setStatus(editingBlog ? 'Blog updated successfully.' : 'Blog published successfully.');
      resetForm();
      await loadBlogs();
    } catch (error) {
      setStatus(error.message || 'Unable to save blog.');
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}" permanently?`)) return;

    try {
      setStatus('');
      await apiRequest(`/blogs/${blog._id}`, { method: 'DELETE' });
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      if (editingBlog?._id === blog._id) resetForm();
      setStatus('Blog deleted.');
    } catch (error) {
      setStatus(error.message || 'Unable to delete blog.');
    }
  };

  const updateTags = (tags) => {
    setForm((current) => ({ ...current, tags: tags.join(', ') }));
  };

  const addTags = (rawTags) => {
    const currentTags = splitTags(form.tags);
    const nextTags = [...currentTags];

    rawTags.forEach((rawTag) => {
      const tag = String(rawTag || '').trim().replace(/^,+|,+$/g, '');
      const isDuplicate = nextTags.some((item) => item.toLowerCase() === tag.toLowerCase());
      if (tag && !isDuplicate && nextTags.length < 10) {
        nextTags.push(tag);
      }
    });

    updateTags(nextTags);
    setTagDraft('');
  };

  const removeTag = (tagToRemove) => {
    updateTags(splitTags(form.tags).filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleTagChange = (event) => {
    const value = event.target.value;
    if (value.includes(',')) {
      addTags(value.split(','));
      return;
    }
    setTagDraft(value);
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTags([tagDraft]);
      return;
    }

    if (event.key === 'Backspace' && !tagDraft) {
      const currentTags = splitTags(form.tags);
      if (currentTags.length) {
        updateTags(currentTags.slice(0, -1));
      }
    }
  };

  const addSocialLink = () => {
    setForm((current) => ({
      ...current,
      socialLinks: [...(current.socialLinks || []), { platform: 'instagram', url: '', label: '' }]
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setForm((current) => {
      const nextLinks = [...(current.socialLinks || [])];
      nextLinks[index] = { ...nextLinks[index], [field]: value };
      return { ...current, socialLinks: nextLinks };
    });
  };

  const removeSocialLink = (index) => {
    setForm((current) => ({
      ...current,
      socialLinks: (current.socialLinks || []).filter((_, i) => i !== index)
    }));
  };

  const uploadCoverImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus('Image size should be 5 MB or less.');
      return;
    }

    if (uploadConfig.provider !== 'cloudinary' || !uploadConfig.uploadPreset || !uploadConfig.cloudName) {
      setStatus(uploadConfig.message || 'Cloudinary upload is not configured. Use image URL for now.');
      return;
    }

    try {
      setImageUploading(true);
      setStatus('');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadConfig.uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Image upload failed.');
      }

      setForm((current) => ({ ...current, coverImage: data.secure_url }));
      setStatus('Cover image uploaded successfully.');
    } catch (error) {
      setStatus(error.message || 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  };

  const loweredStatus = status.toLowerCase();
  const isErrorStatus = loweredStatus.includes('unable')
    || loweredStatus.includes('only premium')
    || loweredStatus.includes('not configured')
    || loweredStatus.includes('failed')
    || loweredStatus.includes('5 mb');
  const selectedCategory = BLOG_CATEGORIES.includes(form.category) ? form.category : 'Other';
  const selectedTags = splitTags(form.tags);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-text">{title}</h2>
          <p className="mt-2 text-sm font-medium text-muted">{description}</p>
        </div>
        <Link href="/blogs" className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-extrabold text-text shadow-sm transition-colors hover:border-primary hover:text-primary">
          <ExternalLink size={16} />
          Public blogs
        </Link>
      </div>

      {!canCreate && lockedMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
          {lockedMessage}
        </div>
      )}

      {status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md scale-100 animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl duration-200">
            <div className="flex flex-col items-center text-center">
              {isErrorStatus ? (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-primary">
                  <XCircle size={28} />
                </div>
              ) : (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={28} />
                </div>
              )}
              <h3 className={`text-xl font-extrabold ${isErrorStatus ? 'text-primary' : 'text-emerald-700'}`}>
                {isErrorStatus ? 'Action Failed' : 'Success'}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">
                {status}
              </p>
              <button
                type="button"
                onClick={() => setStatus('')}
                className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submitBlog} className="grid gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-text">{editingBlog ? 'Edit article' : 'Write new article'}</p>
            <p className="mt-1 text-xs font-semibold text-muted">Publish useful content about properties, locations, documents, and investment decisions.</p>
          </div>
          {editingBlog && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-extrabold text-muted transition-colors hover:text-primary"
            >
              <XCircle size={14} />
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-text">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              disabled={!canCreate || saving}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
              placeholder="Example: Best plots for long-term investment"
              required
            />
          </label>
          <div className="grid gap-1 text-sm font-bold text-text">
            <span>Category</span>
            <DropdownSelect
              value={selectedCategory}
              onChange={(value) => setForm({ ...form, category: value === 'Other' ? '' : value })}
              options={[...BLOG_CATEGORIES, 'Other']}
              placeholder="Choose category"
              disabled={!canCreate || saving}
              icon={FileText}
              className="[&>button]:bg-surface [&>button]:border-border [&>button]:shadow-none [&>button]:focus:ring-primary/20"
            />
            {selectedCategory === 'Other' && (
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                disabled={!canCreate || saving}
                className="mt-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
                placeholder="Write custom category"
                required
              />
            )}
          </div>
        </div>

        <label className="grid gap-1 text-sm font-bold text-text">
          Short SEO excerpt
          <textarea
            value={form.excerpt}
            onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            disabled={!canCreate || saving}
            className="min-h-20 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
            placeholder="Write a 1-2 line summary that can appear on Google and blog cards."
            required
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3 text-sm font-bold text-text">
            Cover image
            <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="Blog cover preview" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-muted">
                    <Image size={28} />
                    <span className="text-xs font-bold">No cover image selected</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600 ${!canCreate || saving || imageUploading ? 'pointer-events-none opacity-60' : ''}`}>
                  <Upload size={16} />
                  {imageUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadCoverImage}
                    disabled={!canCreate || saving || imageUploading}
                    className="hidden"
                  />
                </label>
                {form.coverImage && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coverImage: '' })}
                    disabled={!canCreate || saving || imageUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-extrabold text-primary transition-colors hover:bg-rose-100 disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    Remove
                  </button>
                )}
              </div>
              {uploadConfig.provider === 'cloudinary' && uploadConfig.uploadPreset && uploadConfig.cloudName ? (
                <p className="text-xs font-semibold text-muted">Images upload directly to Cloudinary.</p>
              ) : (
                <p className="text-xs font-semibold text-rose-600">{uploadConfig.message || 'Cloudinary upload is not configured.'}</p>
              )}
              <input
                value={form.coverImage}
                onChange={(event) => setForm({ ...form, coverImage: event.target.value })}
                disabled={!canCreate || saving || imageUploading}
                className="rounded-xl border border-border bg-white px-4 py-3 text-xs font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
                placeholder="Or paste image URL"
              />
            </div>
          </div>
          <div className="grid content-start gap-2 text-sm font-bold text-text">
            <div className="flex items-center justify-between gap-3">
              <span>Tags</span>
              <span className="text-xs font-extrabold text-muted">{selectedTags.length}/10</span>
            </div>
            <div className={`min-h-[3.25rem] rounded-2xl border border-border bg-surface p-2 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${!canCreate || saving ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
                    <span className="max-w-[180px] truncate">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={!canCreate || saving}
                      className="rounded-full text-primary/70 transition-colors hover:text-primary disabled:cursor-not-allowed"
                      aria-label={`Remove ${tag}`}
                    >
                      <XCircle size={14} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagDraft}
                  onChange={handleTagChange}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => addTags([tagDraft])}
                  disabled={!canCreate || saving || selectedTags.length >= 10}
                  className="min-w-[150px] flex-1 bg-transparent px-2 py-2 text-sm font-semibold text-text outline-none placeholder:text-muted disabled:cursor-not-allowed"
                  placeholder={selectedTags.length ? 'Add another tag' : 'Type tag and press Enter'}
                />
              </div>
            </div>
            <p className="text-xs font-semibold leading-5 text-muted">Use focused SEO tags like plot investment, RERA, land documents, or location names.</p>
          </div>
        </div>

        <div className="grid content-start gap-3 text-sm font-bold text-text">
          <div className="flex items-center justify-between gap-3">
            <span>Social Links</span>
            <button type="button" onClick={addSocialLink} disabled={!canCreate || saving} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary transition-colors hover:bg-primary/20">
              <Plus size={14} /> Add Link
            </button>
          </div>
          {form.socialLinks?.length > 0 ? (
            <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
              {form.socialLinks.map((link, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center">
                  <DropdownSelect
                    value={link.platform}
                    onChange={(value) => updateSocialLink(index, 'platform', value)}
                    options={[
                      { value: 'instagram', label: 'Instagram' },
                      { value: 'facebook', label: 'Facebook' },
                      { value: 'youtube', label: 'YouTube' },
                      { value: 'other', label: 'Other' }
                    ]}
                    disabled={!canCreate || saving}
                    className="min-w-[140px] [&>button]:min-h-[42px] [&>button]:bg-surface [&>button]:shadow-none"
                  />
                  <input
                    value={link.label}
                    onChange={(e) => updateSocialLink(index, 'label', e.target.value)}
                    disabled={!canCreate || saving}
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
                    placeholder="Label (e.g. My Insta)"
                  />
                  <input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    disabled={!canCreate || saving}
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
                    placeholder="Profile URL"
                  />
                  <button type="button" onClick={() => removeSocialLink(index)} disabled={!canCreate || saving} className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50" aria-label="Remove link">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold leading-5 text-muted">Add your Instagram, Facebook, or YouTube links to show in this post.</p>
          )}
        </div>

        <label className="grid gap-1 text-sm font-bold text-text">
          Article content
          <textarea
            value={form.content}
            onChange={(event) => setForm({ ...form, content: event.target.value })}
            disabled={!canCreate || saving}
            className="min-h-56 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold leading-7 text-text outline-none transition-colors focus:border-primary disabled:opacity-60"
            placeholder="Write buyer-friendly advice in short paragraphs..."
            required
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid min-w-44 gap-1 text-sm font-bold text-text">
              <span>Status</span>
              <DropdownSelect
                value={form.status}
                onChange={(value) => setForm({ ...form, status: value })}
                options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' }
                ]}
                disabled={!canCreate || saving}
                className="[&>button]:min-h-11 [&>button]:bg-white [&>button]:shadow-none"
              />
            </div>
            {showFeatured && (
              <label className="flex items-center gap-2 text-sm font-bold text-text">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm({ ...form, featured: event.target.checked })}
                  disabled={!canCreate || saving}
                  className="h-4 w-4 accent-primary"
                />
                Featured article
              </label>
            )}
          </div>
          <button
            disabled={!canCreate || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingBlog ? <CheckCircle2 size={16} /> : <Plus size={16} />}
            {saving ? 'Saving...' : editingBlog ? 'Update Blog' : 'Publish Blog'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-lg font-extrabold text-text">Your blog posts</h3>
          <p className="mt-1 text-sm font-medium text-muted">{showAuthor ? 'All published and draft blog posts from admins and associate partners.' : 'Your published and draft articles appear here.'}</p>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <p className="p-6 text-sm font-bold text-muted">Loading blogs...</p>
          ) : blogs.length ? blogs.map((blog) => (
            <article key={blog._id} className="grid gap-4 p-5 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-start">
              <div className="aspect-video overflow-hidden rounded-xl bg-surface lg:aspect-square">
                {blog.coverImage ? (
                  <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <FileText size={24} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{blog.category || 'Real Estate'}</span>
                  <span className={`rounded-full px-3 py-1 ${blog.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-muted'}`}>
                    {blog.status || 'draft'}
                  </span>
                  {blog.featured && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Featured</span>}
                </div>
                <h4 className="mt-3 text-lg font-extrabold leading-tight text-text">{blog.title}</h4>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-muted">{blog.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-muted">
                  <span>{formatBlogDate(blog.publishedAt || blog.createdAt)}</span>
                  <span>{blog.readingTime || 1} min read</span>
                  {showAuthor && <span>{blog.author?.name || 'Author'}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {blog.slug && (
                  <Link href={`/blogs/${blog.slug}`} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-extrabold text-text transition-colors hover:border-primary hover:text-primary">
                    <ExternalLink size={14} />
                    View
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => editBlog(blog)}
                  className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlog(blog)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-primary transition-colors hover:bg-rose-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </article>
          )) : (
            <div className="p-8 text-center">
              <FileText size={28} className="mx-auto text-primary" />
              <p className="mt-3 text-sm font-extrabold text-text">No blogs yet.</p>
              <p className="mt-1 text-xs font-semibold text-muted">Write the first article to start building organic SEO traffic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManager;
