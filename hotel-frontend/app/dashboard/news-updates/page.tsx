"use client";

import React, { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit2, Trash2, X, FileText, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  status: string;
  author: string;
  createdAt: string;
}

function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View states: 'list' | 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'Published'
  });

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenForm = (item?: NewsItem) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        title: item.title,
        content: item.content,
        status: item.status
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        status: 'Published'
      });
    }
    setView('form');
  };

  const handleCloseForm = () => {
    setView('list');
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const url = editingId ? `/api/news/${editingId}` : '/api/news';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success(editingId ? 'News updated successfully' : 'News created successfully');
        handleCloseForm();
        fetchNews();
      } else {
        toast.error('Failed to save news');
      }
    } catch (err) {
      toast.error('Error saving news');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news update?')) return;
    
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('News deleted');
        fetchNews();
      } else {
        toast.error('Failed to delete news');
      }
    } catch (err) {
      toast.error('Error deleting news');
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCloseForm}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit News Update' : 'Create News Update'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Fill out the details below to publish.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                placeholder="e.g., New Feature Announcement"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content</label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-y"
                placeholder="Write the news content here..."
              ></textarea>
            </div>

            <div className="md:w-1/3">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold shadow-md shadow-brand/20 transition-all active:scale-[0.98]"
              >
                {editingId ? 'Save Changes' : 'Publish News Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">News Updates</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage news and announcements</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-brand text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-brand-hover transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add News Update
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <Newspaper className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No News Updates Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Create your first news update to share announcements and updates with your users.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {news.map((item) => (
            <div key={item._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                  item.status === 'Published' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                }`}>
                  {item.status === 'Published' ? <Globe className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  {item.status}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleOpenForm(item)} className="p-2 text-slate-400 hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 line-clamp-3 mb-5">
                {item.content}
              </p>
              <div className="flex justify-between items-center text-xs text-slate-400 font-medium pt-4 border-t border-slate-100 dark:border-slate-800">
                <span>{item.author}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AdminNews {...props} />
    </DashboardLayout>
  );
}
