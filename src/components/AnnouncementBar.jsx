"use client";

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { apiRequest } from '../lib/api';

const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState(null);
  const dismissedKey = announcement?._id ? `announcement-dismissed-${announcement._id}` : '';

  useEffect(() => {
    const loadAnnouncement = () => {
      apiRequest('/announcements/active')
        .then((data) => {
          const nextAnnouncement = data.announcement;
          if (nextAnnouncement?._id && localStorage.getItem(`announcement-dismissed-${nextAnnouncement._id}`)) {
            setAnnouncement(null);
            return;
          }
          setAnnouncement(nextAnnouncement);
        })
        .catch(() => setAnnouncement(null));
    };

    loadAnnouncement();
    window.addEventListener('focus', loadAnnouncement);
    window.addEventListener('announcement-updated', loadAnnouncement);

    return () => {
      window.removeEventListener('focus', loadAnnouncement);
      window.removeEventListener('announcement-updated', loadAnnouncement);
    };
  }, []);

  if (!announcement?.message) {
    return null;
  }

  const closeAnnouncement = () => {
    if (dismissedKey) {
      localStorage.setItem(dismissedKey, 'true');
    }
    setAnnouncement(null);
  };

  return (
    <div className="pointer-events-none fixed right-4 top-28 z-40 w-[calc(100%-2rem)] max-w-sm lg:right-10 lg:top-32">
      <div className="pointer-events-auto relative flex items-start gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-4 pr-11 text-primary shadow-2xl shadow-secondary/15 backdrop-blur-xl">
        <Megaphone size={18} className="mt-0.5 flex-shrink-0" />
        <div>
          {announcement.title && <p className="text-sm font-extrabold text-text">{announcement.title}</p>}
          <p className="text-sm font-semibold leading-6">{announcement.message}</p>
        </div>
        <button
          type="button"
          onClick={closeAnnouncement}
          className="absolute right-3 top-3 rounded-full p-1 text-muted transition-colors hover:bg-surface hover:text-primary"
          aria-label="Close announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
