"use client";

import { useEffect } from 'react';
import { apiRequest } from '../lib/api';

const VISITOR_ID_KEY = 'plotyards_visitor_id';

const getVisitorId = () => {
  const existingId = localStorage.getItem(VISITOR_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(VISITOR_ID_KEY, newId);
  return newId;
};

const TrafficHeartbeat = () => {
  useEffect(() => {
    const visitorId = getVisitorId();

    const sendHeartbeat = () => {
      if (document.visibilityState === 'hidden') return;
      apiRequest('/site/traffic/heartbeat', {
        method: 'POST',
        body: { visitorId }
      }).catch(() => {});
    };

    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, 30000);
    document.addEventListener('visibilitychange', sendHeartbeat);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', sendHeartbeat);
    };
  }, []);

  return null;
};

export default TrafficHeartbeat;
