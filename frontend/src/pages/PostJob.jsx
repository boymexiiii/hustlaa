import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const title = String(form.title || '').trim();
    const category = String(form.category || '').trim();
    const location = String(form.location || '').trim();
    const duration = String(form.duration || '').trim();
    const description = String(form.description || '').trim();

    if (!title || !category || !location || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const budgetMin = form.budgetMin !== '' ? Number(form.budgetMin) : null;
    const budgetMax = form.budgetMax !== '' ? Number(form.budgetMax) : null;

    if ((budgetMin !== null && Number.isNaN(budgetMin)) || (budgetMax !== null && Number.isNaN(budgetMax))) {
      toast.error('Budget must be a number');
      return;
    }

    if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
      toast.error('Min budget cannot be higher than max budget');
      return;
    }

    jobsAPI
      .create({
        title,
        category,
        description,
        address: location,
        budget_min: budgetMin,
        budget_max: budgetMax,
      })
      .then(() => {
        toast.success('Job posted');
        navigate('/jobs');
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || 'Failed to post job');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Post a Job</h1>
          <p className="text-primary-100 text-lg">Describe what you need and get matched with artisans</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Fix leaking kitchen sink"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., Plumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Lekki, Lagos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget (₦)</label>
                <input
                  name="budgetMin"
                  type="number"
                  value={form.budgetMin}
                  onChange={handleChange}
                  placeholder="e.g., 15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget (₦)</label>
                <input
                  name="budgetMax"
                  type="number"
                  value={form.budgetMax}
                  onChange={handleChange}
                  placeholder="e.g., 25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g., 1 day"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the job in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
