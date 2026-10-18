import { Request, Response } from 'express';
import { db } from '../config/db.ts';

// GET /api/additional-services (Public - active only)
export async function getAdditionalServices(_req: Request, res: Response) {
  try {
    const services = await db.getAdditionalServices(true);
    return res.json({ success: true, count: services.length, services });
  } catch (err: any) {
    console.error('Error fetching additional services:', err);
    return res.status(500).json({ error: 'Failed to fetch services.' });
  }
}

// GET /api/admin/additional-services (Admin - all)
export async function getAllAdditionalServicesAdmin(_req: Request, res: Response) {
  try {
    const services = await db.getAdditionalServices(false);
    return res.json({ success: true, count: services.length, services });
  } catch (err: any) {
    console.error('Error fetching all services:', err);
    return res.status(500).json({ error: 'Failed to fetch services.' });
  }
}

// POST /api/admin/additional-services (Admin only)
export async function createAdditionalService(req: Request, res: Response) {
  try {
    const { service_name, description, details, is_active } = req.body;

    if (!service_name || !description) {
      return res.status(400).json({ error: 'Service name and description are required.' });
    }

    const service = await db.addAdditionalService({
      service_name: String(service_name).trim(),
      description: String(description).trim(),
      details: details ? String(details).trim() : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    return res.status(201).json({ success: true, message: 'Additional service created.', service });
  } catch (err: any) {
    console.error('Error creating additional service:', err);
    return res.status(500).json({ error: 'Failed to create service.' });
  }
}

// PUT /api/admin/additional-services/:id (Admin only)
export async function updateAdditionalService(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid service ID required.' });

    const updated = await db.updateAdditionalService(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Service not found.' });

    return res.json({ success: true, message: 'Service updated.', service: updated });
  } catch (err: any) {
    console.error('Error updating service:', err);
    return res.status(500).json({ error: 'Failed to update service.' });
  }
}

// DELETE /api/admin/additional-services/:id (Admin only)
export async function deleteAdditionalService(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Valid service ID required.' });

    await db.deleteAdditionalService(id);
    return res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting service:', err);
    return res.status(500).json({ error: 'Failed to delete service.' });
  }
}
