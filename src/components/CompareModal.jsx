"use client";
import { useCompare } from '../context/CompareContext';
import { usePathname } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';


const CompareModal = () => {
  const pathname = usePathname() || '';
  const { compareList, isCompareModalOpen, setIsCompareModalOpen, removeFromCompare } = useCompare();

  if (pathname === '/subscribe' || !isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
          <div>
            <h2 className="text-2xl font-extrabold text-text">Compare Properties</h2>
            <p className="text-sm font-medium text-muted">Detailed side-by-side comparison</p>
          </div>
          <button 
            onClick={() => setIsCompareModalOpen(false)}
            className="p-2 bg-white rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-border w-1/4 bg-surface text-sm font-bold uppercase tracking-wide text-muted">Property Overview</th>
                  {compareList.map((property) => (
                    <th key={property.id} className="p-4 border-b border-border w-1/4 align-top">
                      <div className="relative rounded-2xl overflow-hidden h-40 mb-4 border border-border group">
                        <img src={property.image || property.images?.[0]} alt={property.title} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeFromCompare(property.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <h3 className="text-lg font-extrabold text-text line-clamp-2 leading-tight">{property.title}</h3>
                      <p className="text-xs font-semibold text-muted mt-1">{property.location}</p>
                    </th>
                  ))}
                  {/* Fill empty columns if less than 3 */}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                    <th key={`empty-head-${i}`} className="p-4 border-b border-border w-1/4 align-top">
                      <div className="h-40 rounded-2xl border border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted mb-4">
                        <p className="text-sm font-bold">Empty Slot</p>
                        <p className="text-xs font-medium">Add property to compare</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-border font-bold text-text">Price</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 border-b border-border">
                      <span className="text-xl font-extrabold text-primary">{property.price}</span>
                      <span className="block text-xs font-semibold text-muted mt-1">{property.rate}</span>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={`empty-price-${i}`} className="p-4 border-b border-border"></td>)}
                </tr>

                <tr>
                  <td className="p-4 border-b border-border font-bold text-text">Size</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 border-b border-border font-extrabold text-text">
                      {property.size || property.sqyd}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={`empty-size-${i}`} className="p-4 border-b border-border"></td>)}
                </tr>

                <tr>
                  <td className="p-4 border-b border-border font-bold text-text">Type</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 border-b border-border">
                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-text border border-border">
                        {property.type}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={`empty-type-${i}`} className="p-4 border-b border-border"></td>)}
                </tr>


                <tr>
                  <td className="p-4 border-b border-border font-bold text-text">Approval Status</td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4 border-b border-border">
                      {property.approved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                          Docs Pending
                        </span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={`empty-approval-${i}`} className="p-4 border-b border-border"></td>)}
                </tr>

                <tr>
                  <td className="p-4 text-text"></td>
                  {compareList.map((property) => (
                    <td key={property.id} className="p-4">
                      <Link 
                        href={`/property/${property.id}`}
                        onClick={() => setIsCompareModalOpen(false)}
                        className="block w-full text-center bg-text text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors"
                      >
                        View Property
                      </Link>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={`empty-link-${i}`} className="p-4"></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompareModal;
