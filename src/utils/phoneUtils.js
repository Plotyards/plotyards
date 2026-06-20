export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const num = String(phone).replace(/\D/g, '');
  if (num.length === 10) return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  if (num.length === 12 && num.startsWith('91')) return `+${num.slice(0, 2)} ${num.slice(2, 7)} ${num.slice(7)}`;
  // If it starts with a plus but is different
  if (String(phone).trim().startsWith('+')) return String(phone).trim();
  if (num.length > 0) return `+${num}`;
  return phone;
};

export const formatPhoneForLink = (phone) => {
  if (!phone) return '';
  const num = String(phone).replace(/\D/g, '');
  if (num.length === 10) return `91${num}`;
  if (num.length === 11 && num.startsWith('0')) return `91${num.slice(1)}`;
  return num;
};
