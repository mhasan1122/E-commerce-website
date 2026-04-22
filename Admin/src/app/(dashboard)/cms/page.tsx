"use client";

import React, { useState } from "react";
import { 
  FileText, Settings, HelpCircle, BookOpen, Plus, Edit3, Eye,
  Share2, Trash2, Layout, ExternalLink, ChevronRight, MoreVertical,
  CheckCircle2, Globe, X, AlignLeft, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";

type BlogPost = {
  id: number;
  title: string;
  author: string;
  status: "Published" | "Draft";
  date: string;
  category: string;
};

type StaticPage = {
  id: number;
  name: string;
  link: string;
  status: "Active" | "Draft";
  lastEdited: string;
};

type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
};

const initialPosts: BlogPost[] = [
  { id: 1, title: "Summer Fashion Trends 2026", author: "Hasan Mirza", status: "Published", date: "2026-04-15", category: "Style Guide" },
  { id: 2, title: "How to maintain your Silk Saree", author: "Muna Alam", status: "Draft", date: "2026-04-20", category: "Fabric Care" },
  { id: 3, title: "Sustainable E-commerce: Our Journey", author: "Sufian Khan", status: "Published", date: "2026-04-10", category: "Company" },
];

const initialPages: StaticPage[] = [
  { id: 1, name: "About Us", link: "/about", status: "Active", lastEdited: "2 days ago" },
  { id: 2, name: "Terms of Service", link: "/terms", status: "Active", lastEdited: "1 month ago" },
  { id: 3, name: "Privacy Policy", link: "/privacy", status: "Active", lastEdited: "1 month ago" },
  { id: 4, name: "Return Policy", link: "/returns", status: "Active", lastEdited: "1 week ago" },
];

