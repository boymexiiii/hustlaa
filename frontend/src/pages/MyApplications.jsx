import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';

const MyApplications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.myApplications();
      setItems(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!user || user.user_type !== 'artisan') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700">Only artisans can view this page.</p>
            <Link className="text-primary-600 font-semibold" to="/jobs">
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700">You haven't applied to any jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((j) => (
              <div key={j.application_id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/jobs/${j.id}`} className="text-lg font-bold text-gray-900 hover:text-primary-600">
                      {j.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Category: {j.category}</p>
                    <p className="text-sm text-gray-600">Job status: {j.status}</p>
                    <p className="text-sm text-gray-600">Your application: {j.application_status}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${j.application_status === 'accepted' ? 'bg-green-100 text-green-800' : j.application_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {j.application_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
