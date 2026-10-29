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
      <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0`}>
        <img src={logoUrl} alt={builderName} className="h-full w-full object-contain rounded-full" />
      </div>
    );
  }

  // DLF Logo: 3 red horizontal bars and bold DLF text
  if (name.includes('dlf')) {
    return (
      <div className={`${className} rounded-full bg-white p-1.5 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="flex flex-col items-center justify-center">
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
      <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl font-black text-[#6F2C91] italic font-serif leading-none">G</span>
          <span className="text-[7px] font-extrabold tracking-widest text-[#6F2C91] uppercase leading-none mt-0.5">GODREJ</span>
        </div>
      </div>
    );
  }

  // Lodha Logo: Blue geometric L with gold accent and LODHA text
  if (name.includes('lodha')) {
    return (
      <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="flex flex-col items-center justify-center">
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
      <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="flex flex-col items-center justify-center">
          <span className="px-1.5 py-0.5 bg-[#E11D48] text-white text-[8px] font-black rounded-xs">BP</span>
          <span className="text-[8px] font-black tracking-wider text-black leading-none mt-0.5">BPTP</span>
        </div>
      </div>
    );
  }

  // Signature Global Logo
  if (name.includes('signature')) {
    return (
      <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-base font-black text-[#0D9488] leading-none">SG</span>
          <span className="text-[6px] font-bold text-gray-700 leading-none mt-0.5">SIGNATURE</span>
        </div>
      </div>
    );
  }

  // Generic / Custom Developer monogram
  const initials = builderName
    ? builderName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'B';

  return (
    <div className={`${className} rounded-full bg-white p-1 border-2 border-white shadow-xl flex flex-col items-center justify-center shrink-0`}>
      <div className="h-full w-full rounded-full bg-rose-50 border border-rose-200/60 flex flex-col items-center justify-center">
        <Building2 size={16} className="text-primary" />
        <span className="text-[8px] font-black tracking-tighter text-gray-900 leading-none mt-0.5">{initials}</span>
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

  return (
    <div className="group relative flex flex-col rounded-[2rem] border border-gray-200/90 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-rose-500/10">
      {/* Top Red Luxury Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-[2rem]" />

      {/* Image Container with Badges and Floating Builder Logo */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface shadow-sm">
        <img
          src={imageUrl}
          alt={plot.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Top-Left: India Flag Pill Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-gray-900 shadow-md backdrop-blur-md">
            <span>🇮🇳</span> India
          </span>
        </div>

        {/* Top-Right: RERA Registered Pill Badge */}
        <div className="absolute right-3 top-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-700 shadow-md backdrop-blur-md border border-emerald-100">
            <CheckCircle2 size={13} className="text-emerald-600" />
            RERA Registered
          </span>
        </div>

        {/* Floating Builder Logo (Overlapping bottom edge of image) */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
          <BuilderLogo builderName={builderName} logoUrl={logoUrl} />
        </div>
      </div>

      {/* Content Container (pt-7 to give comfortable space under floating logo) */}
      <div className="mt-2 pt-6 flex flex-1 flex-col">
        {/* Title & External View Link */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/property/${linkId}`} className="flex-1 min-w-0">
            <h2 className="line-clamp-1 text-base md:text-lg font-black text-gray-950 transition-colors group-hover:text-primary">
              {plot.title}
            </h2>
            <p className="text-xs font-bold text-gray-500 mt-0.5 truncate">
              {subtitle}
            </p>
          </Link>
          <Link
            href={`/property/${linkId}`}
            className="flex-shrink-0 p-2 rounded-xl border border-gray-200/90 bg-white text-gray-400 hover:text-primary hover:border-primary/50 hover:bg-rose-50/40 transition-all shadow-xs"
            title="View Details"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Builder Name Line */}
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <Building2 size={14} className="text-primary flex-shrink-0" />
          <span className="truncate">By {builderName}</span>
        </div>

        {/* Location Line */}
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <MapPin size={14} className="text-primary flex-shrink-0" />
          <span className="truncate">{plot.location}</span>
        </div>

        {/* Red & White Premium Metrics Grid (Image 1 style) */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-3 border border-rose-100 shadow-[0_2px_10px_rgba(225,29,72,0.03)]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">LAUNCH PRICE</p>
            <p className="mt-0.5 truncate text-base font-black text-primary">{plot.price}</p>
          </div>
          <div className="border-l border-rose-100 pl-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">HANDOVER</p>
            <p className="mt-0.5 truncate text-xs font-black text-gray-800">{handoverText}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95"
          >
            <MessageCircle size={15} />
            WhatsApp Builder
          </a>

          <Link
            href={`/property/${linkId}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-black text-white shadow-sm shadow-primary/25 transition-all hover:bg-rose-700 active:scale-95"
          >
            <span>Explore</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
