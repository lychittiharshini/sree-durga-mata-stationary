import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { db } from '../config/db.ts';

// Helper to validate and sanitize an international phone number for WhatsApp
export function sanitizeWhatsAppNumber(rawInput: string): { valid: boolean; sanitized: string; error?: string } {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, sanitized: '', error: 'WhatsApp number is required.' };
  }

  // Remove any spaces, hyphens, brackets, or leading '+'
  let cleaned = rawInput.replace(/[\s\-\(\)\+]/g, '');

  // Check if it consists only of digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, sanitized: '', error: 'WhatsApp number must contain only numerical digits.' };
  }

  // If 10 digits (typical Indian mobile number without country code), prepend standard 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  // International phone numbers with country code must be between 10 and 15 digits
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, sanitized: '', error: 'Please enter a valid phone number with country code (10 to 15 digits).' };
  }

  return { valid: true, sanitized: cleaned };
}

export interface XeroxRates {
  bw_single: number | null;
  bw_double: number | null;
  color_single: number | null;
  color_double: number | null;
}

export async function fetchCurrentXeroxRates(): Promise<{ rates: XeroxRates; showPrices: boolean }> {
  const showPricesStr = await db.getSetting('show_xerox_prices');
  // Default is false (hidden from customers by default) per requirement
  const showPrices = showPricesStr === 'true';

  const parseRate = (val: string | null, fallback: number | null): number | null => {
    if (val === null || val === undefined) return fallback;
    if (val.trim() === '') return null;
    const num = Number(val);
    if (isNaN(num) || num <= 0) return null;
    return num;
  };

  const bwSingleStr = await db.getSetting('xerox_bw_single');
  const bwDoubleStr = await db.getSetting('xerox_bw_double');
  const colorSingleStr = await db.getSetting('xerox_color_single');
  const colorDoubleStr = await db.getSetting('xerox_color_double');

  const rates: XeroxRates = {
    bw_single: parseRate(bwSingleStr, 5),
    bw_double: parseRate(bwDoubleStr, 6),
    color_single: parseRate(colorSingleStr, 10),
    color_double: parseRate(colorDoubleStr, 20),
  };

  return { rates, showPrices };
}

// GET /api/settings/public
export async function getPublicSettings(_req: any, res: Response) {
  try {
    const whatsapp = await db.getSetting('whatsapp_number');
    const shopName = (await db.getSetting('shop_name')) || 'Sri Durga Mata Stationery Book Stall and Fancy Items';
    const shopSubtitle = (await db.getSetting('shop_subtitle')) || 'BOOK STALL & FANCY ITEMS';
    const shopAddress = (await db.getSetting('shop_address')) || 'H. No. 69, Ilapur Rd, Durgamata Colony, Tanda, Hyderabad, Telangana 502032, India';
    const { rates, showPrices } = await fetchCurrentXeroxRates();

    return res.json({
      whatsappNumber: whatsapp || '',
      isConfigured: Boolean(whatsapp && whatsapp.trim().length > 0),
      shopName,
      shopSubtitle,
      shopAddress,
      showXeroxPrices: showPrices,
      xeroxRates: rates
    });
  } catch (err: any) {
    console.error('Error in getPublicSettings:', err);
    return res.status(500).json({ error: 'Failed to load shop settings.' });
  }
}

// GET /api/settings/xerox-rates (Public / Customer)
export async function getXeroxRates(_req: any, res: Response) {
  try {
    const { rates, showPrices } = await fetchCurrentXeroxRates();
    return res.json({ success: true, rates, showPrices });
  } catch (err: any) {
    console.error('Error in getXeroxRates:', err);
    return res.status(500).json({ error: 'Failed to load Xerox rates.' });
  }
}

// PUT /api/settings/whatsapp (ADMIN ONLY)
export async function updateWhatsAppNumber(req: AuthenticatedRequest, res: Response) {
  try {
    const { whatsappNumber } = req.body;

    const validation = sanitizeWhatsAppNumber(whatsappNumber);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    await db.setSetting('whatsapp_number', validation.sanitized);

    return res.json({
      success: true,
      message: 'WhatsApp number updated successfully.',
      whatsappNumber: validation.sanitized
    });
  } catch (err: any) {
    console.error('Error in updateWhatsAppNumber:', err);
    return res.status(500).json({ error: 'Server error while updating WhatsApp number.' });
  }
}

// PUT /api/settings/xerox-rates (ADMIN ONLY: Updates rates & optional visibility toggle)
export async function updateXeroxRates(req: AuthenticatedRequest, res: Response) {
  try {
    const { bw_single, bw_double, color_single, color_double, show_xerox_prices } = req.body;

    if (show_xerox_prices !== undefined) {
      await db.setSetting('show_xerox_prices', String(Boolean(show_xerox_prices)));
    }

    const sanitizeRateInput = async (key: string, val: any) => {
      if (val === undefined) return;
      if (val === null || val === '') {
        await db.setSetting(key, '');
        return;
      }
      const num = Number(val);
      if (!isNaN(num) && num > 0) {
        await db.setSetting(key, String(num));
      } else {
        await db.setSetting(key, '');
      }
    };

    if (bw_single !== undefined) await sanitizeRateInput('xerox_bw_single', bw_single);
    if (bw_double !== undefined) await sanitizeRateInput('xerox_bw_double', bw_double);
    if (color_single !== undefined) await sanitizeRateInput('xerox_color_single', color_single);
    if (color_double !== undefined) await sanitizeRateInput('xerox_color_double', color_double);

    const { rates, showPrices } = await fetchCurrentXeroxRates();

    return res.json({
      success: true,
      message: 'Xerox pricing settings updated successfully.',
      rates,
      showPrices
    });
  } catch (err: any) {
    console.error('Error in updateXeroxRates:', err);
    return res.status(500).json({ error: 'Server error while updating Xerox rates.' });
  }
}

// PUT /api/settings/xerox-visibility (ADMIN ONLY: Quick toggle for visibility)
export async function updateXeroxVisibility(req: AuthenticatedRequest, res: Response) {
  try {
    const { showPrices } = req.body;
    if (showPrices === undefined) {
      return res.status(400).json({ error: 'showPrices boolean is required.' });
    }
    const boolVal = Boolean(showPrices);
    await db.setSetting('show_xerox_prices', String(boolVal));

    const current = await fetchCurrentXeroxRates();
    return res.json({
      success: true,
      showPrices: boolVal,
      rates: current.rates,
      message: boolVal 
        ? 'Xerox prices are now visible to customers.'
        : 'Xerox prices are now hidden from customers.'
    });
  } catch (err: any) {
    console.error('Error in updateXeroxVisibility:', err);
    return res.status(500).json({ error: 'Server error while toggling Xerox price visibility.' });
  }
}
