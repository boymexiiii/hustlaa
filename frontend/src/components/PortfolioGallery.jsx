import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2 } from 'lucide-react';
import { portfolioAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PortfolioGallery({ artisanId, isOwner = false, onRefresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPortfolioItems();
  }, [artisanId, category, page]);

  const fetchPortfolioItems = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (category !== 'all') params.category = category;
      
      const response = await portfolioAPI.getArtisanPortfolio(artisanId, params);
      setItems(response.data.items);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await portfolioAPI.deletePortfolioItem(itemId);
      toast.success('Portfolio item deleted');
      fetchPortfolioItems();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      'before_after': 'Before & After',
      'project': 'Project',
      'certificate': 'Certificate'
    };
    return labels[cat] || cat;
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h2>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setCategory('all'); setPage(1); }}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
            category === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {['before_after', 'project', 'certificate'].map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              category === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No portfolio items yet</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {items.map(item => (
              <div
                key={item.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                onClick={() => {
                  setSelectedItem(item);
                  setShowModal(true);
                }}
              >
                {/* Main Image */}
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-300 flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm">{getCategoryLabel(item.category)}</p>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {getCategoryLabel(item.category)}
                </div>

                {/* Actions (if owner) */}
                {isOwner && (
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement edit
                        toast.info('Edit coming soon');
                      }}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              {/* Before/After Comparison */}
              {selectedItem.category === 'before_after' && selectedItem.before_image_url ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
                    <img
                      src={selectedItem.before_image_url}
                      alt="Before"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">After</p>
                    <img
                      src={selectedItem.image_url}
                      alt="After"
                      className="w-full rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full rounded-lg mb-4"
                />
              )}

              {selectedItem.description && (
                <p className="text-gray-700">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
