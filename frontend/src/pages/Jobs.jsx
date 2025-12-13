import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { status: 'open' };
      if (filter && filter !== 'all') {
        params.category = filter;
      }

      const response = await jobsAPI.list(params);

      const normalized = (response.data || []).map((j) => {
        const budgetMin = j.budget_min !== null && j.budget_min !== undefined ? Number(j.budget_min) : null;
        const budgetMax = j.budget_max !== null && j.budget_max !== undefined ? Number(j.budget_max) : null;

        let budget = 'Negotiable';
        if (budgetMin !== null && budgetMax !== null) budget = `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()}`;
        else if (budgetMin !== null) budget = `${budgetMin.toLocaleString()}+`;
        else if (budgetMax !== null) budget = `Up to ${budgetMax.toLocaleString()}`;

        const location = j.address || [j.city, j.state].filter(Boolean).join(', ');

        return {
          id: j.id,
          title: j.title,
          category: j.category,
          location: location || 'Nigeria',
          budget,
          duration: 'Flexible',
          postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString() : '',
          description: j.description,
          status: j.status,
          applicants: Number(j.applications_count || 0),
        };
      });

      setJobs(normalized);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) {
      toast.error('Please login as an artisan to apply');
      return;
    }

    if (user.user_type !== 'artisan') {
      toast.error('Only artisans can apply to jobs');
      return;
    }

    try {
      await jobsAPI.apply(jobId, { cover_letter: '' });
      toast.success('Application submitted');
      fetchJobs();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to apply');
    }
  };

  const categories = ['All', 'Electrician', 'Plumber', 'Carpenter', 'Contractor', 'Tiler'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Browse Jobs</h1>
          <p className="text-primary-100 text-lg">Find opportunities to showcase your skills</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category.toLowerCase())}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === category.toLowerCase()
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link to={`/jobs/${job.id}`} className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 block">
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.category}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.duration}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{job.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-primary-600 font-semibold">
                            <DollarSign className="w-5 h-5" />
                            ₦{job.budget}
                          </div>
                          <span className="text-gray-500 text-sm">{job.applicants} applicants</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Posted {job.postedDate}</span>
                      <button
                        onClick={() => handleApply(job.id)}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-semibold transition-all"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-primary-600">156</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Active Today</p>
                    <p className="text-2xl font-bold text-green-600">42</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Budget</p>
                    <p className="text-2xl font-bold text-blue-600">₦85K</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {['Electrician', 'Plumber', 'Carpenter', 'Contractor'].map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{cat}</span>
                      <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to={user ? '/jobs/new' : '/login'}
                className="mt-6 w-full block text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
