import React, { useState, useEffect } from 'react';
import { Award, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { portfolioAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CertificationsSection({ artisanId, isOwner = false, onRefresh }) {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, [artisanId]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await portfolioAPI.getArtisanCertifications(artisanId);
      setCertifications(response.data);
    } catch (error) {
      console.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;

    try {
      await portfolioAPI.deleteCertification(certId);
      toast.success('Certification deleted');
      fetchCertifications();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error('Failed to delete certification');
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Award size={28} className="text-primary-600" />
        Certifications & Credentials
      </h2>

      {certifications.length === 0 ? (
        <div className="text-center py-12">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No certifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map(cert => {
            const daysLeft = getDaysUntilExpiry(cert.expiry_date);
            const expired = isExpired(cert.expiry_date);

            return (
              <div
                key={cert.id}
                className={`border rounded-lg p-4 ${
                  expired ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-primary-300'
                } transition`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{cert.title}</h3>
                    <p className="text-gray-600 text-sm">{cert.issuer}</p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                  {cert.expiry_date && (
                    <div className={`flex items-center gap-2 ${expired ? 'text-red-600' : ''}`}>
                      <Calendar size={16} />
                      <span>
                        Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                        {daysLeft && !expired && ` (${daysLeft} days left)`}
                        {expired && ' (Expired)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Certificate Image */}
                {cert.certificate_image_url && (
                  <img
                    src={cert.certificate_image_url}
                    alt={cert.title}
                    className="w-full max-h-48 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Credential URL */}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Credential
                    <ExternalLink size={14} />
                  </a>
                )}

                {/* Expiry Warning */}
                {!expired && daysLeft && daysLeft < 30 && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ This certification expires in {daysLeft} days
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
