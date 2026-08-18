import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertTriangle,
  Play,
  Film,
} from 'lucide-react';
import { CustomerReviewHighlight, ReviewMediaItem } from '../../types';
import {
  subscribeToCustomerReviews,
  saveCustomerReviewToFirebase,
  updateCustomerReviewInFirebase,
  deleteCustomerReviewFromFirebase,
  syncAllInitialCustomerReviews,
} from '../../lib/firestoreService';

export const AdminCustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReviewHighlight[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [currentReview, setCurrentReview] = useState<CustomerReviewHighlight>({
    id: '',
    customerName: '',
    location: '',
    reviewText: '',
    rating: 5,
    coverImage: '',
    isVerified: true,
    published: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    media: [],
  });

  // Media addition sub-form state
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newMediaCaption, setNewMediaCaption] = useState<string>('');

  // Subscribe to live Firestore customer reviews
  useEffect(() => {
    const unsubscribe = subscribeToCustomerReviews((liveReviews) => {
      setReviews(liveReviews);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenAdd = () => {
    const nextOrder = reviews.length > 0 ? Math.max(...reviews.map(r => r.displayOrder || 0)) + 1 : 1;
    setCurrentReview({
      id: `rev-${Date.now()}`,
      customerName: '',
      location: 'New Delhi',
      reviewText: '',
      rating: 5,
      coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      isVerified: true,
      published: true,
      displayOrder: nextOrder,
      createdAt: new Date().toISOString(),
      media: [
        {
          id: `m-${Date.now()}-1`,
          type: 'image',
          url: 'https://i.ibb.co/jktFxP4x/Made-for-moments-worth-celebrating-A-timeless-green-silhouette-with-intricate-embroidery-delica.jpg',
          caption: 'Ethnic Look Fitting',
          order: 1,
        },
      ],
    });
    setNewMediaUrl('');
    setNewMediaCaption('');
    setIsEditing(true);
  };

  const handleOpenEdit = (rev: CustomerReviewHighlight) => {
    setCurrentReview({
      ...rev,
      media: Array.isArray(rev.media) ? [...rev.media] : [],
    });
    setNewMediaUrl('');
    setNewMediaCaption('');
    setIsEditing(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReview.customerName.trim()) {
      showToast('error', 'Customer name is required');
      return;
    }
    if (!currentReview.reviewText.trim()) {
      showToast('error', 'Review text is required');
      return;
    }
    if (!currentReview.coverImage.trim() && currentReview.media.length > 0) {
      currentReview.coverImage = currentReview.media[0].url;
    }

    try {
      setIsSaving(true);
      await saveCustomerReviewToFirebase(currentReview);
      setIsEditing(false);
      showToast('success', 'Customer Review saved and synchronized to Firebase!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save customer review to Firebase');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteCustomerReviewFromFirebase(id);
      setDeleteConfirmId(null);
      showToast('success', 'Customer Review deleted successfully from Firebase.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete review');
    }
  };

  const handleTogglePublish = async (rev: CustomerReviewHighlight) => {
    try {
      const nextStatus = !rev.published;
      await updateCustomerReviewInFirebase(rev.id, { published: nextStatus });
      showToast('success', nextStatus ? 'Review published to customer website!' : 'Review unpublished.');
    } catch (err: any) {
      showToast('error', 'Failed to toggle review status');
    }
  };

  const handleDisplayOrderChange = async (rev: CustomerReviewHighlight, newOrder: number) => {
    try {
      await updateCustomerReviewInFirebase(rev.id, { displayOrder: Number(newOrder) || 1 });
    } catch (err: any) {
      showToast('error', 'Failed to update display order');
    }
  };

  // Media Management Inside Form
  const handleAddMediaItem = () => {
    if (!newMediaUrl.trim()) {
      showToast('error', 'Please enter a valid Image or Video URL');
      return;
    }

    const newMedia: ReviewMediaItem = {
      id: `m-${Date.now()}`,
      type: newMediaType,
      url: newMediaUrl.trim(),
      caption: newMediaCaption.trim() || undefined,
      order: currentReview.media.length + 1,
    };

    setCurrentReview(prev => {
      const updatedMedia = [...prev.media, newMedia];
      return {
        ...prev,
        media: updatedMedia,
        // Auto set cover if empty
        coverImage: prev.coverImage || newMedia.url,
      };
    });

    setNewMediaUrl('');
    setNewMediaCaption('');
    showToast('success', `${newMediaType === 'video' ? 'Video' : 'Photo'} added to review!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      showToast('error', 'Please upload a valid image (JPG, PNG, WEBP) or video (MP4, WEBM)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isCover) {
        setCurrentReview(prev => ({ ...prev, coverImage: result }));
        showToast('success', 'Cover image uploaded');
      } else {
        const item: ReviewMediaItem = {
          id: `m-${Date.now()}`,
          type: isVideo ? 'video' : 'image',
          url: result,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          order: currentReview.media.length + 1,
        };
        setCurrentReview(prev => ({
          ...prev,
          media: [...prev.media, item],
          coverImage: prev.coverImage || (isVideo ? prev.coverImage : result),
        }));
        showToast('success', `${isVideo ? 'Video' : 'Photo'} uploaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMediaItem = (mediaId: string) => {
    setCurrentReview(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== mediaId),
    }));
  };

  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    const items = [...currentReview.media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // re-index orders
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setCurrentReview(prev => ({ ...prev, media: items }));
  };

  const handleSyncSampleReviews = async () => {
    try {
      setIsSyncing(true);
      await syncAllInitialCustomerReviews();
      showToast('success', 'All sample customer review highlights synchronized to Firebase!');
    } catch (err: any) {
      showToast('error', 'Failed to sync customer reviews to Firebase');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredReviews = reviews.filter(
    r =>
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-semibold shadow-lg transition-all ${
            statusMessage.type === 'success'
              ? 'bg-[#15803d] text-white border border-green-400'
              : 'bg-rose-900 text-white border border-rose-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-200" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-[#4A0E17] text-white p-6 rounded-2xl border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#DFBA67]/20 text-[#DFBA67] flex items-center justify-center border border-[#D4AF37]/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-serif-luxury text-[#DFBA67] tracking-tight">
              CUSTOMER REVIEWS HIGHLIGHTS (INSTAGRAM STORIES)
            </h2>
          </div>
          <p className="text-xs text-white/80 max-w-2xl">
            Manage circular customer story highlights displayed at the top of the homepage. Support multi-photo & video unboxings, verified customer badges, star ratings, and custom display sorting.
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
              Total Highlights: <strong className="text-[#DFBA67]">{reviews.length}</strong>
            </span>
            <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40">
              Published on Store: <strong>{reviews.filter(r => r.published !== false).length}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncSampleReviews}
            disabled={isSyncing}
            className="bg-[#2D0B12] hover:bg-[#3B0C13] text-[#DFBA67] px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow"
            title="Reset & Sync sample video/photo reviews to Firebase"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Sample Reviews'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-[#DFBA67] hover:bg-[#F3E5AB] text-[#3B0C13] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer Review</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#EAE3D2] shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, location, or review..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredReviews.length} of {reviews.length} highlights
        </div>
      </div>

      {/* Review Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.map((rev) => {
          const hasVideo = rev.media?.some(m => m.type === 'video');
          const photoCount = rev.media?.filter(m => m.type === 'image').length || 0;
          const videoCount = rev.media?.filter(m => m.type === 'video').length || 0;

          return (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between ${
                rev.published === false ? 'opacity-70 border-dashed border-gray-300 bg-gray-50/50' : 'border-[#EAE3D2]'
              }`}
            >
              {/* Card Header with Highlight Circle preview */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Circle Avatar with Instagram Gold Border */}
                    <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#5B0F15] shadow-sm shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-white">
                        <img
                          src={rev.coverImage || rev.media?.[0]?.url}
                          alt={rev.customerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {hasVideo && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-black text-[#DFBA67] flex items-center justify-center border border-[#D4AF37]">
                          <Play className="w-2 h-2 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-sm">{rev.customerName}</h4>
                        {rev.isVerified !== false && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" title="Verified Buyer" />
                        )}
                      </div>
                      {rev.location && <p className="text-[11px] text-gray-500">{rev.location}</p>}
                      <div className="flex items-center gap-1 mt-1 text-[#C5A059]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (rev.rating || 5) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Display Order Badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Order</span>
                    <input
                      type="number"
                      value={rev.displayOrder || 1}
                      onChange={(e) => handleDisplayOrderChange(rev, parseInt(e.target.value) || 1)}
                      className="w-12 text-center text-xs font-bold py-1 border border-gray-200 rounded-md focus:border-[#4A0E17]"
                      min="1"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-gray-700 italic mt-3.5 line-clamp-3 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  "{rev.reviewText}"
                </p>

                {/* Media Thumbnails Strip */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5 font-medium">
                    <span>Attached Media ({rev.media?.length || 0})</span>
                    <span className="text-[10px] text-stone-400">
                      {photoCount} {photoCount === 1 ? 'photo' : 'photos'} • {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {rev.media?.map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-black shrink-0 group/media"
                      >
                        {m.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-stone-900 text-[#DFBA67]">
                            <Film className="w-5 h-5" />
                          </div>
                        ) : (
                          <img src={m.url} alt="media" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-white px-1 rounded-tl">
                          {m.type === 'video' ? 'VID' : 'IMG'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3.5 bg-gray-50/80 flex items-center justify-between border-t border-gray-100">
                {/* Publish Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePublish(rev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    rev.published !== false
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {rev.published !== false ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 text-stone-600 hover:text-[#4A0E17] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
                    title="Edit Customer Review"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(rev.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Delete Customer Review Highlight?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-6">
              This will permanently delete the customer review, rating, and all attached photos and video metadata from Firebase. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteReview(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Review Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#D4AF37]/40 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#4A0E17] text-white flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DFBA67]" />
                <h3 className="font-bold text-base font-serif-luxury text-[#DFBA67]">
                  {currentReview.id.includes('rev-') ? 'Customer Review Highlight' : 'New Customer Review'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveReview} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentReview.customerName}
                    onChange={(e) => setCurrentReview({ ...currentReview, customerName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={currentReview.location || ''}
                    onChange={(e) => setCurrentReview({ ...currentReview, location: e.target.value })}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
                  />
                </div>
              </div>

              {/* Rating & Verified Buyer & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCurrentReview({ ...currentReview, rating: star })}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= currentReview.rating
                              ? 'fill-[#DFBA67] text-[#DFBA67]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-600 ml-1">
                      {currentReview.rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={currentReview.displayOrder}
                    onChange={(e) => setCurrentReview({ ...currentReview, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
                    min="1"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2 sm:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentReview.isVerified !== false}
                      onChange={(e) => setCurrentReview({ ...currentReview, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A0E17] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-700">Verified Purchase Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentReview.published !== false}
                      onChange={(e) => setCurrentReview({ ...currentReview, published: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A0E17] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-700">Publish Immediately</span>
                  </label>
                </div>
              </div>

              {/* Review Commentary */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Customer Review Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={currentReview.reviewText}
                  onChange={(e) => setCurrentReview({ ...currentReview, reviewText: e.target.value })}
                  placeholder="Share customer's genuine feedback on fabric, fitting, delivery..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Circular Highlight Cover Image (URL or File Upload)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-300 shrink-0">
                    <img
                      src={currentReview.coverImage || 'https://via.placeholder.com/150'}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="url"
                    value={currentReview.coverImage}
                    onChange={(e) => setCurrentReview({ ...currentReview, coverImage: e.target.value })}
                    placeholder="https://... image URL"
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17]"
                  />
                  <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-stone-300 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Media Management (Photos & Videos) */}
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase">
                      Review Stories Gallery ({currentReview.media.length} items)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Add multiple photos and videos to this customer highlight story.
                    </p>
                  </div>
                </div>

                {/* Existing Media List */}
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {currentReview.media.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between gap-3 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 font-bold text-gray-400 text-center">{idx + 1}</span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-gray-300 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <Film className="w-5 h-5 text-[#DFBA67]" />
                          ) : (
                            <img src={item.url} alt="media" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.type === 'video'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-sky-100 text-sky-900'
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                            <span className="font-semibold text-gray-800 truncate">
                              {item.caption || item.url.slice(0, 40) + '...'}
                            </span>
                          </div>
                          {item.caption && (
                            <p className="text-[10px] text-gray-500 italic truncate">{item.caption}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveMedia(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMedia(idx, 'down')}
                          disabled={idx === currentReview.media.length - 1}
                          className="p-1 text-gray-500 hover:text-black disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMediaItem(item.id)}
                          className="p-1 text-rose-600 hover:text-rose-800"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {currentReview.media.length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400 border border-dashed rounded-xl">
                      No media attached yet. Add photos or videos below.
                    </div>
                  )}
                </div>

                {/* Add New Media Form Box */}
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-[#D4AF37]/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Add New Media:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewMediaType('image')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                          newMediaType === 'image'
                            ? 'bg-[#4A0E17] text-[#DFBA67]'
                            : 'bg-white text-gray-600 border border-gray-300'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewMediaType('video')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                          newMediaType === 'video'
                            ? 'bg-[#4A0E17] text-[#DFBA67]'
                            : 'bg-white text-gray-600 border border-gray-300'
                        }`}
                      >
                        <Video className="w-3 h-3" />
                        <span>Video (MP4/WebM)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder={newMediaType === 'video' ? 'Paste MP4 / video URL...' : 'Paste image URL...'}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17] bg-white"
                    />
                    <input
                      type="text"
                      value={newMediaCaption}
                      onChange={(e) => setNewMediaCaption(e.target.value)}
                      placeholder="Optional story caption (e.g. Unboxing video)"
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E17] bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="text-[11px] font-semibold text-stone-700 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3 text-gray-500" />
                      <span>Or Upload {newMediaType === 'video' ? 'Video File' : 'Image File'}</span>
                      <input
                        type="file"
                        accept={newMediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAddMediaItem}
                      className="bg-[#4A0E17] hover:bg-[#3B0C13] text-[#DFBA67] font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Attach to Story</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4A0E17] text-[#DFBA67] border border-[#D4AF37]/50 hover:bg-[#3B0C13] transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Sync Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
