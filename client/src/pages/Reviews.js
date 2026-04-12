import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, Flag, MessageCircle, User, Calendar } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setReviews(response.data.reviews || []);
      if (response.data.length > 0) {
        const avg = response.data.reduce((sum, r) => sum + r.rating, 0) / response.data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/reviews`, newReview);
      alert('Thank you for your review! It will appear after moderation.');
      setNewReview({ name: '', rating: 5, comment: '', email: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-center mb-4">Customer Reviews</h1>
      <p className="text-center text-gray-600 mb-12">What our customers are saying about us</p>

      {/* Average Rating Summary */}
      <div className="bg-gradient-to-r from-maroon to-maroon-light text-white rounded-lg shadow p-6 mb-8 text-center">
        <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center gap-1 mb-2">
          {[1,2,3,4,5].map(r => (
            <Star key={r} size={24} className={r <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-white/30'} />
          ))}
        </div>
        <p className="text-sm opacity-90">Based on {reviews.length} reviews</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <input type="text" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-maroon"
                  value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-maroon"
                  value={newReview.email} onChange={(e) => setNewReview({...newReview, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating *</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} type="button" onClick={() => setNewReview({...newReview, rating: r})}>
                      <Star size={28} className={r <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Review *</label>
                <textarea rows="4" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-maroon"
                  value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-maroon text-white py-2 rounded-lg font-semibold hover:bg-maroon-light">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center">
                          <User size={20} className="text-maroon" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3 pl-12">{review.comment}</p>
                  <div className="flex gap-4 mt-3 pl-12">
                    <button className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1"><ThumbsUp size={12} /> Helpful (0)</button>
                    <button className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"><Flag size={12} /> Report</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}