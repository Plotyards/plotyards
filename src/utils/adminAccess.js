const ADMIN_ENTRY_KEY = 'plotyards_admin_entry';

export const ADMIN_SEARCH_PHRASE = 'plotadmin';

export const isAdminSearchQuery = (value = '') => value.trim().toLowerCase() === ADMIN_SEARCH_PHRASE;

export const grantAdminEntry = () => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(ADMIN_ENTRY_KEY, 'search');
  }
};

export const revokeAdminEntry = () => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(ADMIN_ENTRY_KEY);
  }
};

export const hasAdminEntry = () => (
  typeof window !== 'undefined' && window.sessionStorage.getItem(ADMIN_ENTRY_KEY) === 'search'
);

export const openAdminEntry = (navigate) => {
  grantAdminEntry();
  navigate.push('/plotadmin');
};
