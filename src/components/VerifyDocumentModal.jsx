"use client";
import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const VerifyDocumentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappNumber = '918287697756';
    const text = `Hello Plotyards! I want to verify documents for my property.\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Mobile:* ${formData.mobile}\n*Property Location:* ${formData.location}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-text">Verify Documents</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-gray-100 rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-muted mb-6">
            Please provide the details below and we will connect with you via WhatsApp for further assistance.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Gmail ID</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="johndoe@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Mobile Number</label>
              <input 
                type="tel" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Property Location / Details</label>
              <textarea 
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                placeholder="e.g., Sector 150, Noida"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors mt-4"
            >
              Verify Now & Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocumentModal;
