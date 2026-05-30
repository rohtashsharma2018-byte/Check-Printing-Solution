export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const stripRupeesPrefix = (wordsStr: string): string => {
  if (!wordsStr) return '';
  const titleCased = toTitleCase(wordsStr);
  return titleCased.replace(/^Rupees\s+/i, '');
};

export const amountToWords = (amount: number): string => {
  if (amount === 0) return 'Rupees Zero Only';

  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const getSmallWords = (n: number): string => {
    if (n < 20) return units[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return tens[t] + (u !== 0 ? ' ' + units[u] : '');
  };

  const convertIndian = (n: number): string => {
    let words = '';
    if (n >= 10000000) {
      words += convertIndian(Math.floor(n / 10000000)) + ' crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      words += convertIndian(Math.floor(n / 100000)) + ' lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      words += convertIndian(Math.floor(n / 1000)) + ' thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      words += convertIndian(Math.floor(n / 100)) + ' hundred ';
      n %= 100;
    }
    if (n > 0) {
      words += getSmallWords(n);
    }
    return words.trim();
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  const integerWords = convertIndian(integerPart);
  
  let result = '';
  if (decimalPart > 0) {
    const decimalWords = convertIndian(decimalPart);
    result = `rupees ${integerWords} and ${decimalWords} paise only`;
  } else {
    result = `rupees ${integerWords} only`;
  }
  
  return toTitleCase(result);
};

export const formatChequeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Try YYYY-MM-DD
  const ymdMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [_, year, month, day] = ymdMatch;
    return `${day[0]} ${day[1]} ${month[0]} ${month[1]} ${year[0]} ${year[1]} ${year[2]} ${year[3]}`;
  }
  
  // Try MM/DD/YYYY
  const mdyMatch1 = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch1) {
    const [_, month, day, year] = mdyMatch1;
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${d[0]} ${d[1]} ${m[0]} ${m[1]} ${year[0]} ${year[1]} ${year[2]} ${year[3]}`;
  }

  // Try DD.MM.YYYY or DD-MM-YYYY
  const dmyMatch = dateStr.trim().match(/^(\d{1,2})[.-](\d{1,2})[.-](\d{4})$/);
  if (dmyMatch) {
    const [_, day, month, year] = dmyMatch;
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${d[0]} ${d[1]} ${m[0]} ${m[1]} ${year[0]} ${year[1]} ${year[2]} ${year[3]}`;
  }

  // Fallback to JS Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    let month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    let day = String(parsed.getUTCDate()).padStart(2, '0');
    let year = String(parsed.getUTCFullYear());
    if (!dateStr.includes('T') && !dateStr.includes('Z')) {
      month = String(parsed.getMonth() + 1).padStart(2, '0');
      day = String(parsed.getDate()).padStart(2, '0');
      year = String(parsed.getFullYear());
    }
    return `${day[0]} ${day[1]} ${month[0]} ${month[1]} ${year[0]} ${year[1]} ${year[2]} ${year[3]}`;
  }

  return dateStr;
};

export const ensureIsoDate = (dateStr: string): string => {
  if (!dateStr) return '';

  // Try YYYY-MM-DD
  const ymdMatch = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return dateStr.trim();
  }

  // Try MM/DD/YYYY
  const mdyMatch1 = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch1) {
    const [_, month, day, year] = mdyMatch1;
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Try DD.MM.YYYY, DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = dateStr.trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (dmyMatch) {
    const [_, day, month, year] = dmyMatch;
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Fallback to JS Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    let month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    let day = String(parsed.getUTCDate()).padStart(2, '0');
    let year = String(parsed.getUTCFullYear());
    if (!dateStr.includes('T') && !dateStr.includes('Z')) {
      month = String(parsed.getMonth() + 1).padStart(2, '0');
      day = String(parsed.getDate()).padStart(2, '0');
      year = String(parsed.getFullYear());
    }
    return `${year}-${month}-${day}`;
  }

  return '';
};

export const formatTableDate = (dateStr: string): string => {
  const iso = ensureIsoDate(dateStr);
  if (!iso) return dateStr;
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};
