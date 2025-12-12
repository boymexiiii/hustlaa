import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { reviewsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ReviewCard({ review, onVote, currentUserId, isArtisan }) {
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState(review.response_text || '');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const handleVote = async (voteType) => {
    try {
      await reviewsAPI.voteOnReview(review.id, { vote_type: voteType });
      if (onVote) onVote();
      toast.success(`Marked as ${voteType}`);
    } catch (error) {
      toast.error('Failed to vote on review');
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Response cannot be empty');
      return;
    }

    try {
      setIsSubmittingResponse(true);
      await reviewsAPI.addReviewResponse(review.id, { response_text: responseText });
      toast.success('Response added successfully');
      setShowResponse(false);
      if (onVote) onVote();
    } catch (error) {
      toast.error('Failed to add response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleDeleteResponse = async () => {
    try {
      await reviewsAPI.deleteReviewResponse(review.id);
      toast.success('Response deleted');
      if (onVote) onVote();
    } catch (error) {
      toast.error('Failed to delete response');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      {/* Review Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 flex-1">
          <img
            src={review.profile_image_url || 'https://via.placeholder.com/40'}
            alt={review.first_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {review.first_name} {review.last_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(review.rating)}
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-gray-700 mb-3">{review.comment}</p>

      {/* Review Photo */}
      {review.photo_url && (
        <img
          src={review.photo_url}
          alt="Review"
          className="w-full max-h-64 object-cover rounded-lg mb-3"
        />
      )}

      {/* Helpful/Unhelpful Votes */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <button
          onClick={() => handleVote('helpful')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
        >
          <ThumbsUp size={16} />
          <span className="text-sm">{review.helpful_count || 0}</span>
        </button>
        <button
          onClick={() => handleVote('unhelpful')}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
        >
          <ThumbsDown size={16} />
          <span className="text-sm">{review.unhelpful_count || 0}</span>
        </button>
      </div>

      {/* Artisan Response */}
      {review.response_id ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-semibold text-blue-900 text-sm">Artisan Response</h5>
            {isArtisan && (
              <button
                onClick={handleDeleteResponse}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-blue-800 text-sm">{review.response_text}</p>
          <p className="text-blue-600 text-xs mt-2">
            {new Date(review.response_created_at).toLocaleDateString()}
          </p>
        </div>
      ) : isArtisan ? (
        <>
          {!showResponse ? (
            <button
              onClick={() => setShowResponse(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <MessageCircle size={16} />
              Add Response
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response..."
                className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitResponse}
                  disabled={isSubmittingResponse}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingResponse ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    setShowResponse(false);
                    setResponseText(review.response_text || '');
                  }}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
