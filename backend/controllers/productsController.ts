import { Request, Response } from 'express';
import { db } from '../config/db.ts';

// GET /api/products (Public)
export async function getProducts(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;

    const products = await db.getProducts(search, category, false);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error('Error in getProducts:', err);
    return res.status(500).json({ error: 'Failed to retrieve stationery products.' });
  }
}

// GET /api/admin/products (Admin only - includes unavailable)
export async function getAllProductsAdmin(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;

    const products = await db.getProducts(search, category, true);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error('Error in getAllProductsAdmin:', err);
    return res.status(500).json({ error: 'Failed to retrieve all products.' });
  }
}

// POST /api/admin/products (Admin only)
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, category, image_url, is_available } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const parsedPrice = price !== undefined && price !== '' && price !== null ? Number(price) : null;

    const newProduct = await db.addProduct({
      name: name.trim(),
      description: description ? String(description).trim() : '',
      price: parsedPrice,
      category: category ? String(category).trim() : 'General',
      image_url: image_url ? String(image_url).trim() : '',
      is_available: is_available !== undefined ? Boolean(is_available) : true
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProduct
    });
  } catch (err: any) {
    console.error('Error in createProduct:', err);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
}

// PUT /api/admin/products/:id (Admin only)
export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid product ID is required.' });
    }

    const { name, description, price, category, image_url, is_available } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (price !== undefined) {
      updateData.price = price !== '' && price !== null ? Number(price) : null;
    }
    if (category !== undefined) updateData.category = String(category).trim();
    if (image_url !== undefined) updateData.image_url = String(image_url).trim();
    if (is_available !== undefined) updateData.is_available = Boolean(is_available);

    const updated = await db.updateProduct(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (err: any) {
    console.error('Error in updateProduct:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
}

// DELETE /api/admin/products/:id (Admin only)
export async function deleteProduct(req: Request, res: Response) {
  try {
    const rawId = req.params.id;
    const id = Number(rawId);
    if (!rawId || isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'A valid positive product ID is required.' });
    }

    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found or already deleted from database.' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully from database.',
      id
    });
  } catch (err: any) {
    console.error('Error in deleteProduct controller:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete product from database.' });
  }
}
