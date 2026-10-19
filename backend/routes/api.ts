import { Router } from 'express';
import { getPublicSettings, getXeroxRates, updateWhatsAppNumber, updateXeroxRates, updateXeroxVisibility } from '../controllers/settingsController.ts';
import { login, logout, getCurrentAdmin, updateCredentials } from '../controllers/authController.ts';
import { getProducts, getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../controllers/productsController.ts';
import { getOffers, getAllOffersAdmin, createOffer, updateOffer, deleteOffer } from '../controllers/offersController.ts';
import { getShopImages, addShopImage, deleteShopImage } from '../controllers/shopImagesController.ts';
import { getAdditionalServices, getAllAdditionalServicesAdmin, createAdditionalService, updateAdditionalService, deleteAdditionalService } from '../controllers/additionalServicesController.ts';
import { requireAdminAuth } from '../middleware/auth.ts';
import { loginRateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/settings/public', getPublicSettings);
router.get('/settings/xerox-rates', getXeroxRates);
router.get('/products', getProducts);
router.get('/offers', getOffers);
router.get('/shop-images', getShopImages);
router.get('/additional-services', getAdditionalServices);

// Admin Auth
router.post('/auth/login', loginRateLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/me', requireAdminAuth, getCurrentAdmin);
router.put('/admin/change-credentials', requireAdminAuth, updateCredentials);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================

// Shop WhatsApp number & Xerox rates
router.put('/settings/whatsapp', requireAdminAuth, updateWhatsAppNumber);
router.put('/settings/xerox-rates', requireAdminAuth, updateXeroxRates);
router.put('/settings/xerox-visibility', requireAdminAuth, updateXeroxVisibility);

// Products management
router.get('/admin/products', requireAdminAuth, getAllProductsAdmin);
router.post('/admin/products', requireAdminAuth, createProduct);
router.put('/admin/products/:id', requireAdminAuth, updateProduct);
router.delete('/admin/products/:id', requireAdminAuth, deleteProduct);

// Offers management
router.get('/admin/offers', requireAdminAuth, getAllOffersAdmin);
router.post('/admin/offers', requireAdminAuth, createOffer);
router.put('/admin/offers/:id', requireAdminAuth, updateOffer);
router.delete('/admin/offers/:id', requireAdminAuth, deleteOffer);

// Shop images management
router.post('/admin/shop-images', requireAdminAuth, addShopImage);
router.delete('/admin/shop-images/:id', requireAdminAuth, deleteShopImage);

// Additional services management
router.get('/admin/additional-services', requireAdminAuth, getAllAdditionalServicesAdmin);
router.post('/admin/additional-services', requireAdminAuth, createAdditionalService);
router.put('/admin/additional-services/:id', requireAdminAuth, updateAdditionalService);
router.delete('/admin/additional-services/:id', requireAdminAuth, deleteAdditionalService);

export default router;
