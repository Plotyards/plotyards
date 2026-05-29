"use client";

import { useState, useMemo } from 'react';
import { Search, Home, Users, ShieldCheck, Mail, ChevronDown, MessageSquare } from 'lucide-react';

const FAQ_DATA = [
  {
    category: 'buying',
    question: 'How do I search for plots on Plotyards?',
    answer: 'Simply use our main search bar on the homepage or listings page! You can search by city name (like "Shadnagar" or "Devanahalli"), project name, or locality. Use the sidebar filters to narrow down by price range, property type (Plot, Commercial, Farm Land), and size.'
  },
  {
    category: 'buying',
    question: 'Are all listed properties RERA-approved?',
    answer: 'We encourage associate partners to specify RERA status and upload verified documents. Look for the "RERA Approved" badge on listings. However, we strongly recommend conducting independent legal verification before completing any land purchase.'
  },
  {
    category: 'buying',
    question: 'Is it free to browse and contact associate partners?',
    answer: 'Yes! Browsing listings and contacting associate partners is completely free for buyers. To protect our associate partners and prevent spam, we require buyers to register and login before viewing an associate partner\'s direct phone number or sending an inquiry.'
  },
  {
    category: 'broker',
    question: 'How can I register as an associate partner on Plotyards?',
    answer: 'Go to the Dashboard page from your account menu. Click the "Become an Associate Partner" button to upgrade instantly. You will be redirected to choose the Premium Plan, which grants instant, automatic associate partner activation upon subscribing. No manual admin approval or waiting queue is required!'
  },
  {
    category: 'broker',
    question: 'How do I post a new property listing?',
    answer: 'Once your Premium Associate Partner plan is active, you will see a "Post Property" button in the top navigation or in the listings tab of your Dashboard. Fill in the details, specify verified documents, select amenities, and upload up to 4 images.'
  },
  {
    category: 'broker',
    question: 'How do I edit or delete an existing listing?',
    answer: 'Navigate to your Dashboard and select the "My Listings" tab. You will find "Edit", "Mark Sold Out", and "Delete" buttons next to each of your properties. Click "Edit" to load the property details, modify any text, checkboxes, or images, and click update.'
  },
  {
    category: 'trust',
    question: 'Is my personal and account data secure?',
    answer: 'Absolutely. We use industry-standard encryption protocols and secure database architecture to protect your credentials, saved favourites, and viewing histories. We never sell your personal information to third parties.'
  },
  {
    category: 'trust',
    question: 'What are verified document checklists?',
    answer: 'When associate partners post a listing, they can check verify signals like "RERA approval copy", "Clear title verification", "Layout and plot demarcation", and "Ready registration support". These signals help buyers understand the level of compliance for the property.'
  },
  {
    category: 'trust',
    question: 'How do I report a misleading or fraudulent listing?',
    answer: 'If you encounter any misleading pricing, incorrect locations, or suspicious listings, please contact our support team immediately at info@plotyards.com. We review all buyer reports seriously and will suspend violating accounts.'
  }
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(null);


  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16 font-sans">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text tracking-tight mb-4">
            How can we <span className="text-primary bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">help you</span> today?
          </h1>
          <p className="text-muted font-medium text-base md:text-lg max-w-xl mx-auto mb-8">
            Search our knowledge base or contact our support team to answer your plot queries.
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs, verification steps, associate partner rules..."
              className="w-full bg-white border border-black/10 rounded-[1.75rem] pl-14 pr-6 py-4.5 text-text shadow-xl shadow-gray-200/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-base font-medium transition-all"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-12">
          {[
            { id: 'all', label: 'All Topics', icon: MessageSquare, color: 'bg-primary/10 text-primary' },
            { id: 'buying', label: 'Buying & Investing', icon: Home, color: 'bg-emerald-50 text-emerald-700' },
            { id: 'broker', label: 'Associate Partner Support', icon: Users, color: 'bg-blue-50 text-blue-700' },
            { id: 'trust', label: 'Trust & Safety', icon: ShieldCheck, color: 'bg-amber-50 text-amber-700' }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedIndex(null);
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-text'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : cat.color}`}>
                  <Icon size={18} />
                </div>
                <span className="font-bold text-sm text-left">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          
          {/* FAQ Accordion List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-text mb-2">Frequently Asked Questions</h2>
            
            {filteredFaqs.length ? filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <span className="font-bold text-text text-base md:text-lg pr-4">{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-72 border-t border-gray-100' : 'max-h-0'
                    } overflow-hidden`}
                  >
                    <p className="p-6 text-muted text-sm md:text-base leading-7 font-medium bg-surface/30">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <Search size={32} className="mx-auto text-primary mb-4" />
                <p className="font-bold text-text text-lg">No matches found</p>
                <p className="text-muted text-sm mt-1 max-w-sm mx-auto">
                  Try typing general keywords like "RERA", "listings", or "security" to find solutions.
                </p>
              </div>
            )}
          </div>

          {/* Quick Support Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-text mb-2">Direct Contact</h2>

            {/* Support Email Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-white mb-4 shadow-lg shadow-secondary/10">
                <Mail size={20} />
              </div>
              <h3 className="font-extrabold text-text text-lg mb-2">Email Support</h3>
              <p className="text-muted text-sm font-medium leading-6 mb-5">
                Have a specialized request? Reach our helpdesk directly and we will respond within 24 hours.
              </p>
              <a
                href="mailto:info@plotyards.com"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:border-primary hover:text-primary text-text font-bold text-sm transition-colors"
              >
                info@plotyards.com
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
