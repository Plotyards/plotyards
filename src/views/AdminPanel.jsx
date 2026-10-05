"use client";

import { useEffect, useState } from 'react';
import { Activity, BarChart3, Building2, CheckCircle2, ChevronLeft, ChevronRight, FileText, Image, Inbox, Megaphone, Plus, Search, ShieldCheck, Sparkles, Star, Trash2, Upload, Users, XCircle, Download } from 'lucide-react';
import { DEFAULT_TOP_CITIES } from '../data/topCities';
import { apiRequest } from '../lib/api';
import BlogManager from '../components/BlogManager';
import { formatPhoneForDisplay } from '../utils/phoneUtils';

const ADMIN_TABLE_PAGE_SIZE = 5;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const formatAdminDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getReapplyDate = (broker) => {
  const rejectedAt = broker.brokerProfile?.rejectedAt;
  if (!rejectedAt) return 'After 2 days';

  const date = new Date(rejectedAt);
  date.setDate(date.getDate() + 2);
  return formatAdminDate(date);
};

const PaginationControls = ({ page, pageCount, pageSize, totalItems, onPageChange }) => {
  const startItem = totalItems ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 bg-white px-4 py-3 text-sm font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {startItem}-{endItem} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-extrabold text-text shadow-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Prev
        </button>
        <span className="rounded-lg bg-surface px-3 py-2 text-xs font-extrabold text-text">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, pageCount))}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-extrabold text-text shadow-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [featureProperties, setFeatureProperties] = useState([]);
  const [pendingBrokers, setPendingBrokers] = useState([]);
  const [pendingBrokerSearch, setPendingBrokerSearch] = useState('');
  const [brokerSearch, setBrokerSearch] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', message: '', isActive: true });
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [announcementStatus, setAnnouncementStatus] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [brokerPage, setBrokerPage] = useState(1);
  const [featurePage, setFeaturePage] = useState(1);
  const [builderPage, setBuilderPage] = useState(1);
  const [topCities, setTopCities] = useState([]);
  const [topCitiesStatus, setTopCitiesStatus] = useState('');
  const [selectedRealtorToEdit, setSelectedRealtorToEdit] = useState(null);
  const [editingRealtorForm, setEditingRealtorForm] = useState({});
  const [savingRealtor, setSavingRealtor] = useState(false);

  const loadAdminData = async () => {
    const [statsData, usersData, pendingBrokersData, announcementData, featurePropertiesData, topCitiesData] = await Promise.all([
      apiRequest('/admin/stats'),
      apiRequest('/admin/users'),
      apiRequest('/admin/brokers/pending'),
      apiRequest('/admin/announcement'),
      apiRequest('/admin/properties?status=all'),
      apiRequest('/admin/top-cities')
    ]);

    setStats(statsData.stats);
    setUsers(usersData.users);
    setPendingBrokers(pendingBrokersData.brokers);
    setAnnouncement(announcementData.announcement || { title: '', message: '', isActive: true });
    setAnnouncementHistory(announcementData.announcements || []);
    setFeatureProperties(featurePropertiesData.properties);
    setTopCities(topCitiesData.topCities?.length ? topCitiesData.topCities : DEFAULT_TOP_CITIES);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadAdminData();
      } catch {
        // Keep the panel usable if an admin widget is temporarily unavailable.
      }
    };

    load();
  }, []);

  useEffect(() => {
    const refreshLiveStats = async () => {
      try {
        const data = await apiRequest('/admin/stats');
        setStats(data.stats);
      } catch {
        // Ignore transient refresh failures.
      }
    };

    const intervalId = window.setInterval(refreshLiveStats, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const moderateBroker = async (id, action) => {
    const options = { method: 'PATCH' };

    if (action === 'reject') {
      const reason = window.prompt('Please enter the rejection reason for this associate partner approval:');
      if (!reason?.trim()) return;
      options.body = { reason: reason.trim() };
    }

    await apiRequest(`/admin/brokers/${id}/${action}`, options);
    await loadAdminData();
  };

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    setAnnouncementStatus('');
    const data = await apiRequest('/admin/announcement', {
      method: 'PATCH',
      body: announcement
    });
    setAnnouncement(data.announcement);
    setAnnouncementHistory(data.announcements || []);
    setAnnouncementStatus('Announcement updated.');
    window.dispatchEvent(new Event('announcement-updated'));
  };

  const removeAnnouncement = async (announcementId) => {
    setAnnouncementStatus('');
    const data = await apiRequest(`/admin/announcement${announcementId ? `?id=${announcementId}` : ''}`, { method: 'DELETE' });
    setAnnouncement(data.announcement || { title: '', message: '', isActive: false });
    setAnnouncementHistory(data.announcements || []);
    setAnnouncementStatus('Announcement removed.');
    window.dispatchEvent(new Event('announcement-updated'));
  };

  const saveTopCities = async () => {
    try {
      setTopCitiesStatus('Saving...');
      await apiRequest('/admin/top-cities', {
        method: 'PUT',
        body: { topCities }
      });
      setTopCitiesStatus('Top cities updated successfully.');
      setTimeout(() => setTopCitiesStatus(''), 3000);
    } catch (err) {
      setTopCitiesStatus(`Error: ${err.message}`);
    }
  };

  const updateTopCity = (index, field, value) => {
    const updated = [...topCities];
    updated[index] = { ...updated[index], [field]: value };
    setTopCities(updated);
  };

  const handleTopCityImage = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateTopCity(index, 'image', dataUrl);
    } catch {
      alert('Failed to read image');
    }
  };

  const addTopCity = () => {
    setTopCities([...topCities, { name: '', plots: '', price: '', image: '', isActive: true }]);
  };

  const removeTopCity = (index) => {
    setTopCities(topCities.filter((_, i) => i !== index));
  };

  const toggleFeatureProperty = async (property) => {
    const data = await apiRequest(`/admin/properties/${property._id}/feature`, {
      method: 'PATCH',
      body: { featured: !property.featured }
    });
    setFeatureProperties((current) => current.map((item) => (
      item._id === property._id ? data.property : item
    )));
  };

  const toggleDeveloperProperty = async (property) => {
    const isDev = !property.isDeveloperListing;
    const data = await apiRequest(`/properties/${property._id}`, {
      method: 'PATCH',
      body: { isDeveloperListing: isDev }
    });
    setFeatureProperties((current) => current.map((item) => (
      item._id === property._id ? { ...item, isDeveloperListing: isDev, ...data.property } : item
    )));
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Delete this property permanently?')) return;
    await apiRequest(`/properties/${propertyId}`, { method: 'DELETE' });
    setFeatureProperties((current) => current.filter((item) => item._id !== propertyId));
  };

  const handleMarkSold = async (propertyId) => {
    if (!window.confirm('Mark this property as sold out?')) return;
    const data = await apiRequest(`/properties/${propertyId}`, {
      method: 'PATCH',
      body: { status: 'sold' }
    });
    setFeatureProperties((current) => current.map((item) => (
      item._id === propertyId ? data.property : item
    )));
  };

  const toggleBrokerActive = async (broker) => {
    const data = await apiRequest(`/admin/users/${broker._id}`, {
      method: 'PATCH',
      body: { isActive: !broker.isActive }
    });

    setUsers((current) => current.map((userItem) => (
      userItem._id === broker._id ? data.user : userItem
    )));
  };

  const handleOpenEditRealtorModal = (broker) => {
    const bp = broker.brokerProfile || {};
    setSelectedRealtorToEdit(broker);
    setEditingRealtorForm({
      name: broker.name || '',
      email: broker.email || '',
      phone: broker.phone || '',
      companyName: bp.companyName || '',
      reraId: bp.reraId || '',
      contactPhone: bp.contactPhone || broker.phone || '',
      whatsappNumber: bp.whatsappNumber || broker.phone || '',
      state: bp.state || 'Haryana',
      city: bp.city || 'Rohtak',
      locality: bp.locality || '',
      areasServed: Array.isArray(bp.areasServed) ? bp.areasServed.join(', ') : (bp.areasServed || ''),
      experienceYears: bp.experienceYears || 0,
      closedDeals: bp.closedDeals || '100+',
      totalSales: bp.totalSales || '₹50Cr+',
      bio: bp.bio || '',
      photo: bp.photo || '',
      instagram: bp.socialLinks?.instagram || '',
      facebook: bp.socialLinks?.facebook || '',
      linkedin: bp.socialLinks?.linkedin || '',
      youtube: bp.socialLinks?.youtube || ''
    });
  };

  const handleSaveRealtorProfile = async () => {
    if (!selectedRealtorToEdit) return;
    setSavingRealtor(true);
    try {
      const areasList = typeof editingRealtorForm.areasServed === 'string'
        ? editingRealtorForm.areasServed.split(',').map(s => s.trim()).filter(Boolean)
        : editingRealtorForm.areasServed;

      const payload = {
        name: editingRealtorForm.name,
        email: editingRealtorForm.email,
        phone: editingRealtorForm.phone,
        brokerProfile: {
          photo: editingRealtorForm.photo,
          companyName: editingRealtorForm.companyName,
          reraId: editingRealtorForm.reraId,
          contactPhone: editingRealtorForm.contactPhone,
          whatsappNumber: editingRealtorForm.whatsappNumber,
          state: editingRealtorForm.state,
          city: editingRealtorForm.city,
          locality: editingRealtorForm.locality,
          areasServed: areasList,
          experienceYears: Number(editingRealtorForm.experienceYears) || 0,
          closedDeals: editingRealtorForm.closedDeals,
          totalSales: editingRealtorForm.totalSales,
          bio: editingRealtorForm.bio,
          socialLinks: {
            instagram: editingRealtorForm.instagram,
            facebook: editingRealtorForm.facebook,
            linkedin: editingRealtorForm.linkedin,
            youtube: editingRealtorForm.youtube
          }
        }
      };

      await apiRequest(`/admin/users/${selectedRealtorToEdit._id}`, {
        method: 'PATCH',
        body: payload
      });

      await loadAdminData();
      setSelectedRealtorToEdit(null);
      alert('Realtor profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update realtor profile');
    } finally {
      setSavingRealtor(false);
    }
  };

  const handleDeleteRealtor = async (broker) => {
    if (!window.confirm(`Are you sure you want to permanently delete realtor "${broker.name}" (${broker.brokerProfile?.companyName || broker.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${broker._id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u._id !== broker._id));
      alert('Realtor deleted successfully.');
    } catch (err) {
      alert(err.message || 'Failed to delete realtor');
    }
  };

  const exportBrokersToCSV = () => {
    if (!filteredBrokers.length) return;
    
    // Headers
    const headers = ['Name', 'Email', 'Phone', 'Company Name', 'Company Type', 'RERA ID', 'Status', 'Account Status', 'Registered At'];
    
    // Rows
    const rows = filteredBrokers.map(broker => [
      broker.name || '',
      broker.email || '',
      broker.phone || broker.brokerProfile?.contactPhone || '',
      broker.brokerProfile?.companyName || '',
      broker.brokerProfile?.companyType || '',
      broker.brokerProfile?.reraId || '',
      broker.brokerStatus || 'approved',
      broker.isActive ? 'Enabled' : 'Disabled',
      new Date(broker.createdAt).toLocaleString()
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `brokers_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    ['stats', BarChart3, 'Analytics'],
    ['manageBrokers', Users, 'Manage Associate Partners'],
    ['properties', Building2, 'Manage Properties'],
    ['builderProjects', Sparkles, 'Builder Projects'],
    ['blogs', FileText, 'Blogs'],
    ['announcement', Megaphone, 'Announcement'],
    ['topCities', Building2, 'Top Cities']
  ];

  const liveUsersDisplay = Number.isFinite(stats?.liveUsers) ? stats.liveUsers : '-';

  const statCards = [
    [Activity, 'Live Buyers', liveUsersDisplay, 'text-emerald-700'],
    [ShieldCheck, 'Total Associate Partners', stats?.brokers ?? '-', 'text-secondary'],
    [BarChart3, 'Posts This Week', stats?.postsThisWeek ?? '-', 'text-violet-700']
  ];

  const analyticsData = [
    { label: 'Total Buyers', value: stats?.users || 0, color: 'bg-primary' },
    { label: 'Associate Partners', value: stats?.brokers || 0, color: 'bg-secondary' },
    { label: 'Pending Properties', value: stats?.pendingProperties || 0, color: 'bg-amber-500' },
    { label: 'Inquiries', value: stats?.inquiries || 0, color: 'bg-violet-600' },
    { label: 'Posts This Week', value: stats?.postsThisWeek || 0, color: 'bg-cyan-600' }
  ];
  const maxAnalyticsValue = Math.max(...analyticsData.map((item) => item.value), 1);
  const brokerSearchTerm = brokerSearch.trim().toLowerCase();
  const pendingBrokerSearchTerm = pendingBrokerSearch.trim().toLowerCase();
  const filteredPendingBrokers = pendingBrokers.filter((broker) => {
    const haystack = [broker.name, broker.email, broker.phone, broker.brokerProfile?.companyName]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return !pendingBrokerSearchTerm || haystack.includes(pendingBrokerSearchTerm);
  });
  const filteredBrokers = users
    .filter((userItem) => userItem.role === 'broker' || userItem.brokerStatus === 'rejected')
    .filter((broker) => {
      const haystack = [broker.name, broker.email, broker.phone, broker.brokerProfile?.companyName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return !brokerSearchTerm || haystack.includes(brokerSearchTerm);
    });
  const brokerPageCount = Math.max(Math.ceil(filteredBrokers.length / ADMIN_TABLE_PAGE_SIZE), 1);
  const safeBrokerPage = Math.min(brokerPage, brokerPageCount);
  const paginatedBrokers = filteredBrokers.slice(
    (safeBrokerPage - 1) * ADMIN_TABLE_PAGE_SIZE,
    safeBrokerPage * ADMIN_TABLE_PAGE_SIZE
  );
  const featurePageCount = Math.max(Math.ceil(featureProperties.length / ADMIN_TABLE_PAGE_SIZE), 1);
  const safeFeaturePage = Math.min(featurePage, featurePageCount);
  const paginatedFeatureProperties = featureProperties.slice(
    (safeFeaturePage - 1) * ADMIN_TABLE_PAGE_SIZE,
    safeFeaturePage * ADMIN_TABLE_PAGE_SIZE
  );
  const builderProperties = featureProperties.filter((p) => p.isDeveloperListing);
  const builderPageCount = Math.max(Math.ceil(builderProperties.length / ADMIN_TABLE_PAGE_SIZE), 1);
  const safeBuilderPage = Math.min(builderPage, builderPageCount);
  const paginatedBuilderProperties = builderProperties.slice(
    (safeBuilderPage - 1) * ADMIN_TABLE_PAGE_SIZE,
    safeBuilderPage * ADMIN_TABLE_PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-surface pt-32 pb-12">
      <div className="container mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-secondary shadow-sm">
              <Sparkles size={14} /> Plotyards admin
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-text">Admin Control Panel</h1>
            <p className="mt-2 text-sm font-medium text-muted">Manage associate partner approvals, homepage cities, announcements, and platform activity.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Live buyers now</p>
            <p className="mt-1 text-2xl font-extrabold text-secondary">{liveUsersDisplay}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm h-fit">
            {navItems.map(([tab, Icon, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold capitalize ${activeTab === tab ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-sm' : 'text-muted hover:bg-surface'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </div>
              </button>
            ))}
          </aside>

          <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
            {activeTab === 'brokers' ? (
              <div className="grid gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text">Associate Partner Approvals</h2>
                    <p className="mt-2 text-sm font-medium text-muted">Review pending associate partner requests and search by name, phone, or company.</p>
                  </div>
                  <label className="flex min-h-12 w-full items-center gap-2 rounded-xl border border-border bg-surface px-4 lg:max-w-sm">
                    <Search size={17} className="text-muted" />
                    <input
                      value={pendingBrokerSearch}
                      onChange={(event) => setPendingBrokerSearch(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-text outline-none placeholder:text-muted"
                      placeholder="Search pending associate partners..."
                    />
                  </label>
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs font-extrabold uppercase tracking-wide text-muted">
                        <tr>
                          <th className="px-4 py-3">Associate Partner</th>
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">Requested</th>
                          <th className="px-4 py-3 text-right">Decision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {filteredPendingBrokers.map((broker) => (
                          <tr key={broker._id} className="bg-white align-top transition-colors hover:bg-surface/70">
                            <td className="px-4 py-4">
                              <p className="font-extrabold text-text">{broker.name}</p>
                              <p className="text-xs font-semibold text-muted">{broker.email || 'No email'}</p>
                              <p className="text-xs font-semibold text-muted">{formatPhoneForDisplay(broker.phone || broker.brokerProfile?.contactPhone) || 'No phone'}</p>
                            </td>
                            <td className="px-4 py-4 font-semibold text-muted">{broker.brokerProfile?.companyName || 'N/A'}</td>
                            <td className="px-4 py-4 font-semibold text-muted">{formatAdminDate(broker.updatedAt || broker.createdAt)}</td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => moderateBroker(broker._id, 'approve')} className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-100">
                                  <CheckCircle2 size={16} /> Approve
                                </button>
                                <button onClick={() => moderateBroker(broker._id, 'reject')} className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-rose-100">
                                  <XCircle size={16} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!filteredPendingBrokers.length && (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-sm font-bold text-muted">
                              No pending associate partner request found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'manageBrokers' ? (
              <div className="grid gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text">Manage Associate Partners</h2>
                    <p className="mt-2 text-sm font-medium text-muted">Search associate partners by name, email, phone, or company.</p>
                  </div>
                  <button
                    onClick={exportBrokersToCSV}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
                  >
                    <Download size={18} /> Export to Excel
                  </button>
                </div>
                <input
                  value={brokerSearch}
                  onChange={(event) => {
                    setBrokerSearch(event.target.value);
                    setBrokerPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text outline-none focus:border-primary"
                  placeholder="Search associate partners..."
                />
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[840px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs font-extrabold uppercase tracking-wide text-muted">
                        <tr>
                          <th className="px-4 py-3">Associate Partner</th>
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">Approval</th>
                          <th className="px-4 py-3">Account</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {paginatedBrokers.map((broker) => (
                          <tr key={broker._id} className="bg-white transition-colors hover:bg-surface/70">
                            <td className="px-4 py-4 align-top">
                              <p className="font-extrabold text-text">{broker.name}</p>
                              <p className="text-xs font-semibold text-muted">{broker.email || 'No email added'}</p>
                              <p className="text-xs font-semibold text-muted">{formatPhoneForDisplay(broker.phone) || 'No phone added'}</p>
                            </td>
                            <td className="px-4 py-4 align-top font-semibold text-muted">
                              {broker.brokerProfile?.companyName || 'N/A'}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold capitalize text-muted">
                                {broker.brokerStatus || 'approved'}
                              </span>
                              {broker.brokerStatus === 'rejected' && (
                                <p className="mt-2 text-xs font-semibold text-primary">
                                  Reapply after {getReapplyDate(broker)}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className={`inline-flex rounded-full border border-black/10 px-3 py-1 text-xs font-extrabold ${broker.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-primary'}`}>
                                {broker.isActive ? 'Enabled' : 'Disabled'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right align-top">
                              <div className="flex flex-col gap-2 items-end">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRealtorModal(broker)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700 hover:bg-purple-100 transition-colors"
                                >
                                  <FileText size={13} /> Edit Profile
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await apiRequest(`/admin/realtors/${broker._id}/rera`, { method: 'PATCH' });
                                      loadAdminData();
                                    } catch (e) { alert(e.message); }
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold ${broker.brokerProfile?.isReraVerified ? 'bg-emerald-600 text-white' : 'border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                                >
                                  {broker.brokerProfile?.isReraVerified ? '✓ RERA Certified' : '+ Verify RERA'}
                                </button>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await apiRequest(`/admin/realtors/${broker._id}/membership`, {
                                        method: 'PATCH',
                                        body: JSON.stringify({ bookMyRealtorMember: !broker.brokerProfile?.bookMyRealtorMember })
                                      });
                                      loadAdminData();
                                    } catch (e) { alert(e.message); }
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold ${broker.brokerProfile?.bookMyRealtorMember ? 'bg-blue-600 text-white' : 'border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'}`}
                                >
                                  {broker.brokerProfile?.bookMyRealtorMember ? 'Book My Realtor Active' : '+ Book My Realtor'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleBrokerActive(broker)}
                                  className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1 text-xs font-extrabold shadow-sm transition-colors ${
                                    broker.isActive
                                      ? 'border border-rose-200 bg-rose-50 text-primary hover:bg-rose-100'
                                      : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  {broker.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                  {broker.isActive ? 'Disable Partner' : 'Enable Partner'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRealtor(broker)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600 hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={13} /> Delete Realtor
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!paginatedBrokers.length && (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-sm font-bold text-muted">
                              No associate partners found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    page={safeBrokerPage}
                    pageCount={brokerPageCount}
                    pageSize={ADMIN_TABLE_PAGE_SIZE}
                    totalItems={filteredBrokers.length}
                    onPageChange={setBrokerPage}
                  />
                </div>
              </div>
            ) : activeTab === 'properties' ? (
              <div className="grid gap-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-text">Manage Properties</h2>
                  <p className="mt-2 text-sm font-medium text-muted">Manage all properties, mark them as featured, sold out, edit details or delete them.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs font-extrabold uppercase tracking-wide text-muted">
                        <tr>
                          <th className="px-4 py-3">Property</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {paginatedFeatureProperties.map((property) => (
                          <tr key={property._id} className="bg-white transition-colors hover:bg-surface/70">
                            <td className="px-4 py-4 align-top">
                              <p className="font-extrabold text-text">{property.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-semibold text-muted">{property.type || 'Property'}</span>
                                {property.isDeveloperListing && (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold text-primary">
                                    Builder: {property.builderName || 'Project'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top font-semibold text-muted">
                              {[property.location?.locality, property.location?.city].filter(Boolean).join(', ') || 'N/A'}
                            </td>
                            <td className="px-4 py-4 align-top font-semibold text-muted">
                              {property.price?.label || 'Price on request'}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold capitalize text-muted">
                                {property.status || 'draft'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleDeveloperProperty(property)}
                                  className={`inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-extrabold shadow-sm transition-colors ${property.isDeveloperListing ? 'bg-primary text-white hover:bg-rose-600' : 'border border-primary/30 bg-white text-primary hover:bg-primary/5'}`}
                                  title={property.isDeveloperListing ? 'Remove from Builder Spotlight' : 'Add to Builder Spotlight'}
                                >
                                  <Building2 size={13} />
                                  {property.isDeveloperListing ? 'Builder Active' : '+ Builder'}
                                </button>
                                {property.status !== 'sold' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSold(property._id)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                  >
                                    Mark Sold
                                  </button>
                                )}
                                <a
                                  href={`/post-property?edit=${property._id}`}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                                >
                                  Edit
                                </a>
                                <button
                                  type="button"
                                  onClick={() => toggleFeatureProperty(property)}
                                  className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${property.featured ? 'bg-amber-600 text-white hover:bg-amber-700' : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50'}`}
                                >
                                  <Star size={14} />
                                  {property.featured ? 'Featured' : 'Feature'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProperty(property._id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!paginatedFeatureProperties.length && (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-sm font-bold text-muted">
                              No properties found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    page={safeFeaturePage}
                    pageCount={featurePageCount}
                    pageSize={ADMIN_TABLE_PAGE_SIZE}
                    totalItems={featureProperties.length}
                    onPageChange={setFeaturePage}
                  />
                </div>
              </div>
            ) : activeTab === 'builderProjects' ? (
              <div className="grid gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text flex items-center gap-2">
                      <Sparkles size={24} className="text-primary" />
                      Builder Projects Spotlight
                    </h2>
                    <p className="mt-1 text-sm font-medium text-muted">
                      Post and manage builder & developer projects from your end with full images, about builder info, and direct contact details.
                    </p>
                  </div>
                  <a
                    href="/post-property?type=builder"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-md hover:bg-rose-600 transition-colors"
                  >
                    <Plus size={16} /> Post New Builder Project
                  </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs font-extrabold uppercase tracking-wide text-muted">
                        <tr>
                          <th className="px-4 py-3">Project & Builder</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Price & Size</th>
                          <th className="px-4 py-3">Builder Contact</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {paginatedBuilderProperties.map((property) => (
                          <tr key={property._id} className="bg-white transition-colors hover:bg-surface/70">
                            <td className="px-4 py-4 align-top">
                              <p className="font-extrabold text-text">{property.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-extrabold text-primary">
                                  <Building2 size={12} /> {property.builderName || 'Reputed Builder'}
                                </span>
                                {property.reraNumber && (
                                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    RERA: {property.reraNumber}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top font-semibold text-muted">
                              {[property.location?.locality, property.location?.city].filter(Boolean).join(', ') || 'N/A'}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="font-extrabold text-text">{property.price?.label || 'Price on request'}</p>
                              <p className="text-xs font-medium text-muted">{property.size?.value ? `${property.size.value} Sq. Yrd` : ''}</p>
                            </td>
                            <td className="px-4 py-4 align-top text-xs font-semibold text-muted">
                              {property.builderContact?.phone && (
                                <p className="text-text font-bold">{property.builderContact.phone}</p>
                              )}
                              {property.builderContact?.email && (
                                <p className="truncate text-muted">{property.builderContact.email}</p>
                              )}
                              {!property.builderContact?.phone && !property.builderContact?.email && (
                                <span className="text-gray-400">Direct on Plotyards</span>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold capitalize text-muted">
                                {property.status || 'approved'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <a
                                  href={`/property/${property._id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm transition-colors border border-gray-200 bg-white text-text hover:bg-surface"
                                >
                                  View
                                </a>
                                <a
                                  href={`/post-property?edit=${property._id}`}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                                >
                                  Edit
                                </a>
                                <button
                                  type="button"
                                  onClick={() => toggleDeveloperProperty(property)}
                                  className={`inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-extrabold shadow-sm transition-colors ${property.isDeveloperListing ? 'bg-primary text-white hover:bg-rose-600' : 'border border-primary/30 bg-white text-primary hover:bg-primary/5'}`}
                                  title={property.isDeveloperListing ? 'Remove from Builder Spotlight' : 'Add to Builder Spotlight'}
                                >
                                  <Building2 size={13} />
                                  {property.isDeveloperListing ? 'Spotlight ON' : 'Spotlight OFF'}
                                </button>
                                {property.status !== 'sold' && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSold(property._id)}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                                  >
                                    Mark Sold
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProperty(property._id)}
                                  className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!paginatedBuilderProperties.length && (
                          <tr>
                            <td colSpan="6" className="px-4 py-12 text-center">
                              <p className="text-base font-extrabold text-text">No builder projects found</p>
                              <p className="mt-1 text-sm font-medium text-muted">Post your first builder project using the button above.</p>
                              <a
                                href="/post-property?type=builder"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-rose-600"
                              >
                                <Plus size={14} /> Post Builder Project
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    page={safeBuilderPage}
                    pageCount={builderPageCount}
                    pageSize={ADMIN_TABLE_PAGE_SIZE}
                    totalItems={builderProperties.length}
                    onPageChange={setBuilderPage}
                  />
                </div>
              </div>
            ) : activeTab === 'blogs' ? (
              <BlogManager
                canCreate
                showAuthor
                showFeatured
                title="Manage Blogs & Articles"
                description="Publish admin articles and manage premium associate partner posts for property SEO."
              />
            ) : activeTab === 'announcement' ? (
              <div className="grid gap-6">
                <form onSubmit={saveAnnouncement} className="grid gap-5 rounded-2xl border border-black/10 bg-surface p-5">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text">Site Announcement</h2>
                    <p className="mt-2 text-sm font-medium text-muted">Create a new announcement and track every previous message below.</p>
                  </div>
                  {announcementStatus && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{announcementStatus}</p>}
                  <div className="grid gap-4 lg:grid-cols-[0.45fr_1fr]">
                    <div>
                      <label className="mb-1 block text-sm font-bold text-text">Title</label>
                      <input
                        value={announcement.title || ''}
                        onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })}
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text outline-none focus:border-primary"
                        placeholder="Platform update"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-bold text-text">Message</label>
                      <textarea
                        value={announcement.message || ''}
                        onChange={(event) => setAnnouncement({ ...announcement, message: event.target.value })}
                        className="min-h-24 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text outline-none focus:border-primary"
                        placeholder="Write the announcement buyers should see..."
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm font-bold text-text">
                      <input
                        type="checkbox"
                        checked={Boolean(announcement.isActive)}
                        onChange={(event) => setAnnouncement({ ...announcement, isActive: event.target.checked })}
                        className="h-4 w-4 accent-primary"
                      />
                      Publish as active announcement
                    </label>
                    <button className="rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-rose-600">
                      Save New Announcement
                    </button>
                  </div>
                </form>

                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                  <div className="border-b border-black/10 px-4 py-3">
                    <h3 className="text-lg font-extrabold text-text">Announcement History</h3>
                    <p className="mt-1 text-sm font-medium text-muted">All announcements created by admin are shown here.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                      <thead className="bg-surface text-xs font-extrabold uppercase tracking-wide text-muted">
                        <tr>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Message</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Updated</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {announcementHistory.map((item) => (
                          <tr key={item._id} className="bg-white align-top transition-colors hover:bg-surface/70">
                            <td className="px-4 py-4 font-extrabold text-text">{item.title || 'Untitled'}</td>
                            <td className="max-w-md px-4 py-4 font-semibold leading-6 text-muted">{item.message}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-muted'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-semibold text-muted">{formatAdminDate(item.updatedAt)}</td>
                            <td className="px-4 py-4 text-right">
                              {item.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => removeAnnouncement(item._id)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-primary transition-colors hover:bg-rose-100"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-muted">No action</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {!announcementHistory.length && (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-sm font-bold text-muted">
                              No announcements created yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : activeTab === 'topCities' ? (
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text">Manage Top Cities</h2>
                    <p className="mt-2 text-sm font-medium text-muted">Configure the top city cards shown on the homepage.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {topCitiesStatus && <span className="text-sm font-bold text-primary">{topCitiesStatus}</span>}
                    <button onClick={saveTopCities} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-rose-600">Save Changes</button>
                    <button onClick={addTopCity} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-extrabold text-text shadow-sm transition-colors hover:bg-surface">
                      <Plus size={16} /> Add City
                    </button>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {topCities.map((city, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all hover:shadow-md">
                      <div className="group relative aspect-video bg-surface">
                        {city.image ? (
                          <img src={city.image} alt={city.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted"><Image size={32} /></div>
                        )}
                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                          <input type="file" accept="image/*" onChange={(e) => handleTopCityImage(index, e)} className="hidden" />
                          <div className="rounded-full bg-white/20 p-3 text-white backdrop-blur-md"><Upload size={20} /></div>
                        </label>
                      </div>
                      <div className="p-4 grid gap-3">
                        <input value={city.name} onChange={(e) => updateTopCity(index, 'name', e.target.value)} placeholder="City Name" className="w-full rounded-lg border-none bg-surface px-3 py-2 text-sm font-bold text-text outline-none focus:ring-2 focus:ring-primary/20" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={city.plots} onChange={(e) => updateTopCity(index, 'plots', e.target.value)} placeholder="Plot Count" className="w-full rounded-lg border-none bg-surface px-3 py-2 text-xs font-semibold text-text outline-none focus:ring-2 focus:ring-primary/20" />
                          <input value={city.price} onChange={(e) => updateTopCity(index, 'price', e.target.value)} placeholder="Starting Price" className="w-full rounded-lg border-none bg-surface px-3 py-2 text-xs font-semibold text-text outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <label className="flex items-center gap-2 text-xs font-bold text-text">
                            <input type="checkbox" checked={city.isActive} onChange={(e) => updateTopCity(index, 'isActive', e.target.checked)} className="h-3.5 w-3.5 accent-primary" /> Active
                          </label>
                          <button onClick={() => removeTopCity(index)} className="p-1.5 text-muted hover:text-primary transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {statCards.map(([Icon, label, value, color]) => (
                    <div key={label} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                      <div className={`flex items-center gap-2 ${color}`}><Icon size={18} /></div>
                      <p className="mt-4 text-3xl font-extrabold text-text">{value}</p>
                      <p className="text-sm font-semibold text-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white via-cyan-50/50 to-orange-50/60 p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-text">Admin analytics</h2>
                        <p className="mt-2 text-sm text-muted">A quick view of platform activity and admin workload.</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-white">
                        <Activity size={20} />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {analyticsData.map((item) => (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-xs font-extrabold uppercase tracking-wide text-muted">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full border border-black/10 bg-surface">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${Math.max((item.value / maxAnalyticsValue) * 100, item.value ? 8 : 0)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-[linear-gradient(135deg,#052f35,#0f766e)] p-6 text-white shadow-sm">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-white/70">Weekly pulse</p>
                    <h2 className="mt-2 text-2xl font-extrabold">Listings and leads</h2>
                    <svg viewBox="0 0 360 180" className="mt-6 h-auto w-full">
                      <polyline
                        points={`20,150 90,${150 - Math.min((stats?.postsThisWeek || 0) * 12, 110)} 160,${150 - Math.min((stats?.pendingProperties || 0) * 10, 110)} 230,${150 - Math.min((stats?.inquiries || 0) * 8, 110)} 330,${150 - Math.min((stats?.brokers || 0) * 16, 110)}`}
                        fill="none"
                        stroke="#ffffff"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="10"
                      />
                      <path d="M20 150H340" stroke="#ffffff" strokeOpacity=".18" strokeWidth="2" />
                      <path d="M20 90H340" stroke="#ffffff" strokeOpacity=".12" strokeWidth="2" />
                      {[20, 90, 160, 230, 330].map((x) => (
                        <circle key={x} cx={x} cy="150" r="5" fill="#f80e11" />
                      ))}
                    </svg>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                        <p className="text-2xl font-extrabold">{stats?.pendingProperties || 0}</p>
                        <p className="text-xs font-bold text-white/70">Pending properties</p>
                      </div>
                      <div className="rounded-xl border border-white/20 bg-white/10 p-3">
                        <p className="text-2xl font-extrabold">{stats?.inquiries || 0}</p>
                        <p className="text-xs font-bold text-white/70">Inquiries</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── EDIT REALTOR MODAL ─── */}
      {selectedRealtorToEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  {selectedRealtorToEdit.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Edit Realtor Profile: {selectedRealtorToEdit.name}</h3>
                  <p className="text-xs text-gray-400 font-medium">{selectedRealtorToEdit.email || selectedRealtorToEdit.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRealtorToEdit(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingRealtorForm.name}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingRealtorForm.email}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editingRealtorForm.phone}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Agency / Company Name</label>
                  <input
                    type="text"
                    value={editingRealtorForm.companyName}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editingRealtorForm.contactPhone}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, contactPhone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={editingRealtorForm.whatsappNumber}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, whatsappNumber: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">State</label>
                  <input
                    type="text"
                    value={editingRealtorForm.state}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, state: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">City</label>
                  <input
                    type="text"
                    value={editingRealtorForm.city}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, city: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Locality</label>
                  <input
                    type="text"
                    value={editingRealtorForm.locality}
                    onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, locality: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Display Metrics */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Card Display Metrics</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Experience Years</label>
                    <input
                      type="number"
                      value={editingRealtorForm.experienceYears}
                      onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, experienceYears: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Deals Closed (e.g. 250+)</label>
                    <input
                      type="text"
                      value={editingRealtorForm.closedDeals}
                      onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, closedDeals: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Total Sales (e.g. ₹150Cr+)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-extrabold text-emerald-400 pointer-events-none select-none">₹</span>
                      <input
                        type="text"
                        value={editingRealtorForm.totalSales?.replace(/^₹\s*/, '') || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/^₹\s*/, '');
                          setEditingRealtorForm({ ...editingRealtorForm, totalSales: val ? `₹${val}` : '₹' });
                        }}
                        placeholder="150Cr+"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-7 pr-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Areas Served (Comma separated)</label>
                <input
                  type="text"
                  value={editingRealtorForm.areasServed}
                  onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, areasServed: e.target.value })}
                  placeholder="e.g. Sector 14, Main Bypass"
                  className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={editingRealtorForm.photo}
                  onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">RERA ID</label>
                <input
                  type="text"
                  value={editingRealtorForm.reraId}
                  onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, reraId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={editingRealtorForm.bio}
                  onChange={(e) => setEditingRealtorForm({ ...editingRealtorForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-surface px-3.5 py-2 text-xs font-semibold text-text outline-none focus:border-primary resize-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedRealtorToEdit(null)}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingRealtor}
                onClick={handleSaveRealtorProfile}
                className="rounded-xl bg-primary px-6 py-2 text-xs font-extrabold text-white hover:bg-rose-600 shadow-md disabled:opacity-50"
              >
                {savingRealtor ? 'Saving...' : 'Save Realtor Profile'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
