"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, Clock, Compass, CreditCard, FileText, Home as HomeIcon, Inbox, MapPin, MessageCircle, Phone, Sparkles, TrendingUp, Users, Video, Plus, ShieldCheck, Mail, CheckCircle2, Settings, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/auth';
import { adaptProperties, adaptProperty } from '../utils/propertyAdapter';
import { formatPhoneForDisplay, formatPhoneForLink } from '../utils/phoneUtils';
import DeleteAccountModal from '../components/DeleteAccountModal';

const DeveloperDashboard = () => {
  const navigate = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    apiRequest('/properties/mine')
      .then((data) => setProperties(adaptProperties(data.properties)))
      .catch(() => setProperties([]));

    apiRequest('/inquiries/mine')
      .then((data) => setInquiries(data.inquiries))
      .catch(() => setInquiries([]));

    apiRequest('/service/subscriptions/me')
      .then((data) => {
        setSubscription(data.subscription);
      })
      .catch(() => setSubscription(null));
  }, []);

  const handleDownloadLeadsExcel = () => {
    if (!inquiries || inquiries.length === 0) return;

    const headers = [
      'S.No.',
      'Buyer Name',
      'Phone Number',
      'Email Address',
      'Property / Project Title',
      'Message',
      'Status',
      'Date'
    ];

    const rows = inquiries.map((lead, index) => {
      const dateStr = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN') : 'N/A';
      const formattedPhone = lead.phone ? formatPhoneForDisplay(lead.phone) : 'N/A';
      const phoneCell = lead.phone ? `="${formattedPhone.replace(/"/g, '""')}"` : '"N/A"';

      return [
        index + 1,
        `"${(lead.name || 'N/A').replace(/"/g, '""')}"`,
        phoneCell,
        `"${(lead.email || 'N/A').replace(/"/g, '""')}"`,
        `"${(lead.property?.title || 'Unknown Project').replace(/"/g, '""')}"`,
        `"${(lead.message || 'N/A').replace(/"/g, '""')}"`,
        `"${(lead.status || 'new').replace(/"/g, '""')}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Plotyards_Developer_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeadStatusChange = async (inquiryId, newStatus) => {
    try {
      const data = await apiRequest(`/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      setInquiries((prev) =>
        prev.map((lead) => (lead._id === inquiryId ? { ...lead, status: data.inquiry?.status || newStatus } : lead))
      );
    } catch (err) {
      alert(err.message || 'Failed to update lead status');
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Interested':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
      case 'Not Interested':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50';
      case 'No Response':
      case 'Call Not Pick':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'Future Prospect':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/50';
      case 'Callback Requested':
        return 'bg-sky-950/80 text-sky-400 border-sky-500/50';
      case 'closed':
        return 'bg-green-950/80 text-green-400 border-green-500/50';
      case 'contacted':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/50';
      default:
        return 'bg-white/10 text-gray-300 border-white/20';
    }
  };

  const profileViews = properties.reduce((sum, item) => sum + (Number(item.viewsCount) || 0), 0);
  const activeListings = properties.filter((item) => item.status !== 'sold').length;

  const navItems = [
    ['overview', BarChart3, 'Overview'],
    ['leads', Inbox, 'Buyer Leads'],
    ['listings', HomeIcon, 'Project Listings'],
    ['services', Sparkles, 'Premium Services'],
    ['subscription', CreditCard, 'Subscription'],
    ['settings', Settings, 'Settings']
  ];

  return (
    <div className="min-h-screen pt-28 pb-12 bg-[#050505] text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#d4af37]/10 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-6 lg:px-12 max-w-[1600px] relative z-10">
        <div className="flex flex-col mb-12">
          <p className="text-[#d4af37] font-black uppercase tracking-[0.3em] text-sm mb-2">Developer Workspace</p>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffdf00] to-white tracking-tight leading-tight">
            MAXIMALIST <br/>COMMAND CENTER.
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <aside className="lg:col-span-3">
            <div className="bg-[#111] rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(212,175,55,0.05)] border border-[#d4af37]/20 sticky top-32 backdrop-blur-3xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#ffdf00] rounded-[1.5rem] flex items-center justify-center text-black text-3xl font-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-white leading-tight">{user?.name}</h3>
                  <p className="text-xs text-[#d4af37] font-black uppercase tracking-widest mt-1">Verified Developer</p>
                </div>
              </div>

              <nav className="flex flex-col gap-3">
                {navItems.map(([tab, Icon, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-left ${activeTab === tab ? 'bg-gradient-to-r from-[#d4af37]/20 to-transparent border-l-4 border-[#d4af37] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <Icon size={22} className={activeTab === tab ? 'text-[#ffdf00]' : 'text-gray-500 group-hover:text-gray-300'} /> 
                    <span className="tracking-wide">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-9">
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all shadow-2xl">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-[40px] group-hover:bg-[#d4af37]/20 transition-all"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Total Project Views</p>
                    <p className="text-6xl font-black text-white">{profileViews}</p>
                  </div>
                  <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-[#d4af37]/30 transition-all shadow-2xl">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-[40px] group-hover:bg-[#d4af37]/20 transition-all"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Exclusive Leads</p>
                    <p className="text-6xl font-black text-white">{inquiries.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] p-8 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                    <p className="text-black/60 font-bold uppercase tracking-widest text-xs mb-2">Active Projects</p>
                    <p className="text-6xl font-black text-black">{activeListings}</p>
                  </div>
                </div>

                <div className="bg-[#111] rounded-[2.5rem] border border-white/10 p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                  <h3 className="text-2xl font-black text-white mb-6 tracking-wide">QUICK ACTIONS.</h3>
                  <div className="flex flex-wrap gap-4 relative z-10">
                    <Link href="/post-property" className="bg-white text-black font-black uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors">
                      <Plus size={20} /> Launch New Project
                    </Link>
                    <button onClick={() => setActiveTab('services')} className="bg-transparent border-2 border-[#d4af37] text-[#d4af37] font-black uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-[#d4af37]/10 transition-colors">
                      <Sparkles size={20} /> Request Drone Shoot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-3">Premium Developer Services</h2>
                  <p className="text-gray-400 font-medium text-lg">Included in your Developer Growth Package.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 hover:border-[#d4af37]/50 transition-all group">
                    <Video className="text-[#d4af37] w-12 h-12 mb-6" />
                    <h3 className="text-2xl font-black text-white mb-3">Professional Drone Footage</h3>
                    <p className="text-gray-400 mb-6 font-medium">Request our professional team to capture cinematic drone footage of your project site for maximum buyer impact.</p>
                    <button className="text-[#d4af37] font-black uppercase tracking-wider text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                      Schedule Shoot <TrendingUp size={16} />
                    </button>
                  </div>
                  <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/10 hover:border-[#d4af37]/50 transition-all group">
                    <MessageCircle className="text-[#d4af37] w-12 h-12 mb-6" />
                    <h3 className="text-2xl font-black text-white mb-3">Developer Podcast Feature</h3>
                    <p className="text-gray-400 mb-6 font-medium">Book your slot on the PlotYards Exclusive Podcast to talk about your vision, upcoming projects, and brand story.</p>
                    <button className="text-[#d4af37] font-black uppercase tracking-wider text-sm flex items-center gap-2 group-hover:gap-4 transition-all">
                      Book Podcast <TrendingUp size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-black uppercase text-white">Your Projects</h2>
                    <Link href="/post-property" className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-black text-black uppercase tracking-wider">Launch Project</Link>
                  </div>
                  {properties.map((property) => (
                    <div key={property.id} className="rounded-[2rem] border border-white/10 bg-[#111] p-6 transition-all duration-300 hover:border-[#d4af37]/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-black text-2xl text-white">{property.title}</p>
                          <p className="text-sm font-bold text-[#d4af37] mt-2">{property.location} <span className="text-gray-500 mx-2">•</span> {property.price}</p>
                          <p className="mt-2 text-xs font-black uppercase tracking-widest text-gray-500">Status: <span className="text-white">{property.status || 'approved'}</span></p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
                          <Link
                            href={`/post-property?edit=${property.id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!properties.length && <p className="text-[#d4af37] font-bold">No projects launched yet.</p>}
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-4xl font-black uppercase text-white">Exclusive Leads</h2>
                  {inquiries.length > 0 && (
                    <button
                      onClick={handleDownloadLeadsExcel}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] hover:bg-[#b8972e] px-5 py-2.5 text-xs font-extrabold text-black shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <FileSpreadsheet size={16} />
                      <span>Download Leads (Excel)</span>
                    </button>
                  )}
                </div>
                <div className="grid gap-6">
                    {inquiries.map((lead) => {
                      return (
                        <article key={lead._id} className="rounded-[2rem] border border-white/10 bg-[#111] p-8 transition-all hover:border-[#d4af37]/40 shadow-xl">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div>
                              <p className="font-black text-3xl text-white mb-2">{lead.name}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <a
                                  href={`tel:+${formatPhoneForLink(lead.phone)}`}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
                                >
                                  <Phone size={14} />
                                  Call
                                </a>
                                <a
                                  href={`https://wa.me/${formatPhoneForLink(lead.phone)}?text=${encodeURIComponent(`Hi ${lead.name || ''}, I received your inquiry on Plotyards.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1ebd5a]"
                                >
                                  <MessageCircle size={14} />
                                  WhatsApp
                                </a>
                              </div>
                              {lead.message && (
                                <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs text-gray-300">
                                  <MessageCircle size={14} className="mt-0.5 text-[#d4af37] flex-shrink-0" />
                                  <p>{lead.message}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col lg:items-end gap-3">
                              <div className="text-left lg:text-right">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Project Interest</p>
                                <p className="text-lg font-bold text-white">{lead.property?.title || 'Unknown Project'}</p>
                              </div>
                              <div className="relative inline-block mt-2">
                                <select
                                  value={lead.status || 'Interested'}
                                  onChange={(e) => handleLeadStatusChange(lead._id, e.target.value)}
                                  className={`appearance-none rounded-xl border px-4 py-2 pr-8 text-xs font-extrabold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 cursor-pointer ${getStatusBadgeStyle(lead.status)}`}
                                >
                                  <option value="Interested" className="bg-[#111] text-white">Interested</option>
                                  <option value="Not Interested" className="bg-[#111] text-white">Not Interested</option>
                                  <option value="No Response" className="bg-[#111] text-white">No Response</option>
                                  <option value="Future Prospect" className="bg-[#111] text-white">Future Prospect</option>
                                  <option value="Callback Requested" className="bg-[#111] text-white">Callback Requested</option>
                                  {['new', 'contacted', 'closed', 'Call Not Pick'].includes(lead.status) && (
                                    <option value={lead.status} className="bg-[#111] text-white">{lead.status}</option>
                                  )}
                                </select>
                                <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70 text-white" />
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    {!inquiries.length && <p className="text-[#d4af37] font-bold">No leads generated yet.</p>}
                  </div>
              </div>
            )}
            
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase text-white mb-8">Developer Subscription</h2>
                <div className="bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] p-10 rounded-[3rem] text-black shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                  <p className="font-black uppercase tracking-widest text-sm mb-2 opacity-80">Current Package</p>
                  <h3 className="text-5xl font-black mb-8">Developer Growth Package</h3>
                  <div className="bg-black/10 rounded-2xl p-6 backdrop-blur-sm border border-black/10">
                    <p className="font-bold text-lg mb-4">Included Features:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                      <li className="flex items-center gap-2"><CheckCircle2 size={18} /> {10 * (subscription?.quantity || 1)} Premium Project Listings</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={18} /> {20 * (subscription?.quantity || 1)} Professional Reel Ads</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={18} /> {1 * (subscription?.quantity || 1)} Exclusive Developer Podcast{subscription?.quantity > 1 ? 's' : ''}</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={18} /> Professional Drone Footage</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase text-white mb-8">Account Settings</h2>
                <div className="bg-[#111] p-10 rounded-[3rem] border border-red-900/30 shadow-[0_0_40px_rgba(220,38,38,0.1)]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-red-500 mb-2">Danger Zone</h3>
                      <p className="text-gray-400 font-bold max-w-xl text-sm">
                        Permanently delete your developer account, including all your project listings, leads, and personal data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="shrink-0 inline-flex items-center justify-center rounded-xl bg-red-600/20 border border-red-600/50 px-8 py-4 text-sm font-black text-red-500 uppercase tracking-wider transition-colors hover:bg-red-600 hover:text-white"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
};

export default DeveloperDashboard;
