import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Play } from 'lucide-react';
import { searchAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function SavedSearches({ onLoadSearch }) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await searchAPI.getSavedSearches();
      setSearches(response.data);
    } catch (error) {
      console.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved search?')) return;

    try {
      await searchAPI.deleteSavedSearch(id);
      toast.success('Saved search deleted');
      setSearches(searches.filter(s => s.id !== id));
    } catch (error) {
      toast.error('Failed to delete saved search');
    }
  };

  const handleLoadSearch = (search) => {
    if (onLoadSearch) {
      const filters = typeof search.filters === 'string' ? JSON.parse(search.filters) : search.filters;
      onLoadSearch(filters);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bookmark size={28} className="text-primary-600" />
        Saved Searches
      </h2>

      {searches.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No saved searches yet</p>
          <p className="text-gray-400 text-sm mt-2">Save your searches to quickly access them later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map(search => (
            <div
              key={search.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{search.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Saved on {new Date(search.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSearch(search)}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                >
                  <Play size={16} />
                  Load
                </button>
                <button
                  onClick={() => handleDelete(search.id)}
                  className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
