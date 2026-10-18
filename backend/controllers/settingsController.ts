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
  bw_single: number;
  bw_double: number;
  color_single: number;
  color_double: number;
}

export async function fetchCurrentXeroxRates(): Promise<XeroxRates> {
  const bwSingleStr = await db.getSetting('xerox_bw_single');
  const bwDoubleStr = await db.getSetting('xerox_bw_double');
  const colorSingleStr = await db.getSetting('xerox_color_single');
  const colorDoubleStr = await db.getSetting('xerox_color_double');

  return {
    bw_single: bwSingleStr ? Number(bwSingleStr) : 5,
    bw_double: bwDoubleStr ? Number(bwDoubleStr) : 6,
    color_single: colorSingleStr ? Number(colorSingleStr) : 10,
    color_double: colorDoubleStr ? Number(colorDoubleStr) : 20,
  };
}

// GET /api/settings/public
export async function getPublicSettings(_req: any, res: Response) {
  try {
    const whatsapp = await db.getSetting('whatsapp_number');
    const shopName = (await db.getSetting('shop_name')) || 'Sree Durga Mata Stationery';
    const shopSubtitle = (await db.getSetting('shop_subtitle')) || 'BOOK STALL & FANCY ITEMS';
    const xeroxRates = await fetchCurrentXeroxRates();

    return res.json({
      whatsappNumber: whatsapp || '',
      isConfigured: Boolean(whatsapp && whatsapp.trim().length > 0),
      shopName,
      shopSubtitle,
      xeroxRates
    });
  } catch (err: any) {
    console.error('Error in getPublicSettings:', err);
    return res.status(500).json({ error: 'Failed to load shop settings.' });
  }
}

// GET /api/settings/xerox-rates (Public)
export async function getXeroxRates(_req: any, res: Response) {
  try {
    const rates = await fetchCurrentXeroxRates();
    return res.json({ success: true, rates });
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

// PUT /api/settings/xerox-rates (ADMIN ONLY)
export async function updateXeroxRates(req: AuthenticatedRequest, res: Response) {
  try {
    const { bw_single, bw_double, color_single, color_double } = req.body;

    const parsedBwSingle = Number(bw_single);
    const parsedBwDouble = Number(bw_double);
    const parsedColorSingle = Number(color_single);
    const parsedColorDouble = Number(color_double);

    if (
      isNaN(parsedBwSingle) || parsedBwSingle <= 0 ||
      isNaN(parsedBwDouble) || parsedBwDouble <= 0 ||
      isNaN(parsedColorSingle) || parsedColorSingle <= 0 ||
      isNaN(parsedColorDouble) || parsedColorDouble <= 0
    ) {
      return res.status(400).json({ error: 'All Xerox rates must be valid positive numbers.' });
    }

    await db.setSetting('xerox_bw_single', String(parsedBwSingle));
    await db.setSetting('xerox_bw_double', String(parsedBwDouble));
    await db.setSetting('xerox_color_single', String(parsedColorSingle));
    await db.setSetting('xerox_color_double', String(parsedColorDouble));

    const updatedRates: XeroxRates = {
      bw_single: parsedBwSingle,
      bw_double: parsedBwDouble,
      color_single: parsedColorSingle,
      color_double: parsedColorDouble
    };

    return res.json({
      success: true,
      message: 'Xerox rates updated successfully.',
      rates: updatedRates
    });
  } catch (err: any) {
    console.error('Error in updateXeroxRates:', err);
    return res.status(500).json({ error: 'Server error while updating Xerox rates.' });
  }
}