const initialFAQs: FAQ[] = [
  { id: 1, question: "What is your return policy?", answer: "We accept returns within 30 days of delivery.", category: "Orders" },
  { id: 2, question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days.", category: "Shipping" },
];

const categories = ["Style Guide", "Fabric Care", "Company", "News", "Tips", "Product Launch"];
const faqCategories = ["Orders", "Shipping", "Returns", "Payments", "Account", "Products"];

const emptyPostForm = { title: "", author: "", category: "", status: "Draft" as "Draft" | "Published" };
const emptyPageForm = { name: "", link: "" };
const emptyFAQForm = { question: "", answer: "", category: "" };

export default function CMSPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"blog" | "pages" | "faq">("blog");
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [pages, setPages] = useState<StaticPage[]>(initialPages);
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showCreateFAQ, setShowCreateFAQ] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showEditFAQ, setShowEditFAQ] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  const [postForm, setPostForm] = useState(emptyPostForm);
  const [pageForm, setPageForm] = useState(emptyPageForm);
  const [faqForm, setFAQForm] = useState(emptyFAQForm);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: "post" | "page" | "faq"; id: number; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().split("T")[0];
    const newPost: BlogPost = { id: Date.now(), title: postForm.title.trim(), author: postForm.author.trim() || "Hasan Mirza", category: postForm.category, status: postForm.status, date: now };
    setPosts((prev) => [newPost, ...prev]);
    setShowCreatePost(false);
    setPostForm(emptyPostForm);
    toast(`Post "${newPost.title}" ${newPost.status === "Published" ? "published" : "saved as draft"}!`);
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setPosts((prev) => prev.map((p) => p.id === editingPost.id ? { ...editingPost, title: postForm.title, author: postForm.author, category: postForm.category, status: postForm.status } : p));
    setShowEditPost(false);
    toast("Post updated!");
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage: StaticPage = { id: Date.now(), name: pageForm.name.trim(), link: pageForm.link.trim().startsWith("/") ? pageForm.link.trim() : `/${pageForm.link.trim()}`, status: "Draft", lastEdited: "just now" };
    setPages((prev) => [...prev, newPage]);
    setShowCreatePage(false);
    setPageForm(emptyPageForm);
    toast(`Page "${newPage.name}" created!`);
  };

  const handleCreateFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    const newFAQ: FAQ = { id: Date.now(), question: faqForm.question.trim(), answer: faqForm.answer.trim(), category: faqForm.category };
    setFaqs((prev) => [...prev, newFAQ]);
    setShowCreateFAQ(false);
    setFAQForm(emptyFAQForm);
    toast("FAQ entry added!");
  };

  const handleSaveEditFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ) return;
    setFaqs((prev) => prev.map((f) => f.id === editingFAQ.id ? { ...editingFAQ, question: faqForm.question, answer: faqForm.answer, category: faqForm.category } : f));
    setShowEditFAQ(false);
    toast("FAQ updated!");
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === "post") setPosts((prev) => prev.filter((p) => p.id !== deletingItem.id));
    else if (deletingItem.type === "page") setPages((prev) => prev.filter((p) => p.id !== deletingItem.id));
    else if (deletingItem.type === "faq") setFaqs((prev) => prev.filter((f) => f.id !== deletingItem.id));
    setShowDeleteConfirm(false);
    toast(`"${deletingItem.name}" deleted.`, "error");
    setDeletingItem(null);
  };

  const togglePostStatus = (post: BlogPost) => {
    const newStatus = post.status === "Published" ? "Draft" : "Published";
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: newStatus } : p));
    setOpenMenuId(null);
    toast(`Post ${newStatus === "Published" ? "published" : "unpublished"}!`);
  };

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Content <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Manage your store's copy, blog posts, FAQs, and static legal pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSEO(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Settings className="w-4 h-4" /> SEO Settings
          </button>
          <button onClick={() => { if (tab === "blog") setShowCreatePost(true); else if (tab === "pages") setShowCreatePage(true); else setShowCreateFAQ(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> Create {tab === "blog" ? "Post" : tab === "pages" ? "Page" : "FAQ"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-elevated rounded-2xl border border-border-subtle w-fit">
        {[
          { id: "blog" as const, label: "Blog", icon: BookOpen },
          { id: "pages" as const, label: "Static Pages", icon: FileText },
          { id: "faq" as const, label: "FAQ", icon: HelpCircle },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
              tab === t.id ? "bg-white text-midnight shadow-sm border border-border-subtle" : "text-text-muted hover:text-midnight")}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {tab === "blog" && (
            <div className="glass-card border border-border-subtle">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-elevated">
                    <tr>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Post Title</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Date</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/30">
                    {posts.length === 0 ? (
                      <tr><td colSpan={5} className="p-12 text-center text-text-muted font-medium">No posts yet.</td></tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="group hover:bg-surface-elevated/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-midnight group-hover:text-mint transition-colors">{post.title}</span>
                              <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight mt-0.5">by {post.author}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-midnight/5 text-midnight rounded uppercase">{post.category}</span>
                          </td>
                          <td className="p-5">
                            <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              post.status === "Published" ? "bg-mint/10 text-mint" : "bg-gold/10 text-gold")}>{post.status}</span>
                          </td>
                          <td className="p-5 text-xs font-medium text-text-muted">{post.date}</td>
                          <td className="p-5">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingPost(post); setPostForm({ title: post.title, author: post.author, category: post.category, status: post.status }); setShowEditPost(true); }}
                                className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-mint transition-colors">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                                  className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-midnight transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                  {openMenuId === post.id && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                      className="absolute right-0 top-10 z-20 w-44 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                                      <button onClick={() => togglePostStatus(post)}
                                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-mint transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {post.status === "Published" ? "Unpublish" : "Publish"}
                                      </button>
                                      <button onClick={() => { toast(`Sharing "${post.title}"...`, "info"); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                      </button>
                                      <button onClick={() => { setDeletingItem({ type: "post", id: post.id, name: post.title }); setShowDeleteConfirm(true); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "pages" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pages.map((page) => (
                <div key={page.id} className="glass-card p-6 border border-border-subtle group hover:border-mint/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-text-muted group-hover:bg-mint group-hover:text-midnight transition-all">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-midnight">{page.name}</h3>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">{page.link} <span className="mx-1">•</span> edited {page.lastEdited}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toast(`Previewing ${page.name}...`, "info")}
                      className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => toast(`Editing ${page.name}...`, "info")}
                      className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-mint transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setDeletingItem({ type: "page", id: page.id, name: page.name }); setShowDeleteConfirm(true); }}
                      className="p-2 rounded-lg text-text-muted hover:bg-coral/10 hover:text-coral transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowCreatePage(true)}
                className="p-6 rounded-3xl border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-center group cursor-pointer hover:border-mint/50 transition-all">
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-muted group-hover:bg-mint group-hover:text-midnight transition-all mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted group-hover:text-midnight transition-all">Create Custom Page</span>
              </button>
            </div>
          )}

          {tab === "faq" && (
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="glass-card p-12 border border-border-subtle text-center">
                  <HelpCircle className="w-16 h-16 text-mint/20 mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold text-midnight">No FAQs yet</h3>
                  <p className="text-sm text-text-secondary mt-2">Create your first FAQ entry.</p>
                  <button onClick={() => setShowCreateFAQ(true)}
                    className="mt-6 px-8 py-3 rounded-2xl bg-midnight text-warm-white font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-midnight/20">
                    Initialize FAQ Builder
                  </button>
                </div>
              ) : (
                <>
                  {faqs.map((faq) => (
                    <div key={faq.id} className="glass-card p-6 border border-border-subtle group hover:border-mint/30 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-midnight/5 rounded text-midnight">{faq.category}</span>
                          </div>
                          <h3 className="text-sm font-bold text-midnight">{faq.question}</h3>
                          <p className="text-xs text-text-secondary mt-2 leading-relaxed">{faq.answer}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => { setEditingFAQ(faq); setFAQForm({ question: faq.question, answer: faq.answer, category: faq.category }); setShowEditFAQ(true); }}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-mint transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeletingItem({ type: "faq", id: faq.id, name: faq.question }); setShowDeleteConfirm(true); }}
                            className="p-2 rounded-lg text-text-muted hover:bg-coral/10 hover:text-coral transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowCreateFAQ(true)}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-border-subtle text-xs font-bold text-text-muted hover:border-mint hover:text-mint transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add New FAQ
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-border-subtle bg-mint text-midnight shadow-2xl shadow-mint/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6">Website Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">SEO Score</span>
                <span className="text-sm font-black">94/100</span>
              </div>
              <div className="h-1.5 w-full bg-midnight/10 rounded-full overflow-hidden">
                <div className="h-full bg-midnight rounded-full" style={{ width: "94%" }} />
              </div>
              {[
                { label: "Broken Links", value: "0", highlight: false },
                { label: "Index Status", value: "✓ Indexed", highlight: false },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-sm font-black">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border border-border-subtle">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6">Quick Tools</h3>
            <div className="space-y-2">
              {[
                { icon: Layout, label: "Banner Editor", action: () => toast("Opening Banner Editor...", "info") },
                { icon: ExternalLink, label: "Preview Live Site", action: () => toast("Opening live site preview...", "info") },
                { icon: AlignLeft, label: "Sitemap Generator", action: () => toast("Sitemap generated!", "success") },
                { icon: Tag, label: "Meta Tag Editor", action: () => toast("Opening Meta Tag Editor...", "info") },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated group transition-all">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-text-muted group-hover:text-mint" />
                    <span className="text-[11px] font-bold text-text-secondary group-hover:text-midnight">{label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-text-muted group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <Modal open={showCreatePost} onClose={() => setShowCreatePost(false)} title="Create New Blog Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Post Title *</label>
            <input required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Summer Fashion Trends 2026" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Author</label>
              <input value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category *</label>
              <select required value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Publish Status</label>
            <div className="flex gap-3">
              {(["Draft", "Published"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setPostForm({ ...postForm, status: s })}
                  className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                    postForm.status === s ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreatePost(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              {postForm.status === "Published" ? "Publish Post" : "Save Draft"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Post Modal */}
      <Modal open={showEditPost} onClose={() => setShowEditPost(false)} title="Edit Post">
        <form onSubmit={handleSaveEditPost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Post Title *</label>
            <input required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Author</label>
              <input value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category *</label>
              <select required value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
            <div className="flex gap-3">
              {(["Draft", "Published"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setPostForm({ ...postForm, status: s })}
                  className={cn("flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                    postForm.status === s ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditPost(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Create Page Modal */}
      <Modal open={showCreatePage} onClose={() => setShowCreatePage(false)} title="Create Static Page" size="sm">
        <form onSubmit={handleCreatePage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Page Name *</label>
            <input required value={pageForm.name} onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Shipping Guide" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">URL Slug *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-mono">/</span>
              <input required value={pageForm.link} onChange={(e) => setPageForm({ ...pageForm, link: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 pl-8 text-sm font-mono focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="shipping-guide" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreatePage(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">Create Page</button>
          </div>
        </form>
      </Modal>

      {/* Create FAQ Modal */}
      <Modal open={showCreateFAQ} onClose={() => setShowCreateFAQ(false)} title="Add FAQ Entry">
        <form onSubmit={handleCreateFAQ} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Question *</label>
            <input required value={faqForm.question} onChange={(e) => setFAQForm({ ...faqForm, question: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. What is your return policy?" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Answer *</label>
            <textarea required value={faqForm.answer} onChange={(e) => setFAQForm({ ...faqForm, answer: e.target.value })}
              rows={3} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" placeholder="Provide a clear answer..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category *</label>
            <select required value={faqForm.category} onChange={(e) => setFAQForm({ ...faqForm, category: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select category</option>
              {faqCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateFAQ(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">Add FAQ</button>
          </div>
        </form>
      </Modal>

      {/* Edit FAQ Modal */}
      <Modal open={showEditFAQ} onClose={() => setShowEditFAQ(false)} title="Edit FAQ Entry">
        <form onSubmit={handleSaveEditFAQ} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Question *</label>
            <input required value={faqForm.question} onChange={(e) => setFAQForm({ ...faqForm, question: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Answer *</label>
            <textarea required value={faqForm.answer} onChange={(e) => setFAQForm({ ...faqForm, answer: e.target.value })}
              rows={3} className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category *</label>
            <select required value={faqForm.category} onChange={(e) => setFAQForm({ ...faqForm, category: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              {faqCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditFAQ(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete" size="sm">
        <div className="space-y-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-midnight">"{deletingItem?.name}"</span>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-coral text-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-coral/20">Delete</button>
          </div>
        </div>
      </Modal>

      {/* SEO Settings Modal */}
      <Modal open={showSEO} onClose={() => setShowSEO(false)} title="SEO Settings" size="lg">
        <div className="space-y-5">
          {[
            { label: "Site Title", value: "Antigravity — Premium Fashion Bangladesh", type: "input" },
            { label: "Meta Description", value: "Discover premium fashion in Bangladesh. Shop ethnic wear, accessories and more at Antigravity.", type: "textarea" },
            { label: "Keywords", value: "fashion, bangladesh, saree, ethnic wear, accessories", type: "input" },
          ].map(({ label, value, type }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">{label}</label>
              {type === "textarea" ? (
                <textarea defaultValue={value} rows={3}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
              ) : (
                <input defaultValue={value}
                  className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
              )}
            </div>
          ))}
          <button onClick={() => { toast("SEO settings saved!"); setShowSEO(false); }}
            className="w-full py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
            Save SEO Settings
          </button>
        </div>
      </Modal>
    </div>
  );
}
