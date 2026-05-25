"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Clock, MapPin } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { adaptProperty } from '../utils/propertyAdapter';

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocalHistory = () => {
      try {
        return JSON.parse(localStorage.getItem('viewHistory') || '[]')
          .map((item) => ({
            property: adaptProperty(item.property),
            viewedAt: item.viewedAt
          }))
          .filter((item) => item.property);
      } catch {
        return [];
      }
    };

    apiRequest('/history')
      .then((data) => {
        const apiHistory = data.history
          .map((item) => ({
            property: adaptProperty(item.property),
            viewedAt: item.viewedAt
          }))
          .filter((item) => item.property);
        const mergedHistory = [...apiHistory, ...getLocalHistory()];
        const uniqueHistory = Array.from(
          new Map(mergedHistory.map((item) => [String(item.property.id), item])).values()
        );

        setItems(uniqueHistory);
      })
      .catch(() => setItems(getLocalHistory()))
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    localStorage.removeItem('viewHistory');
    try {
      await apiRequest('/history', { method: 'DELETE' });
    } catch {
      // Local history is still cleared when the API is unavailable.
    }
    setItems([]);
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-12">
      <div className="container mx-auto max-w-[1200px] px-6 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text">Previously Viewed</h1>
            <p className="mt-2 text-sm font-medium text-muted">Properties you recently opened.</p>
          </div>
          {items.length > 0 && <button onClick={clearHistory} className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-text">Clear</button>}
        </div>
        {loading ? (
          <p className="mt-10 text-sm font-bold text-muted">Loading...</p>
        ) : items.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ property, viewedAt }) => (
              <Link key={property.id} href={`/property/${property.id}`} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <img src={property.image} alt={property.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-extrabold text-text">{property.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-muted"><MapPin size={14} />{property.location}</p>
                  {viewedAt && <p className="mt-2 text-xs font-bold text-muted">Viewed {new Date(viewedAt).toLocaleDateString()}</p>}
                  <p className="mt-4 text-xl font-extrabold text-primary">{property.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <Clock className="mx-auto text-primary" />
            <p className="mt-3 font-extrabold text-text">No viewed properties yet</p>
            <Link href="/listings" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Start exploring</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
