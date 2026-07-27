export const cleanIndianPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, ''); // keep numbers only
  // Fix double 91 prefix (e.g. 91919876543210)
  while (cleaned.startsWith('9191') && cleaned.length >= 14) {
    cleaned = cleaned.slice(2);
  }
  // Standard 12-digit number starting with 91 (e.g. 919876543210)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  // 11-digit starting with 0 (e.g. 09876543210)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `91${cleaned.slice(1)}`;
  }
  // Standard 10-digit number (e.g. 9876543210)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
};

export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  let num = String(phone).replace(/\D/g, '');
  while (num.startsWith('9191') && num.length >= 14) {
    num = num.slice(2);
  }
  if (num.length === 12 && num.startsWith('91')) {
    const mobile = num.slice(2);
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  }
  if (num.length === 10) {
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  if (String(phone).trim().startsWith('+')) return String(phone).trim();
  return phone;
};

export const formatPhoneForLink = (phone) => {
  return cleanIndianPhoneNumber(phone);
};
