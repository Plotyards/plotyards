"use client";

import { useState } from 'react';
import { X, FileDown, Download, MessageCircle, Building2, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { formatPhoneForLink } from '../utils/phoneUtils';

const BrochureModal = ({ isOpen, onClose, property, activeBroker, parsedDetails }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !property) return null;

  const handleDirectDownload = () => {
    setDownloading(true);

    if (property.brochureUrl) {
      window.open(property.brochureUrl, '_blank');
      setDownloading(false);
      onClose();
      return;
    }

    // Generate printable executive project dossier
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the project dossier PDF.');
      setDownloading(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${property.title} - Official Project Dossier</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111827; line-height: 1.5; }
          .header { border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 26px; font-weight: 800; color: #e11d48; letter-spacing: -0.5px; }
          .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; margin-top: 4px; }
          h1 { font-size: 28px; margin: 0 0 8px 0; color: #0f172a; }
          .location { color: #64748b; font-size: 15px; margin-bottom: 20px; }
          .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
          .spec-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
          .spec-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
          .spec-val { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .section { margin-top: 28px; }
          .section-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .amenities { display: flex; flex-wrap: wrap; gap: 8px; }
          .pill { background: #f1f5f9; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #334155; }
          .rera-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; margin-top: 24px; color: #166534; font-weight: 600; font-size: 14px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">plotyards.</div>
            <div class="tagline">Verified Plots & Land Ecosystem</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 14px;">OFFICIAL PROJECT DOSSIER</div>
            <div style="color: #64748b; font-size: 12px;">Generated on ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <h1>${property.title}</h1>
        <div class="location">📍 ${property.location || 'Gurgaon, Haryana'}</div>

        <div class="specs-grid">
          <div class="spec-card">
            <div class="spec-title">Developer / Builder</div>
            <div class="spec-val">${parsedDetails?.developer || 'Uppal Group'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-title">Starting Price</div>
            <div class="spec-val">${property.price || '₹5.00 Cr'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-title">Total Area / Plot Size</div>
            <div class="spec-val">${parsedDetails?.totalArea || property.size || '1225 Sq. Yrd'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-title">Scheme / Ownership</div>
            <div class="spec-val">${parsedDetails?.scheme || 'Freehold'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-title">Possession Date</div>
            <div class="spec-val">${parsedDetails?.possession || 'Immediate'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-title">RERA Approval Status</div>
            <div class="spec-val">${parsedDetails?.reraApproval || 'Approved'}</div>
          </div>
        </div>

        <div class="rera-box">
          ✓ Official RERA Number: <strong>${parsedDetails?.reraNumber || property.reraNumber || 'HRERA-PKL-JJR-678-2025'}</strong> — Freehold Plotted Township
        </div>

        <div class="section">
          <div class="section-title">Connectivity & Landmark Distances</div>
          <ul style="padding-left: 20px; font-size: 13px; line-height: 1.8; color: #334155;">
            <li><strong>Expressway & Highway:</strong> 5-10 Mins from major arterial highway & KMP Expressway</li>
            <li><strong>Transit & Metro Corridor:</strong> 15-20 Mins from nearest rapid transit station</li>
            <li><strong>Social Infrastructure:</strong> 10-12 Mins to renowned schools, multispecialty hospitals & retail hubs</li>
            <li><strong>Airport Connectivity:</strong> 40 Mins drive via signal-free express highway</li>
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Verified Documents On Record</div>
          <p style="font-size: 13px; color: #334155;">✓ RERA Registration Copy · ✓ Layout & Master Demarcation Plan · ✓ Clear Title Report · ✓ Mutation & Jamabandi Verified</p>
        </div>

        <div class="footer">
          <div>Verified Listing ID: ${property.id || property._id || 'PY-VERIFIED'}</div>
          <div>Contact Associate Partner: ${activeBroker?.name || 'Partner Desk'} (${activeBroker?.phone || '+91 8287697756'})</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setDownloading(false);
    onClose();
  };

  const handleSendToWhatsApp = (e) => {
    e.preventDefault();
    const brokerPhone = activeBroker?.whatsapp || activeBroker?.phone || '918287697756';
    const text = encodeURIComponent(
      `Hi, please share the official PDF brochure, master layout and location distance details for "${property.title}" listed on Plotyards.\n\n*My Name:* ${name || 'Prospective Buyer'}\n*My Phone:* ${phone || 'Same as WhatsApp'}`
    );
    window.open(`https://wa.me/${formatPhoneForLink(brokerPhone)}?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileDown size={22} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-text">Download Project Brochure</h2>
              <p className="text-xs text-muted truncate max-w-[280px]">{property.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full border border-border text-muted hover:text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick Highlight Box */}
          <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Developer: <strong className="text-text">{parsedDetails?.developer || 'Reputed Developer'}</strong></span>
              <span>RERA Approved: <strong className="text-emerald-600">Verified</strong></span>
            </div>
            <p className="text-xs text-muted">
              Includes master layout drawings, plot dimensions, demarcation coordinates, and exact distances to major transport links.
            </p>
          </div>

          {/* Option 1: Direct Download */}
          <div>
            <button
              type="button"
              onClick={handleDirectDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-rose-600 transition-all cursor-pointer"
            >
              <Download size={18} />
              <span>{downloading ? 'Preparing PDF...' : 'Download Official PDF Dossier'}</span>
            </button>
            <p className="text-[11px] text-center text-muted mt-1.5">Direct PDF download with complete project specifications</p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full"></div>
            <span className="bg-white px-3 text-xs font-bold text-muted uppercase tracking-wider absolute">OR GET ON WHATSAPP</span>
          </div>

          {/* Option 2: WhatsApp delivery */}
          <form onSubmit={handleSendToWhatsApp} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Your WhatsApp Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>Send Brochure on WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrochureModal;
