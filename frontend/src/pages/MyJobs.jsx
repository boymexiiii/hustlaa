import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';

const MyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.my();
      setJobs(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!user || user.user_type !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700">Only customers can view this page.</p>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <Link
            to="/jobs/new"
            className="px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
          >
            Post a Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((j) => (
              <div key={j.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/jobs/${j.id}`} className="text-lg font-bold text-gray-900 hover:text-primary-600">
                      {j.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">Category: {j.category}</p>
                    <p className="text-sm text-gray-600">Applications: {Number(j.applications_count || 0)}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${j.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {j.status}
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

export default MyJobs;
