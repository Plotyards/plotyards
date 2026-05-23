import { useState, useEffect } from 'react';
import { X, BellRing, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PriceAlertModal = ({ isOpen, onClose, property }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) return undefined;

    const resetId = window.setTimeout(() => {
      setStatus('idle');
      setEmail('');
      setPhone('');
    }, 0);

    return () => window.clearTimeout(resetId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email && !phone) return;
    
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="relative p-6 border-b border-border">
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-muted hover:text-text hover:bg-surface rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BellRing size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-text">Price Drop Alert</h2>
                <p className="text-xs font-semibold text-muted">Get notified if the price drops</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-text">Alert Set!</h3>
                <p className="text-sm font-medium text-muted mt-2">
                  We'll notify you the moment the price drops for {property?.title || 'this property'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border flex gap-4 items-center">
                  <img 
                    src={property?.image || property?.images?.[0] || property?.img} 
                    alt="property" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-text line-clamp-1">{property?.title || 'Property'}</h4>
                    <p className="text-xs text-muted font-semibold mt-1">Current Price: <span className="text-primary">{property?.price}</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted">WhatsApp Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading' || (!email && !phone)}
                  className="mt-4 w-full py-3.5 bg-primary hover:bg-rose-600 text-white rounded-xl font-extrabold text-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Setting Alert...' : 'Notify Me'}
                </button>
                <p className="text-center text-[10px] font-semibold text-muted">
                  By setting an alert, you agree to receive price updates from Plotyards.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PriceAlertModal;
