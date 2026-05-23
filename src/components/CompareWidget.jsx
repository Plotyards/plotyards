import { useCompare } from '../context/CompareContext';
import { X, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompareWidget = () => {
  const { compareList, removeFromCompare, clearCompare, setIsCompareModalOpen } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        <div className="container mx-auto max-w-[1440px] px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <span className="text-sm font-extrabold text-text hidden md:block">
              Compare Properties
            </span>
            
            <div className="flex items-center gap-3">
              {compareList.map((property) => (
                <div key={property.id} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border">
                  <img src={property.image || property.images?.[0]} alt={property.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeFromCompare(property.id)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <div key={`empty-${i}`} className="w-16 h-16 rounded-xl border border-dashed border-border bg-surface flex items-center justify-center text-muted">
                  <span className="text-xs font-bold">{compareList.length + i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={clearCompare}
              className="px-4 py-2 text-sm font-bold text-muted hover:text-text transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={() => setIsCompareModalOpen(true)}
              disabled={compareList.length < 2}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors shadow-lg shadow-primary/20"
            >
              <Scale size={18} />
              Compare ({compareList.length}/3)
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareWidget;
