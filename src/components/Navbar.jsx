"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Menu, User, Search, X } from 'lucide-react';
import { useAuth } from '../context/auth';
import { isAdminSearchQuery, openAdminEntry } from '../utils/adminAccess';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const navigate = useRouter();
  const { user, isBroker, isAdmin, logout } = useAuth();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const isHomePage = pathname === '/';
  const hideSearchRoutes = ['/dashboard', '/admin'];
  const showNavSearch = isScrolled && !hideSearchRoutes.some((route) => pathname.startsWith(route));
  const showSolidNav = !isHomePage || isScrolled;
  const canPostProperty = isAdmin || (isBroker && user?.brokerStatus === 'approved');
  const roleLabel = user?.role === 'user' ? 'buyer' : user?.role === 'broker' ? 'associate partner' : user?.role;

  const whatsappNumber = '918287697756';
  const assistanceLinks = [
    {
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi i want to talk about Legal assistance')}`,
      label: 'Legal Assistance'
    },
    {
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi i want to talk about Loan assistance')}`,
      label: 'Loan Assistance'
    }
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const submitSearch = () => {
    if (isAdminSearchQuery(searchQuery)) {
      openAdminEntry(navigate);
      setSearchQuery('');
      return;
    }

    const searchParams = new URLSearchParams();

    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim());
    }

    navigate.push(`/listings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const closeId = window.setTimeout(() => setIsMenuOpen(false), 0);

    return () => window.clearTimeout(closeId);
  }, [pathname, searchParams]);

  if (pathname === '/subscribe') return null;

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        showSolidNav ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      } max-md:hidden`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 z-50">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-secondary">
            <img src="/logo.PNG" alt="logo" height={40} width={40} className='rounded-full' />
          </div>
          <span className={`text-2xl font-extrabold tracking-tight ${showSolidNav ? 'text-text' : 'text-white'}`}>
            Plotyards<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Center Section: Menu or Search Bar */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-8 transition-all duration-300">
          {showNavSearch && (
            <div className="flex items-center bg-surface rounded-full pl-4 pr-1 py-1 w-full max-w-lg border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-300">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    submitSearch();
                  }
                }}
                placeholder="Search &quot;Shadnagar&quot;, &quot;Devanahalli&quot;, Or Any Locality" 
                className="bg-transparent border-none outline-none text-sm w-full text-text placeholder-gray-500 font-medium"
              />
              <button
                onClick={submitSearch}
                className="bg-primary text-white p-2 rounded-full hover:bg-rose-600 transition-colors flex-shrink-0 ml-2"
              >
                <Search size={18} />
              </button>
            </div>
          )}
        </div>
        {/* Right Section */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Post Property */}
          <button 
            onClick={() => {
              if (!user) {
                navigate.push('/login?from=/post-property');
                return;
              }

              if (canPostProperty) {
                navigate.push('/post-property');
              } else if (isBroker) {
                alert('Associate Partner approval is required before posting properties.');
                navigate.push('/dashboard?tab=subscription');
              } else {
                alert('Only Associate Partners can post properties. Please upgrade your account.');
                navigate.push('/dashboard?tab=subscription');
              }
            }}
            className="relative overflow-hidden hidden sm:flex items-center bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg transition-all"
          >
            <div className="absolute top-0 -left-[100%] w-12 h-full bg-white/30 skew-x-[45deg] animate-shine"></div>
            <span className="relative z-10">Post Property</span>
          </button>

          {/* Buyer Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                showSolidNav 
                  ? 'border-border bg-white hover:shadow-md' 
                  : 'border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${showSolidNav ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-500'}`}>
                <User size={16} fill="currentColor" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="hero-dropdown-scroll absolute right-0 z-50 mt-3 max-h-[75vh] w-64 overflow-y-auto rounded-[1.35rem] border border-black/10 bg-white/95 shadow-2xl shadow-secondary/20 ring-1 ring-black/5 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        <p className="text-sm font-bold text-text">{user.name}</p>
                        <p className="text-xs font-semibold text-muted capitalize">{roleLabel}</p>
                        <button
                          onClick={() => {
                            logout();
                            closeMenu();
                            navigate.push('/');
                          }}
                          className="w-full text-center bg-primary text-white py-2 rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link onClick={closeMenu} href="/login" className="w-full text-center bg-primary text-white py-2 rounded-xl font-semibold hover:bg-rose-600 transition-colors">
                          Partner Login
                        </Link>
                        <Link onClick={closeMenu} href="/register" className="w-full text-center bg-gray-50 text-text py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                          Partner Signup
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-2">
                  {user && (
                    <Link onClick={closeMenu} href="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <Link onClick={closeMenu} href="/favourites" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                    Favourites
                  </Link>
                  <Link onClick={closeMenu} href="/history" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                    Previously Viewed
                  </Link>
                </div>
                
                <div className="p-2 border-t border-gray-100">
                  <Link onClick={closeMenu} href="/help-center" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                    Help Center
                  </Link>
                  {assistanceLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={closeMenu}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
