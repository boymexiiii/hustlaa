import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Users, Briefcase, Shield, Phone, Mail } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const customerFaqs = [
    {
      question: 'How do I find a service provider?',
      answer: 'Launch the app or website, select "Find Artisans", choose your desired service category, and browse through verified professionals in your area. You can filter by location, rating, and skill.'
    },
    {
      question: 'How do I book a service?',
      answer: 'Once you find an artisan you like, click on their profile, select a service, choose your preferred date and time, provide your location, and submit your booking request. The artisan will confirm or decline based on availability.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Yes! Hustlaa protects your privacy and does not disclose it to any 3rd party without your full consent. Your data is encrypted and stored securely.'
    },
    {
      question: 'How do I pay for services?',
      answer: 'Payment is made directly to the artisan after service completion. We support various payment methods including cash, bank transfer, and mobile money.'
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel pending or confirmed bookings from your bookings page. Please note that cancellation policies may vary by artisan.'
    },
    {
      question: 'How do I leave a review?',
      answer: 'After a service is completed, you can leave a review and rating from your bookings page. Your feedback helps other users make informed decisions.'
    }
  ];

  const artisanFaqs = [
    {
      question: 'How do I register as an artisan?',
      answer: 'Click "Sign Up", select "Artisan" as your account type, fill in your details, and submit required documents. Our team will verify your profile within 24-48 hours.'
    },
    {
      question: 'What documents do I need to provide?',
      answer: 'You need a clear photo of your face, valid ID, proof of skill (certificates or portfolio), and contact information. Additional documents may be required based on your service category.'
    },
    {
      question: 'How do I get verified?',
      answer: 'After registration, our team physically verifies all providers. Verified artisans get a verification badge on their profile, which increases trust and bookings.'
    },
    {
      question: 'How do I manage my bookings?',
      answer: 'Go to your Dashboard, click on "Bookings" to see all pending, ongoing, and completed jobs. You can accept, decline, or update the status of bookings.'
    },
    {
      question: 'How do I set my rates?',
      answer: 'In your Profile settings, you can set your hourly rate and create custom services with specific pricing. You have full control over your pricing.'
    },
    {
      question: 'Are there any fees?',
      answer: 'Hustlaa is free to use! There are no registration fees, subscription fees, or commission charges. We believe in fostering a free market economy.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-primary-100">We have answers to your questions!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">For Customers</h2>
            </div>
            <div className="space-y-4">
              {customerFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(`customer-${index}`)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {openFaq === `customer-${index}` ? (
                      <ChevronUp className="w-5 h-5 text-primary-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === `customer-${index}` && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-6">
              <Briefcase className="w-8 h-8 text-primary-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">For Artisans</h2>
            </div>
            <div className="space-y-4">
              {artisanFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(`artisan-${index}`)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {openFaq === `artisan-${index}` ? (
                      <ChevronUp className="w-5 h-5 text-primary-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {openFaq === `artisan-${index}` && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety & Security</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Hustlaa keeps improving security measures to make the platform as safe as possible for all our customers. 
              Your safety and satisfaction is our top priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Artisans</h3>
              <p className="text-sm text-gray-600">All artisans undergo physical verification before being listed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Privacy Protected</h3>
              <p className="text-sm text-gray-600">Your personal information is never shared without consent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Our team is always here to help with any issues</p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl text-primary-100 mb-8">Our support team is here to help</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@hustlaa.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
            <a
              href="tel:+2348012345678"
              className="inline-flex items-center justify-center gap-2 bg-primary-800 text-white hover:bg-primary-900 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
