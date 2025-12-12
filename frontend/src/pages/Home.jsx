import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Clock, Users, Briefcase, Zap, TrendingUp, Award } from 'lucide-react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?skill=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleStateSearch = (state) => {
    navigate(`/search?state=${encodeURIComponent(state)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative text-white py-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-artisan.jpg)' }}
        />
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-primary-900/80" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Skilled Artisans <br /> Near You
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Connect with verified professionals across all Nigerian states. Quality service, trusted professionals.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by skill (e.g., Plumber, Electrician, Carpenter)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {['Lagos', 'Abuja', 'Kano', 'Rivers'].map((state) => (
              <button
                key={state}
                onClick={() => handleStateSearch(state)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg font-semibold transition-all"
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find the perfect professional for your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Electricians', count: '2,450+', color: 'from-yellow-400 to-orange-500' },
              { icon: Briefcase, title: 'Plumbers', count: '1,890+', color: 'from-blue-400 to-blue-600' },
              { icon: Award, title: 'Carpenters', count: '3,120+', color: 'from-amber-400 to-amber-600' },
              { icon: TrendingUp, title: 'Contractors', count: '1,560+', color: 'from-green-400 to-green-600' },
            ].map((category, idx) => {
              const Icon = category.icon;
              return (
                <Link
                  key={idx}
                  to={`/search?skill=${category.title}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden"
                >
                  <div className={`bg-gradient-to-br ${category.color} h-32 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-primary-600 font-semibold">{category.count} professionals</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Search</h3>
              <p className="text-gray-600 text-lg">
                Find artisans by location, skill, or rating across Nigeria
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Book</h3>
              <p className="text-gray-600 text-lg">
                Choose your preferred artisan and schedule a service
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Review</h3>
              <p className="text-gray-600 text-lg">
                Rate your experience and help others make informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Hustlaa?</h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Artisan Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/artisan-working.jpg" 
                  alt="Professional artisan at work" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-6 rounded-xl shadow-xl">
                <p className="text-4xl font-bold">5000+</p>
                <p className="text-sm">Verified Artisans</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <Shield className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Verified Artisans</h3>
                <p className="text-gray-300">
                  All artisans are verified for quality and reliability
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <MapPin className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Nationwide Coverage</h3>
                <p className="text-gray-300">
                  Available in all 36 states and FCT
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <Clock className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Quick Response</h3>
                <p className="text-gray-300">
                  Get connected with artisans in minutes
                </p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <Star className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">Trusted Reviews</h3>
                <p className="text-gray-300">
                  Real reviews from verified customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real experiences from real people</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: 'Temiloluwa Adeyemi',
                role: 'Customer',
                text: 'I love this platform! Got a professional plumber to fix an age-long issue with my WC. Smooth!! I totally recommend',
                rating: 5
              },
              {
                name: 'Tony Okafor',
                role: 'Customer',
                text: 'Hustlaa has been a life saver. I was able to get a plumber when my house flooded. Thank God we were able to stop the leak on time.',
                rating: 5
              },
              {
                name: 'Temilade Balogun',
                role: 'Customer',
                text: 'Found a great carpenter for my home renovation. Great platform. No stress! Highly recommended.',
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Join thousands of satisfied customers finding quality artisans
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Sign Up Now
              </Link>
              <Link
                to="/search"
                className="bg-primary-800 text-white hover:bg-primary-900 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Browse Artisans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Hustlaa</h4>
              <p className="text-gray-400">Find skilled artisans near you across all Nigerian states</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/artisans" className="hover:text-white">Find Artisans</Link></li>
                <li><Link to="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">For Artisans</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white">Join Us</Link></li>
                <li><Link to="/jobs" className="hover:text-white">Find Jobs</Link></li>
                <li><Link to="/help" className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><a href="mailto:support@hustlaa.com" className="hover:text-white">Email Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hustlaa. All rights reserved. | Connecting skilled artisans with customers nationwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
