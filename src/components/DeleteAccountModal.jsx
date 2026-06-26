"use client";

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reasons = [
    'Not useful anymore',
    'Found a better platform',
    'Privacy concerns',
    'Too many emails/notifications',
    'Other'
  ];

  const handleDelete = async () => {
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiRequest('/auth/delete-account', {
        method: 'DELETE',
        body: { reason, details }
      });
      // Handle success
      logout(); // This will clear session and usually redirect or trigger re-render
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete your account? This action cannot be undone, and all your listings and data will be permanently removed.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for leaving <span className="text-rose-500">*</span></label>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 outline-none transition-colors"
              >
                <option value="" disabled>Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us how we can improve..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 outline-none transition-colors h-24 resize-none"
              ></textarea>
            </div>
            
            {error && <p className="text-sm text-rose-600 font-medium">{error}</p>}
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
