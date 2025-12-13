import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import Footer from '../components/Footer';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  const isCustomerOwner = user && user.user_type === 'customer' && job && Number(job.customer_id) === Number(user.id);

  const formatBudget = (j) => {
    const min = j?.budget_min !== null && j?.budget_min !== undefined ? Number(j.budget_min) : null;
    const max = j?.budget_max !== null && j?.budget_max !== undefined ? Number(j.budget_max) : null;

    if (min !== null && max !== null) return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
    if (min !== null) return `₦${min.toLocaleString()}+`;
    if (max !== null) return `Up to ₦${max.toLocaleString()}`;
    return 'Negotiable';
  };

  const loadJob = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getById(id);
      setJob(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!isCustomerOwner) return;

    setAppsLoading(true);
    try {
      const res = await jobsAPI.getApplications(id);
      setApplications(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
    loadApplications();
  }, [isCustomerOwner]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login as an artisan to apply');
      return;
    }

    if (user.user_type !== 'artisan') {
      toast.error('Only artisans can apply to jobs');
      return;
    }

    try {
      await jobsAPI.apply(id, { cover_letter: '' });
      toast.success('Application submitted');
      loadJob();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to apply');
    }
  };

  const handleCloseJob = async () => {
    try {
      await jobsAPI.close(id);
      toast.success('Job closed');
      loadJob();
      loadApplications();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to close job');
    }
  };

  const handleUpdateApplication = async (applicationId, status) => {
    try {
      await jobsAPI.updateApplicationStatus(id, applicationId, status);
      toast.success(`Application ${status}`);
      loadJob();
      loadApplications();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-700">Job not found.</p>
            <Link className="text-primary-600 font-semibold" to="/jobs">
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = job.address || [job.city, job.state].filter(Boolean).join(', ') || 'Nigeria';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to="/jobs" className="text-primary-600 font-semibold">
            ← Back to Jobs
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.category}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {formatBudget(job)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Flexible
                </div>
              </div>
            </div>

            <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
              {job.status}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-bold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {job.status === 'open' && (
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all"
              >
                Apply Now
              </button>
            )}

            {isCustomerOwner && job.status === 'open' && (
              <button
                onClick={handleCloseJob}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all"
              >
                Close Job
              </button>
            )}
          </div>
        </div>

        {isCustomerOwner && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Applications</h2>
              {appsLoading && <span className="text-sm text-gray-500">Loading...</span>}
            </div>

            {applications.length === 0 ? (
              <p className="text-gray-600 mt-3">No applications yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {applications.map((a) => (
                  <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {a.first_name} {a.last_name}
                        </p>
                        <p className="text-sm text-gray-600">Status: {a.status}</p>
                      </div>

                      <div className="flex gap-2">
                        {a.status === 'pending' && job.status === 'open' && (
                          <>
                            <button
                              onClick={() => handleUpdateApplication(a.id, 'accepted')}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateApplication(a.id, 'rejected')}
                              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {a.cover_letter && <p className="text-gray-700 mt-3 whitespace-pre-line">{a.cover_letter}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default JobDetails;
