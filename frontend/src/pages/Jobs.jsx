import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Simulated job data - in production, this would come from an API
      const mockJobs = [
        {
          id: 1,
          title: 'Residential Electrical Installation',
          category: 'Electrician',
          location: 'Lekki, Lagos',
          budget: '50,000 - 80,000',
          duration: '2-3 days',
          postedDate: '2 hours ago',
          description: 'Need a certified electrician for complete house wiring installation.',
          status: 'open',
          applicants: 5
        },
        {
          id: 2,
          title: 'Kitchen Plumbing Repair',
          category: 'Plumber',
          location: 'Wuse, Abuja',
          budget: '15,000 - 25,000',
          duration: '1 day',
          postedDate: '5 hours ago',
          description: 'Fix leaking pipes and install new kitchen sink.',
          status: 'open',
          applicants: 8
        },
        {
          id: 3,
          title: 'Custom Furniture Design',
          category: 'Carpenter',
          location: 'Ikeja, Lagos',
          budget: '100,000 - 150,000',
          duration: '1 week',
          postedDate: '1 day ago',
          description: 'Design and build custom wardrobes for 3 bedrooms.',
          status: 'open',
          applicants: 12
        },
        {
          id: 4,
          title: 'Office Building Renovation',
          category: 'Contractor',
          location: 'Victoria Island, Lagos',
          budget: '500,000+',
          duration: '2 weeks',
          postedDate: '3 days ago',
          description: 'Complete renovation of 2-floor office building.',
          status: 'open',
          applicants: 15
        },
        {
          id: 5,
          title: 'Home AC Installation',
          category: 'Electrician',
          location: 'Garki, Abuja',
          budget: '40,000 - 60,000',
          duration: '1 day',
          postedDate: '1 week ago',
          description: 'Install 3 split AC units in residential apartment.',
          status: 'open',
          applicants: 6
        },
        {
          id: 6,
          title: 'Bathroom Tiling',
          category: 'Tiler',
          location: 'Surulere, Lagos',
          budget: '30,000 - 45,000',
          duration: '2 days',
          postedDate: '4 days ago',
          description: 'Professional tiling for master bathroom.',
          status: 'open',
          applicants: 9
        }
      ];

      setJobs(mockJobs);
    } catch (error) {
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
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
                      <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-semibold transition-all">
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
                to="/register"
                className="mt-6 w-full block text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
