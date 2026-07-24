"use client";

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DropdownSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  disabled = false,
  icon: Icon,
  className = '',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const normalizedOptions = useMemo(() => (
    options.map((option) => (
      typeof option === 'string'
        ? { value: option, label: option }
        : option
    ))
  ), [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const term = search.toLowerCase().trim();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [normalizedOptions, search]);

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current && normalizedOptions.length > 5) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable, normalizedOptions.length]);

  return (
    <div className={`relative ${isOpen ? 'z-[90]' : 'z-10'} ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border bg-gray-50/80 px-4 py-3 text-left shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          isOpen ? 'border-primary shadow-md ring-2 ring-primary/20 bg-white' : 'border-gray-200 hover:border-gray-300'
        } disabled:cursor-not-allowed disabled:opacity-60`}
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {Icon && <Icon size={18} className="flex-shrink-0 text-primary" />}
          <span className={`truncate text-sm font-bold ${selectedOption || value ? 'text-text' : 'text-gray-400'}`}>
            {selectedOption?.label || value || placeholder}
          </span>
        </span>
        <ChevronDown size={18} className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          
          {/* Internal Search Bar (for > 5 options) */}
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/80">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full rounded-lg bg-white border border-gray-200 py-2 pl-8 pr-7 text-xs font-bold text-text outline-none focus:border-primary/50"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 text-gray-400 hover:text-text p-1"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 hero-dropdown-scroll">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? 'bg-rose-50 text-primary border border-rose-100/80 shadow-xs'
                        : 'text-text hover:bg-rose-50/40 hover:text-primary active:bg-rose-100/50'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check size={16} className="flex-shrink-0 ml-2 text-primary stroke-[2.5]" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs font-bold text-gray-400">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
