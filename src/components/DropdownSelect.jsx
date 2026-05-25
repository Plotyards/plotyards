"use client";

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DropdownSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  disabled = false,
  icon: Icon,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = useMemo(() => (
    options.map((option) => (
      typeof option === 'string'
        ? { value: option, label: option }
        : option
    ))
  ), [options]);

  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-left shadow-sm backdrop-blur-xl transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon size={17} className="flex-shrink-0 text-primary" />}
          <span className={`truncate text-sm font-bold ${selectedOption || value ? 'text-text' : 'text-muted'}`}>
            {selectedOption?.label || value || placeholder}
          </span>
        </span>
        <ChevronDown size={18} className={`flex-shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="hero-dropdown-scroll absolute left-0 right-0 top-full z-[70] mt-3 max-h-72 overflow-y-auto rounded-[1.35rem] border border-black/10 bg-white/95 p-2 shadow-2xl shadow-secondary/20 ring-1 ring-black/5 backdrop-blur-2xl">
          {normalizedOptions.length ? normalizedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                value === option.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text hover:bg-surface'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={15} />}
            </button>
          )) : (
            <p className="px-3 py-2.5 text-sm font-semibold text-muted">No options available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
