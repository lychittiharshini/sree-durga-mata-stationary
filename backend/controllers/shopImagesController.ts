import { Request, Response } from 'express';
import { db } from '../config/db.ts';

// GET /api/shop-images (Public)
export async function getShopImages(_req: Request, res: Response) {
  try {
    const images = await db.getShopImages();
    return res.json({ success: true, count: images.length, images });
  } catch (err: any) {
    console.error('Error fetching shop images:', err);
    return res.status(500).json({ error: 'Failed to fetch shop images.' });
  }
}

// POST /api/admin/shop-images (Admin only)
export async function addShopImage(req: Request, res: Response) {
  try {
    const { image_url, title, description } = req.body;

    if (!image_url || typeof image_url !== 'string') {
      return res.status(400).json({ error: 'Image URL or data is required.' });
    }

    const image = await db.addShopImage({
      image_url: image_url.trim(),
      title: title ? String(title).trim() : undefined,
      description: description ? String(description).trim() : undefined
    });

    return res.status(201).json({ success: true, message: 'Shop image added successfully.', image });
  } catch (err: any) {
    console.error('Error adding shop image:', err);
    return res.status(500).json({ error: 'Failed to add shop image.' });
  }
}

// DELETE /api/admin/shop-images/:id (Admin only)
export async function deleteShopImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid image ID required.' });

    await db.deleteShopImage(id);
    return res.json({ success: true, message: 'Shop image removed successfully.' });
  } catch (err: any) {
    console.error('Error deleting shop image:', err);
    return res.status(500).json({ error: 'Failed to delete shop image.' });
  }
}
