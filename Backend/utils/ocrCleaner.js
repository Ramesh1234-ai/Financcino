/**
 * OCR Data Cleaning & Normalization Utilities
 * Converts raw OCR output into clean, structured data
 */

/**
 * Extract and clean amount from text
 * Handles: ₹250, $25.99, 250.50, 2,500, etc.
 */
export function cleanAmount(text) {
  if (!text) return null;

  const textStr = String(text).trim();
  if (!textStr) return null;

  try {
    // Remove currency symbols and whitespace
    let cleaned = textStr
      .replace(/[₹$€£¥]/g, '') // Remove currency symbols
      .replace(/[^\d.]/g, '') // Keep only digits and dots
      .trim();

    if (!cleaned) return null;

    // Handle multiple dots (take precision version)
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount > 1) {
      // If multiple dots, assume last one is decimal point
      const parts = cleaned.split('.');
      cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }

    const amount = parseFloat(cleaned);

    // Validate amount is reasonable
    if (isNaN(amount) || amount <= 0 || amount > 999999) {
      console.warn('⚠️  [cleanAmount] Invalid amount:', textStr, '→', amount);
      return null;
    }

    console.log('✅ [cleanAmount] Cleaned:', textStr, '→', amount);
    return amount;
  } catch (err) {
    console.error('❌ [cleanAmount] Error:', err.message);
    return null;
  }
}

/**
 * Extract merchant name from text
 * Removes symbols, noise, and normalizes
 */
export function cleanMerchant(text) {
  if (!text) return null;

  const textStr = String(text).trim();
  if (!textStr) return null;

  try {
    // Remove special characters but keep spaces and hyphens
    let cleaned = textStr
      .replace(/[^\w\s\-]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Remove pure numbers or very short strings
    if (!cleaned || cleaned.length < 2) {
      return null;
    }

    // If too long, take first meaningful part
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 100).trim();
    }

    console.log('✅ [cleanMerchant] Cleaned:', textStr, '→', cleaned);
    return cleaned;
  } catch (err) {
    console.error('❌ [cleanMerchant] Error:', err.message);
    return null;
  }
}

/**
 * Extract and normalize date
 * Handles: 28/03/2026, 03-28-2026, 2026-03-28, Mar 28 2026, etc.
 */
export function cleanDate(text) {
  if (!text) return null;

  const textStr = String(text).trim();
  if (!textStr) return null;

  try {
    // Try multiple date formats
    const datePatterns = [
      // DD/MM/YYYY or DD-MM-YYYY
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
      // YYYY-MM-DD (ISO)
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      // DD MM YYYY or similar
      /(\d{1,2})\s+(\d{1,2})\s+(\d{4})/,
    ];

    let day, month, year;

    for (const pattern of datePatterns) {
      const match = textStr.match(pattern);
      if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        const num3 = parseInt(match[3]);

        // Determine which is day/month/year
        if (pattern.source.includes('\\d{4}')) {
          // YYYY-MM-DD format
          year = num1;
          month = num2;
          day = num3;
        } else {
          // DD/MM/YYYY format
          day = num1;
          month = num2;
          year = num3;
        }

        // Validate
        if (day > 31 || month > 12 || month < 1 || day < 1) {
          continue; // Try next pattern
        }
        // Handle 2-digit year
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }

        break;
      }
    }

    if (!day || !month || !year) {
      console.warn('⚠️  [cleanDate] Could not parse date:', textStr);
      return null;
    }

    // Format as YYYY-MM-DD
    const dateObj = new Date(year, month - 1, day);
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    const formatted = dateObj.toISOString().split('T')[0];
    console.log('✅ [cleanDate] Cleaned:', textStr, '→', formatted);
    return formatted;
  } catch (err) {
    console.error('❌ [cleanDate] Error:', err.message);
    return null;
  }
}

/**
 * Normalize and validate category
 */
export function cleanCategory(category) {
  if (!category) return 'Other';

  const categoryStr = String(category).trim().toLowerCase();

  // Valid categories from backend
  const validCategories = [
    'Food',
    'Transport',
    'Shopping',
    'Entertainment',
    'Utilities',
    'Health',
    'Education',
    'Other'
  ];

  // Try exact match first
  const exact = validCategories.find(c => c.toLowerCase() === categoryStr);
  if (exact) return exact;
  // Try keyword matching
  const keywords = {
    'Food': ['food', 'restaurant', 'cafe', 'pizza', 'burger', 'grocery', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'snack'],
    'Transport': ['transport', 'taxi', 'uber', 'car', 'bus', 'train', 'flight', 'parking', 'fuel', 'gas', 'metro', 'auto'],
    'Shopping': ['shopping', 'store', 'mall', 'shop', 'amazon', 'clothes', 'purchase', 'retail', 'market', 'supermarket'],
    'Entertainment': ['entertainment', 'movie', 'cinema', 'theatre', 'game', 'music', 'concert', 'show', 'streaming', 'netflix'],
    'Utilities': ['utilities', 'electric', 'water', 'gas', 'internet', 'phone', 'bill', 'utility', 'subscription'],
    'Health': ['health', 'doctor', 'hospital', 'medical', 'medicine', 'pharmacy', 'gym', 'fitness', 'clinic'],
    'Education': ['education', 'school', 'college', 'course', 'book', 'tuition', 'training', 'learning']
  };
  for (const [cat, keywords_list] of Object.entries(keywords)) {
    if (keywords_list.some(kw => categoryStr.includes(kw))) {
      console.log('✅ [cleanCategory] Mapped:', categoryStr, '→', cat);
      return cat;
    }
  }

  console.warn('⚠️  [cleanCategory] Unknown category:', categoryStr, '→ defaulting to Other');
  return 'Other';
}

/**
 * Main OCR data cleaner
 * Takes raw Gemini output and cleans it
 */
export function cleanOCRData(rawData) {
  const cleaned = {
    amount: cleanAmount(rawData?.amount || rawData?.total),
    merchant: cleanMerchant(rawData?.merchant || rawData?.title),
    category: cleanCategory(rawData?.category),
    date: cleanDate(rawData?.date) || new Date().toISOString().split('T')[0],
    currency: String(rawData?.currency || 'INR').toUpperCase(),
    items: Array.isArray(rawData?.items) ? rawData.items : [],
    confidence: rawData?.confidence || 'medium'
  };
  // Validate that we have at least amount and merchant
  if (!cleaned.amount) {
    console.warn('⚠️  [cleanOCRData] Missing amount, using fallback');
    cleaned.amount = 0;
  }
  if (!cleaned.merchant) {
    console.warn('⚠️  [cleanOCRData] Missing merchant, fallback required');
    cleaned.merchant = 'Unknown Merchant';
  }
  console.log('✅ [cleanOCRData] Final cleaned data:', cleaned);
  return cleaned;
}
/**
 * Safely parse JSON from text
 * Handles markdown code blocks and extra text
 */
export function safeParseJSON(text) {
  if (!text) return null;

  let jsonStr = String(text).trim();

  try {
    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    // Try to extract JSON object from text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);
    console.log('✅ [safeParseJSON] Successfully parsed JSON');
    return parsed;
  } catch (err) {
    console.error('❌ [safeParseJSON] Failed to parse JSON:', err.message);
    console.error('Raw text:', jsonStr.substring(0, 200));
    return null;
  }
}

export default {
  cleanAmount,
  cleanMerchant,
  cleanDate,
  cleanCategory,
  cleanOCRData,
  safeParseJSON
};
