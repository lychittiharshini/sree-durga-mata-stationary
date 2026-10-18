import { Request, Response } from 'express';
import { db } from '../config/db.ts';

// GET /api/offers (Public - active only)
export async function getOffers(_req: Request, res: Response) {
  try {
    const offers = await db.getOffers(true);
    return res.json({ success: true, count: offers.length, offers });
  } catch (err: any) {
    console.error('Error fetching offers:', err);
    return res.status(500).json({ error: 'Failed to fetch offers.' });
  }
}

// GET /api/admin/offers (Admin - all offers)
export async function getAllOffersAdmin(_req: Request, res: Response) {
  try {
    const offers = await db.getOffers(false);
    return res.json({ success: true, count: offers.length, offers });
  } catch (err: any) {
    console.error('Error fetching admin offers:', err);
    return res.status(500).json({ error: 'Failed to fetch offers.' });
  }
}

// POST /api/admin/offers (Admin only)
export async function createOffer(req: Request, res: Response) {
  try {
    const { title, description, applicable_item, offer_price, discount_percentage, start_date, end_date, is_active } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Offer title and description are required.' });
    }

    const offer = await db.addOffer({
      title: String(title).trim(),
      description: String(description).trim(),
      applicable_item: applicable_item ? String(applicable_item).trim() : undefined,
      offer_price: offer_price !== undefined && offer_price !== '' ? Number(offer_price) : null,
      discount_percentage: discount_percentage !== undefined && discount_percentage !== '' ? Number(discount_percentage) : null,
      start_date: start_date ? String(start_date).trim() : undefined,
      end_date: end_date ? String(end_date).trim() : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    return res.status(201).json({ success: true, message: 'Offer created successfully.', offer });
  } catch (err: any) {
    console.error('Error creating offer:', err);
    return res.status(500).json({ error: 'Failed to create offer.' });
  }
}

// PUT /api/admin/offers/:id (Admin only)
export async function updateOffer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid offer ID required.' });

    const updated = await db.updateOffer(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Offer not found.' });

    return res.json({ success: true, message: 'Offer updated successfully.', offer: updated });
  } catch (err: any) {
    console.error('Error updating offer:', err);
    return res.status(500).json({ error: 'Failed to update offer.' });
  }
}

// DELETE /api/admin/offers/:id (Admin only)
export async function deleteOffer(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid offer ID required.' });

    await db.deleteOffer(id);
    return res.json({ success: true, message: 'Offer deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting offer:', err);
    return res.status(500).json({ error: 'Failed to delete offer.' });
  }
}
