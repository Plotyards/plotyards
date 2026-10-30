"use client";

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, CheckCircle2, MessageCircle, ArrowUpRight, ArrowRight } from 'lucide-react';
import { formatPhoneForLink } from '../utils/phoneUtils';

export const BuilderLogo = ({ builderName = '', logoUrl = '', className = "h-14 w-14" }) => {
  const name = String(builderName || '').toLowerCase();

  // If a custom logo image URL is provided
  if (logoUrl) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1 ring-4 ring-white shadow-xl flex items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <img src={logoUrl} alt={builderName} className="h-full w-full object-contain rounded-full relative z-10" />
      </div>
    );
  }

  // DLF Logo: 3 red horizontal bars and bold DLF text
  if (name.includes('dlf')) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1.5 ring-4 ring-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="flex flex-col gap-[2px] mb-0.5">
            <span className="w-5 h-[3px] bg-[#E21E25] rounded-xs"></span>
            <span className="w-5 h-[3px] bg-[#E21E25] rounded-xs"></span>
            <span className="w-5 h-[3px] bg-[#E21E25] rounded-xs"></span>
          </div>
          <span className="text-[11px] font-black tracking-tight text-gray-950 leading-none">DLF</span>
        </div>
      </div>
    );
  }

  // Godrej Logo: Purple G logo with GODREJ text
  if (name.includes('godrej')) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1 ring-4 ring-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-[#6F2C91] italic font-serif leading-none">G</span>
          <span className="text-[7px] font-extrabold tracking-widest text-[#6F2C91] uppercase leading-none mt-0.5">GODREJ</span>
        </div>
      </div>
    );
  }

  // Lodha Logo: Blue geometric L with gold accent and LODHA text
  if (name.includes('lodha')) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1 ring-4 ring-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-4 h-4 border-l-2 border-b-2 border-[#1E3A8A] flex items-center justify-center relative">
            <span className="w-2 h-2 bg-[#F59E0B] rounded-xs"></span>
          </div>
          <span className="text-[8px] font-black tracking-wider text-[#1E3A8A] leading-none mt-0.5">LODHA</span>
        </div>
      </div>
    );
  }

  // BPTP Logo: Bold red badge with BPTP text
  if (name.includes('bptp')) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1 ring-4 ring-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="px-1.5 py-0.5 bg-[#E11D48] text-white text-[8px] font-black rounded-xs">BP</span>
          <span className="text-[8px] font-black tracking-wider text-black leading-none mt-0.5">BPTP</span>
        </div>
      </div>
    );
  }

  // Signature Global Logo
  if (name.includes('signature')) {
    return (
      <div className={`${className} relative overflow-hidden rounded-full bg-white p-1 ring-4 ring-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="absolute top-0 -left-[100%] w-14 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-base font-black text-[#0D9488] leading-none">SG</span>
          <span className="text-[6px] font-bold text-gray-700 leading-none mt-0.5">SIGNATURE</span>
        </div>
      </div>
    );
  }

  // Generic / Custom Developer monogram (Red background, white text/icon, with shine effect just like Plotyard's logo)
  const initials = builderName
    ? builderName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'B';

  return (
    <div className={`${className} relative overflow-hidden rounded-full bg-gradient-to-br from-[#E11D48] via-[#F43F5E] to-[#BE123C] p-1.5 ring-4 ring-white shadow-2xl flex flex-col items-center justify-center shrink-0`}>
      {/* Shine effect animation just like Post Property button */}
      <div className="absolute top-0 -left-[100%] w-16 h-full bg-white/40 skew-x-[45deg] animate-shine pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        <Building2 size={18} className="text-white drop-shadow-sm" />
        <span className="text-[9px] font-black tracking-wider text-white uppercase leading-none mt-0.5 drop-shadow-sm">
          {initials}
        </span>
      </div>
    </div>
  );
};

export default function BuilderCard({ plot, defaultWhatsapp = '918287697756' }) {
  const imageUrl = plot.image || plot.images?.[0]?.url || 'https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=1032&auto=format&fit=crop';
  const builderName = plot.builderName || (plot.isDeveloperListing ? (plot.broker?.brokerProfile?.companyName || plot.broker?.name) : '') || 'Reputed Developer';
  const linkId = plot.id || plot._id;
  const waNumber = formatPhoneForLink(plot.broker?.whatsapp || plot.broker?.phone || defaultWhatsapp);
  const waMessage = encodeURIComponent(`Hi, I am interested in your builder project "${plot.title}" by ${builderName} listed on Plotyards.`);
  const logoUrl = plot.builderLogo || plot.broker?.brokerProfile?.photo || '';
  const subtitle = plot.subtitle || (plot.type ? `${plot.type} Project` : 'Premium Plotted Township');
  const handoverText = plot.handover || plot.size || 'Ready Registry';

  // Dynamic Land Approval Badge (RERA Registered, Government Approved, TCP Approved, NOC Zone Approved)
  const approvalBadgeText = (() => {
    if (plot.approvalType && plot.approvalType !== 'None') {
      return plot.approvalType;
    }
    const docs = Array.isArray(plot.documentsVerified) ? plot.documentsVerified : [];
    const tags = Array.isArray(plot.tags) ? plot.tags : [];
    const combined = [...docs, ...tags];

    if (combined.some(d => /tcp/i.test(d))) return 'TCP Approved';
    if (combined.some(d => /government/i.test(d))) return 'Government Approved';
    if (combined.some(d => /noc/i.test(d))) return 'NOC Zone Approved';
    if (combined.some(d => /rera/i.test(d)) || plot.reraApproved || plot.reraNumber) return 'RERA Registered';
    return 'Government Approved';
  })();

  return (
    <div className="group relative overflow-hidden flex flex-col rounded-[2rem] bg-gradient-to-br from-[#E11D48] via-[#D0103A] to-[#A00B2B] p-4 text-white shadow-xl shadow-rose-950/25 border border-rose-400/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-600/40">
      {/* Continuous Shine Beam Animation across the entire card (Post Property style) */}
      <div className="absolute top-0 -left-[100%] w-36 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[45deg] animate-shine pointer-events-none z-20"></div>

      {/* Image Container with Badges and Floating Builder Logo */}
      <div className="relative aspect-[16/10]">
        {/* Rounded Image Frame (overflow-hidden prevents image corners from spilling out) */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black/30 shadow-md">
          <img
            src={imageUrl}
            alt={plot.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top-Left: India Flag Pill Badge */}
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-gray-900 shadow-md backdrop-blur-md">
              <span>🇮🇳</span> India
            </span>
          </div>

          {/* Top-Right: Land Approval Pill Badge (RERA Registered, Government Approved, TCP Approved, NOC Zone Approved) */}
          <div className="absolute right-3 top-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-700 shadow-md backdrop-blur-md border border-emerald-100">
              <CheckCircle2 size={13} className="text-emerald-600" />
              {approvalBadgeText}
            </span>
          </div>
        </div>

        {/* Floating Builder Logo (OUTSIDE overflow-hidden, elevated to z-30 in FRONT so it is never cut off) */}
        <div
          className="absolute -bottom-6 z-30 transition-transform duration-300 group-hover:scale-110 drop-shadow-2xl"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <BuilderLogo builderName={builderName} logoUrl={logoUrl} />
        </div>
      </div>

      {/* Content Container (White text on Red background) */}
      <div className="mt-2 pt-6 flex flex-1 flex-col relative z-10">
        {/* Title & External View Link */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/property/${linkId}`} className="flex-1 min-w-0">
            <h2 className="line-clamp-1 text-base md:text-lg font-black text-white transition-opacity hover:opacity-90">
              {plot.title}
            </h2>
            <p className="text-xs font-bold text-white/85 mt-0.5 truncate">
              {subtitle}
            </p>
          </Link>
          <Link
            href={`/property/${linkId}`}
            className="flex-shrink-0 p-2 rounded-xl border border-white/30 bg-white/15 text-white hover:bg-white hover:text-primary transition-all shadow-xs backdrop-blur-xs"
            title="View Details"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Builder Name Line */}
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-white">
          {logoUrl ? (
            <img src={logoUrl} alt={builderName} className="h-4 w-4 rounded-full object-contain bg-white p-0.5 shrink-0" />
          ) : (
            <Building2 size={14} className="text-white/90 flex-shrink-0" />
          )}
          <span className="truncate">By {builderName}</span>
        </div>

        {/* Location Line */}
        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/85">
          <MapPin size={14} className="text-white/80 flex-shrink-0" />
          <span className="truncate">{plot.location}</span>
        </div>

        {/* Metrics Grid: Glass Box with White Text */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-black/20 backdrop-blur-md p-3 border border-white/20 shadow-inner">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-white/75">LAUNCH PRICE</p>
            <p className="mt-0.5 truncate text-base font-black text-white">{plot.price}</p>
          </div>
          <div className="border-l border-white/20 pl-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/75">HANDOVER</p>
            <p className="mt-0.5 truncate text-xs font-black text-white">{handoverText}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2">
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-gray-950 px-3 py-2.5 text-xs font-extrabold shadow-sm transition-all hover:bg-white/90 active:scale-95"
          >
            <MessageCircle size={15} className="text-emerald-600" />
            WhatsApp Builder
          </a>

          <Link
            href={`/property/${linkId}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black/35 hover:bg-black/50 text-white border border-white/30 px-4 py-2.5 text-xs font-black shadow-sm transition-all active:scale-95"
          >
            <span>Explore</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
