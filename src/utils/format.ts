import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const formatDateTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch {
    return '';
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const getDateRange = (days: number) => {
  const end = endOfDay(new Date());
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - days);
  return { start, end };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};