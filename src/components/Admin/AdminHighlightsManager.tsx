import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Highlight, HighlightMediaItem } from '../../types';
import {
  saveHighlightToFirebase,
  updateHighlightInFirebase,
  deleteHighlightFromFirebase,
  reorderHighlightsInFirebase,
  syncAllInitialHighlights,
} from '../../lib/firestoreService';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Sparkles,
  Play,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  FolderPlus,
  Layers,
  BarChart3,
  MousePointerClick,
  Link,
  Film,
  Upload,
  AlertTriangle,
} from 'lucide-react';

const SUGGESTED_LINKS = [
  { label: 'All Products (/shop)', url: '/shop' },
  { label: 'Festive Collection (/category/festive)', url: '/category/festive' },
  { label: 'Suits & Sets (/category/suits)', url: '/category/suits' },
  { label: 'Anarkali Edit (/category/anarkali)', url: '/category/anarkali' },
  { label: 'New Arrivals (/category/new-arrivals)', url: '/category/new-arrivals' },
  { label: 'Summer Silks (/category/summer-silks)', url: '/category/summer-silks' },
  { label: 'Sale & Offers (/sale)', url: '/sale' },
];

const PRESET_BANNERS = [
  { label: 'Festive Crimson Silk', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Pastel Blush Organza', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Royal Mustard Raw Silk', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Jaipur Cotton Daily', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Heritage Emerald Brocade', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Ivory Gold Gotapatti', url: 'https://i.ibb.co/jktFxP4x/Made-for-moments-worth-celebrating-A-timeless-green-silhouette-with-intricate-embroidery-delica.jpg' },
];

export const AdminHighlightsManager: React.FC = () => {
  const { highlights, openHighlightViewer } = useShop();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'newest' | 'oldest' | 'views' | 'clicks'>('order');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [mediaManagingHighlight, setMediaManagingHighlight] = useState<Highlight | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Media Input State
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newMediaCaption, setNewMediaCaption] = useState<string>('');

  // Auto clear success message
  useEffect(() => {
    if (saveSuccessMsg) {
      const t = setTimeout(() => setSaveSuccessMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [saveSuccessMsg]);

  // Keep mediaManagingHighlight in sync with live highlights
  useEffect(() => {
    if (mediaManagingHighlight) {
      const found = highlights.find((h) => h.id === mediaManagingHighlight.id);
      if (found) {
        setMediaManagingHighlight(found);
      }
    }
  }, [highlights]);

  // Filter and Sort logic
  const filteredHighlights = (highlights || [])
    .filter((hl) => {
      // Search
      const searchMatch =
        hl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hl.title && hl.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hl.description && hl.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!searchMatch) return false;

      // Status
      if (filterStatus === 'published') return hl.published === true;
      if (filterStatus === 'draft') return hl.published === false;
      if (filterStatus === 'featured') return hl.featured === true;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'order') return (a.displayOrder || 999) - (b.displayOrder || 999);
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
      return 0;
    });

  // Calculate Metrics
  const totalHighlights = highlights.length;
  const publishedCount = highlights.filter((h) => h.published !== false).length;
  const draftCount = highlights.filter((h) => h.published === false).length;
  const featuredCount = highlights.filter((h) => h.featured === true).length;
  const totalViews = highlights.reduce((acc, h) => acc + (h.views || 0), 0);
  const totalClicks = highlights.reduce((acc, h) => acc + (h.clicks || 0), 0);

  // Initialize new highlight modal
  const handleOpenCreateModal = () => {
    const nextOrder = highlights.length + 1;
    setEditingHighlight({
      id: `hl-${Date.now()}`,
      name: '',
      coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
      title: '',
      description: '',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop',
      displayOrder: nextOrder,
      published: true,
      featured: true,
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      media: [],
    });
    setIsEditModalOpen(true);
  };

  // Open edit modal for existing highlight
  const handleOpenEditModal = (hl: Highlight) => {
    setEditingHighlight({ ...hl });
    setIsEditModalOpen(true);
  };

  // Save Highlight Form
  const handleSaveHighlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHighlight) return;

    if (!editingHighlight.name.trim()) {
      alert('Please provide a name for the highlight.');
      return;
    }
    if (!editingHighlight.coverImage.trim()) {
      alert('Please provide a cover banner image URL.');
      return;
    }

    try {
      setIsSaving(true);
      await saveHighlightToFirebase(editingHighlight);
      setIsEditModalOpen(false);
      setEditingHighlight(null);
      setSaveSuccessMsg('Highlight saved successfully to Firebase!');
    } catch (err) {
      console.error('Error saving highlight:', err);
      alert('Failed to save highlight to Firebase. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (hl: Highlight) => {
    try {
      const newStatus = !hl.published;
      await updateHighlightInFirebase(hl.id, { published: newStatus });
      setSaveSuccessMsg(`Highlight "${hl.name}" set to ${newStatus ? 'Published' : 'Draft'}.`);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (hl: Highlight) => {
    try {
      const newFeatured = !hl.featured;
      await updateHighlightInFirebase(hl.id, { featured: newFeatured });
      setSaveSuccessMsg(`Highlight "${hl.name}" featured: ${newFeatured ? 'ON' : 'OFF'}.`);
    } catch (err) {
      console.error('Error updating featured:', err);
    }
  };

  // Delete Highlight
  const handleDeleteHighlight = async (id: string) => {
    try {
      setIsSaving(true);
      await deleteHighlightFromFirebase(id);
      setDeleteConfirmId(null);
      setSaveSuccessMsg('Highlight deleted permanently from Firebase.');
    } catch (err) {
      console.error('Error deleting highlight:', err);
      alert('Failed to delete highlight.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Highlights Up / Down
  const handleMoveHighlight = async (index: number, direction: 'up' | 'down') => {
    const list = [...highlights].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    try {
      await reorderHighlightsInFirebase(list);
      setSaveSuccessMsg('Highlights reordered successfully.');
    } catch (err) {
      console.error('Error reordering highlights:', err);
    }
  };

  // Media Manager: Add Media Item
  const handleAddMediaItem = async () => {
    if (!mediaManagingHighlight || !newMediaUrl.trim()) return;

    const newMedia: HighlightMediaItem = {
      id: `hlm-${Date.now()}`,
      type: newMediaType,
      url: newMediaUrl.trim(),
      caption: newMediaCaption.trim(),
      displayOrder: (mediaManagingHighlight.media?.length || 0) + 1,
      createdAt: new Date().toISOString(),
    };

    const updatedMedia = [...(mediaManagingHighlight.media || []), newMedia];

    try {
      setIsSaving(true);
      await updateHighlightInFirebase(mediaManagingHighlight.id, { media: updatedMedia });
      setMediaManagingHighlight((prev) => prev ? { ...prev, media: updatedMedia } : null);
      setNewMediaUrl('');
      setNewMediaCaption('');
      setSaveSuccessMsg('Media item added to highlight.');
    } catch (err) {
      console.error('Error adding media item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Media Manager: Delete Media Item
  const handleDeleteMediaItem = async (mediaId: string) => {
    if (!mediaManagingHighlight) return;
    const updatedMedia = (mediaManagingHighlight.media || []).filter((m) => m.id !== mediaId);

    try {
      setIsSaving(true);
      await updateHighlightInFirebase(mediaManagingHighlight.id, { media: updatedMedia });
      setMediaManagingHighlight((prev) => prev ? { ...prev, media: updatedMedia } : null);
      setSaveSuccessMsg('Media item removed.');
    } catch (err) {
      console.error('Error deleting media item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Media Manager: Move Media Item Up / Down
  const handleMoveMediaItem = async (index: number, direction: 'up' | 'down') => {
    if (!mediaManagingHighlight || !mediaManagingHighlight.media) return;
    const list = [...mediaManagingHighlight.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Reset display orders
    const reindexed = list.map((m, idx) => ({ ...m, displayOrder: idx + 1 }));

    try {
      await updateHighlightInFirebase(mediaManagingHighlight.id, { media: reindexed });
      setMediaManagingHighlight((prev) => prev ? { ...prev, media: reindexed } : null);
    } catch (err) {
      console.error('Error reordering media:', err);
    }
  };

  // Restore Initial Sample Highlights
  const handleRestoreSampleHighlights = async () => {
    if (window.confirm('Restore & sync initial sample fashion highlights to Firebase?')) {
      try {
        setIsSaving(true);
        await syncAllInitialHighlights();
        setSaveSuccessMsg('Sample Highlights synced to Firebase successfully!');
      } catch (err) {
        console.error('Error syncing highlights:', err);
        alert('Failed to sync sample highlights.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#D4AF37] text-[#140205] font-bold text-sm shadow-2xl border border-white/40 animate-bounce">
          <Check className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-[#1F060A] border border-[#D4AF37]/30 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#DFBA67] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promotional CMS & Story Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F9F6EE] tracking-tight">
            Highlights & Lookbook Manager
          </h2>
          <p className="text-sm text-[#D4AF37]/80 mt-1">
            Create unlimited banner highlights, curate multi-look photo/video stories, and direct customer shopping journeys.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRestoreSampleHighlights}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-[#3B0C13] hover:bg-[#5B0F15] border border-[#D4AF37]/40 text-[#DFBA67] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Sample Highlights</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E2C378] to-[#B38F26] text-[#140205] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Highlight</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Total Highlights</span>
          <span className="text-xl sm:text-2xl font-bold text-[#F9F6EE] font-serif mt-1">{totalHighlights}</span>
          <span className="text-[11px] text-[#DFBA67] mt-0.5">Unlimited CMS</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Published</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-serif mt-1">{publishedCount}</span>
          <span className="text-[11px] text-emerald-300 mt-0.5">Live on Homepage</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Drafts</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-400 font-serif mt-1">{draftCount}</span>
          <span className="text-[11px] text-amber-300 mt-0.5">Hidden from store</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium">Featured</span>
          <span className="text-xl sm:text-2xl font-bold text-[#DFBA67] font-serif mt-1">{featuredCount}</span>
          <span className="text-[11px] text-[#DFBA67] mt-0.5">VIP Promos</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#DFBA67]" />
            <span>Story Views</span>
          </span>
          <span className="text-xl sm:text-2xl font-bold text-blue-300 font-serif mt-1">{totalViews}</span>
          <span className="text-[11px] text-blue-200 mt-0.5">Impressions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1F060A] border border-[#D4AF37]/20 flex flex-col">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-[#DFBA67]" />
            <span>Button Clicks</span>
          </span>
          <span className="text-xl sm:text-2xl font-bold text-purple-300 font-serif mt-1">{totalClicks}</span>
          <span className="text-[11px] text-purple-200 mt-0.5">CTA Conversions</span>
        </div>
      </div>

      {/* SEARCH, FILTER & SORT TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#1F060A] border border-[#D4AF37]/30 flex flex-col md:flex-row gap-3 items-center justify-between shadow-lg">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DFBA67]/70" />
          <input
            type="text"
            placeholder="Search highlights by name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#140205] border border-[#D4AF37]/30 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {(['all', 'published', 'draft', 'featured'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#D4AF37] text-[#140205] shadow-md'
                  : 'bg-[#140205] text-gray-300 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60'
              }`}
            >
              {status} {status === 'all' ? `(${totalHighlights})` : ''}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-400 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#140205] border border-[#D4AF37]/30 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="order">Display Order</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Viewed</option>
            <option value="clicks">Most Clicked</option>
          </select>
        </div>
      </div>

      {/* HIGHLIGHTS CARDS LIST */}
      {filteredHighlights.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#1F060A] border border-[#D4AF37]/20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#3B0C13] mx-auto flex items-center justify-center border border-[#D4AF37]/30">
            <Layers className="w-8 h-8 text-[#DFBA67]" />
          </div>
          <h3 className="text-lg font-serif font-bold text-white">No Highlights Found</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            {searchTerm || filterStatus !== 'all'
              ? 'No highlights match your current search or filter criteria.'
              : 'You have not created any promotional highlights yet. Click "+ Create Highlight" to get started.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-[#D4AF37] text-[#140205] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Highlight</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHighlights.map((hl, index) => {
            const mediaCount = hl.media ? hl.media.length : 0;
            const hasVideo = hl.media?.some((m) => m.type === 'video');

            return (
              <div
                key={hl.id}
                className="p-5 rounded-3xl bg-[#1F060A] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group"
              >
                {/* Left: Reorder Controls & Thumbnail Preview */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  {/* Order Up/Down Buttons */}
                  <div className="flex flex-col items-center gap-1 pr-1">
                    <button
                      onClick={() => handleMoveHighlight(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-[#140205] border border-white/10 hover:border-[#D4AF37] text-gray-300 hover:text-[#DFBA67] disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-[#DFBA67]">
                      #{hl.displayOrder || index + 1}
                    </span>
                    <button
                      onClick={() => handleMoveHighlight(index, 'down')}
                      disabled={index === filteredHighlights.length - 1}
                      className="p-1.5 rounded-lg bg-[#140205] border border-white/10 hover:border-[#D4AF37] text-gray-300 hover:text-[#DFBA67] disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Banner Image Preview */}
                  <div className="relative w-24 sm:w-28 h-28 sm:h-32 rounded-2xl overflow-hidden border border-[#D4AF37]/40 flex-shrink-0 bg-black shadow-md">
                    <img
                      src={hl.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300'}
                      alt={hl.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    {hasVideo && (
                      <div className="absolute bottom-2 left-2 p-1 rounded-full bg-black/60 backdrop-blur-sm text-[#DFBA67]">
                        <Play className="w-3 h-3 fill-[#DFBA67]" />
                      </div>
                    )}
                  </div>

                  {/* Highlight Metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide truncate">
                        {hl.name}
                      </h3>
                      {hl.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#DFBA67] text-[10px] font-bold uppercase tracking-wider">
                          ★ Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          hl.published
                            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                            : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                        }`}
                      >
                        {hl.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {hl.title && (
                      <p className="text-xs sm:text-sm font-medium text-[#DFBA67] truncate">
                        "{hl.title}"
                      </p>
                    )}

                    {hl.description && (
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {hl.description}
                      </p>
                    )}

                    {/* Stats & Details Pill */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-300">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Layers className="w-3 h-3 text-[#DFBA67]" />
                        {mediaCount} {mediaCount === 1 ? 'Media Item' : 'Media Items'}
                      </span>

                      {hl.buttonText && (
                        <span className="inline-flex items-center gap-1 font-mono text-[#DFBA67]">
                          <Link className="w-3 h-3" />
                          {hl.buttonText} → {hl.buttonLink || '/shop'}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-blue-300 font-mono">
                        <Eye className="w-3 h-3" />
                        {hl.views || 0} views
                      </span>

                      <span className="inline-flex items-center gap-1 text-purple-300 font-mono">
                        <MousePointerClick className="w-3 h-3" />
                        {hl.clicks || 0} clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
                  {/* Preview Viewer */}
                  <button
                    onClick={() => openHighlightViewer(hl)}
                    className="px-3 py-2 rounded-xl bg-[#140205] hover:bg-[#3B0C13] border border-[#D4AF37]/30 text-[#DFBA67] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Preview lookbook viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {/* Media Gallery Manager Button */}
                  <button
                    onClick={() => {
                      setMediaManagingHighlight(hl);
                      setIsMediaModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#3B0C13] hover:bg-[#5B0F15] border border-[#D4AF37]/40 text-[#DFBA67] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Media ({mediaCount})</span>
                  </button>

                  {/* Edit Details */}
                  <button
                    onClick={() => handleOpenEditModal(hl)}
                    className="px-3 py-2 rounded-xl bg-[#140205] hover:bg-[#3B0C13] border border-white/20 hover:border-[#D4AF37] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#DFBA67]" />
                    <span>Edit</span>
                  </button>

                  {/* Publish/Draft Toggle */}
                  <button
                    onClick={() => handleTogglePublish(hl)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      hl.published
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-900/50'
                    }`}
                    title={hl.published ? 'Click to make Draft' : 'Click to Publish'}
                  >
                    {hl.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteConfirmId(hl.id)}
                    className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-400 transition-colors cursor-pointer"
                    title="Delete highlight"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CREATE / EDIT HIGHLIGHT MODAL                                          */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1F060A] rounded-3xl border border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {editingHighlight.id && highlights.some((h) => h.id === editingHighlight.id)
                    ? 'Edit Promotional Highlight'
                    : 'Create New Highlight'}
                </h3>
                <p className="text-xs text-[#DFBA67] mt-0.5">
                  Configure banner styling, customer title, target link & lookbook attributes.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full bg-[#140205] border border-white/20 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveHighlight} className="space-y-5">
              {/* Highlight Name */}
              <div>
                <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                  Highlight Name * (Custom)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Collection, Pure Silk Suits, Under ₹799..."
                  value={editingHighlight.name}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Cover Banner Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                  Cover / Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={editingHighlight.coverImage}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, coverImage: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                />

                {/* Preset Banner Quick Select */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 mr-1">Presets:</span>
                  {PRESET_BANNERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingHighlight({ ...editingHighlight, coverImage: preset.url })}
                      className="px-2.5 py-1 rounded-lg bg-[#140205] border border-white/10 hover:border-[#D4AF37] text-[11px] text-gray-300 hover:text-[#DFBA67]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Banner Live Preview */}
                {editingHighlight.coverImage && (
                  <div className="mt-3 relative h-36 rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-black">
                    <img
                      src={editingHighlight.coverImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-xs font-bold text-white drop-shadow">
                        {editingHighlight.name || 'Preview Banner'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Headline Title */}
              <div>
                <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                  Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Celebrate in Grandeur, Spring Summer 2026 Collection..."
                  value={editingHighlight.title || ''}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Discover regal zardozi embroideries, hand-loomed Banarasi silks..."
                  value={editingHighlight.description || ''}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Button Text & Button Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHOP NOW, EXPLORE NEW..."
                    value={editingHighlight.buttonText || ''}
                    onChange={(e) => setEditingHighlight({ ...editingHighlight, buttonText: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                    Button Target Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /category/festive, /shop..."
                    value={editingHighlight.buttonLink || ''}
                    onChange={(e) => setEditingHighlight({ ...editingHighlight, buttonLink: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Quick Link Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-gray-400 mr-1">Quick Links:</span>
                {SUGGESTED_LINKS.map((link, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditingHighlight({ ...editingHighlight, buttonLink: link.url })}
                    className="px-2.5 py-1 rounded-lg bg-[#140205] border border-white/10 hover:border-[#D4AF37] text-[11px] text-gray-300 hover:text-[#DFBA67]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Display Order, Status & Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingHighlight.displayOrder || 1}
                    onChange={(e) =>
                      setEditingHighlight({ ...editingHighlight, displayOrder: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingHighlight.published ? 'published' : 'draft'}
                    onChange={(e) =>
                      setEditingHighlight({ ...editingHighlight, published: e.target.value === 'published' })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/40 text-white text-sm focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="published">Published (Visible)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#DFBA67] uppercase tracking-wider mb-1.5">
                    Featured Hero
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingHighlight({ ...editingHighlight, featured: !editingHighlight.featured })
                      }
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        editingHighlight.featured ? 'bg-[#D4AF37]' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-[#140205] transition-transform ${
                          editingHighlight.featured ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-300 font-semibold">
                      {editingHighlight.featured ? 'ON (Featured)' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-[#140205] border border-white/20 text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-[#140205] text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/30 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Firebase...' : 'Save Highlight'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MEDIA GALLERY MANAGER MODAL                                            */}
      {/* ========================================================================= */}
      {isMediaModalOpen && mediaManagingHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1F060A] rounded-3xl border border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#DFBA67]" />
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Media Gallery: {mediaManagingHighlight.name}
                  </h3>
                </div>
                <p className="text-xs text-[#DFBA67] mt-0.5">
                  Upload multiple photos & videos, reorder items, and configure lookbook captions.
                </p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-2 rounded-full bg-[#140205] border border-white/20 text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Media Section */}
            <div className="p-5 rounded-2xl bg-[#140205] border border-[#D4AF37]/30 space-y-4">
              <h4 className="text-xs font-bold text-[#DFBA67] uppercase tracking-wider">
                + Add Photo / Video to Lookbook
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Media Type</label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1F060A] border border-[#D4AF37]/30 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="image">📷 Photo (JPG/PNG/WEBP)</option>
                    <option value="video">🎥 Video (MP4/WEBM)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-gray-400 mb-1">Media URL *</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1F060A] border border-[#D4AF37]/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Caption / Look description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Signature Royal Crimson Silk Anarkali with Zari Weaves"
                  value={newMediaCaption}
                  onChange={(e) => setNewMediaCaption(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1F060A] border border-[#D4AF37]/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Sample Media Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-gray-400 mr-1">Stock Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('video');
                    setNewMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-red-dress-41315-large.mp4');
                    setNewMediaCaption('Silk Flare & Drape Showcase Video');
                  }}
                  className="px-2 py-0.5 rounded bg-[#1F060A] border border-white/10 hover:border-[#D4AF37] text-[10px] text-gray-300"
                >
                  + Red Dress Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('video');
                    setNewMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-a-floral-dress-looking-at-the-camera-40176-large.mp4');
                    setNewMediaCaption('Pastel Organza Fabric Motion Video');
                  }}
                  className="px-2 py-0.5 rounded bg-[#1F060A] border border-white/10 hover:border-[#D4AF37] text-[10px] text-gray-300"
                >
                  + Pastel Dress Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMediaType('image');
                    setNewMediaUrl('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200');
                    setNewMediaCaption('Golden Zari Dupatta Styling Look');
                  }}
                  className="px-2 py-0.5 rounded bg-[#1F060A] border border-white/10 hover:border-[#D4AF37] text-[10px] text-gray-300"
                >
                  + Mustard Silk Photo
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddMediaItem}
                  disabled={!newMediaUrl.trim() || isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-[#140205] text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-40 flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Media to Highlight</span>
                </button>
              </div>
            </div>

            {/* Current Media Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#DFBA67] uppercase tracking-wider">
                  Attached Media List ({mediaManagingHighlight.media?.length || 0})
                </h4>
                <span className="text-[11px] text-gray-400">
                  Media will appear in the customer viewer in this exact sequence.
                </span>
              </div>

              {!mediaManagingHighlight.media || mediaManagingHighlight.media.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#140205] border border-dashed border-white/20">
                  <p className="text-xs text-gray-400">
                    No individual media items added yet. The cover image will be displayed by default.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaManagingHighlight.media.map((media, idx) => (
                    <div
                      key={media.id || idx}
                      className="p-3 rounded-2xl bg-[#140205] border border-[#D4AF37]/30 flex gap-3 items-center"
                    >
                      {/* Media Thumbnail */}
                      <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        {media.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-[#3B0C13]">
                            <Play className="w-6 h-6 text-[#DFBA67] fill-[#DFBA67]" />
                          </div>
                        ) : (
                          <img
                            src={media.url}
                            alt={media.caption || 'Look'}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Info & Caption */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              media.type === 'video'
                                ? 'bg-purple-900/50 text-purple-300'
                                : 'bg-blue-900/50 text-blue-300'
                            }`}
                          >
                            {media.type}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400 truncate">
                            {media.url.split('/').pop()?.slice(0, 16)}...
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium line-clamp-2">
                          {media.caption || 'No caption set'}
                        </p>
                      </div>

                      {/* Reorder & Delete Controls */}
                      <div className="flex flex-col items-center gap-1 pl-1">
                        <button
                          onClick={() => handleMoveMediaItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-[#1F060A] hover:bg-[#3B0C13] text-gray-300 hover:text-[#DFBA67] disabled:opacity-20"
                          title="Move Media Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveMediaItem(idx, 'down')}
                          disabled={idx === (mediaManagingHighlight.media?.length || 0) - 1}
                          className="p-1 rounded bg-[#1F060A] hover:bg-[#3B0C13] text-gray-300 hover:text-[#DFBA67] disabled:opacity-20"
                          title="Move Media Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteMediaItem(media.id)}
                          className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 mt-1"
                          title="Remove Media"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => {
                  setIsMediaModalOpen(false);
                  openHighlightViewer(mediaManagingHighlight);
                }}
                className="px-4 py-2 rounded-xl bg-[#3B0C13] hover:bg-[#5B0F15] border border-[#D4AF37]/40 text-[#DFBA67] text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Lookbook Viewer</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-[#D4AF37] text-[#140205] text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#1F060A] rounded-3xl border border-red-500/50 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                Delete This Highlight?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Are you sure you want to delete this highlight? It will be removed immediately from the customer website, lookbook viewer, and Firebase database.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#140205] border border-white/20 text-gray-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHighlight(deleteConfirmId)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
