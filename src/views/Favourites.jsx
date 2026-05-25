"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Heart, MapPin } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { adaptProperty } from '../utils/propertyAdapter';

const Favourites = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/favourites')
      .then((data) => setItems(data.favourites.map((item) => adaptProperty(item.property))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-32 pb-12">
      <div className="container mx-auto max-w-[1200px] px-6 lg:px-12">
        <h1 className="text-3xl font-extrabold text-text">Saved Properties</h1>
        <p className="mt-2 text-sm font-medium text-muted">Your favourite listings in one place.</p>
        {loading ? (
          <p className="mt-10 text-sm font-bold text-muted">Loading...</p>
        ) : items.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((property) => (
              <Link key={property.id} href={`/property/${property.id}`} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                <img src={property.image} alt={property.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-extrabold text-text">{property.title}</h3>
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-muted"><MapPin size={14} />{property.location}</p>
                  <p className="mt-4 text-xl font-extrabold text-primary">{property.price}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <Heart className="mx-auto text-primary" />
            <p className="mt-3 font-extrabold text-text">No favourites yet</p>
            <Link href="/listings" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse listings</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
