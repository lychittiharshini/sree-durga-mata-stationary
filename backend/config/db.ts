import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'harshini2008';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'harshini8019';
const DEFAULT_WHATSAPP = process.env.DEFAULT_WHATSAPP_NUMBER || '910000000000';

export interface ProductRecord {
  id: number;
  name: string;
  description: string;
  price: number | null;
  category: string;
  image_url: string | null;
  is_available: boolean;
  created_at: Date;
}

export interface OfferRecord {
  id: number;
  title: string;
  description: string;
  applicable_item?: string;
  offer_price?: number | null;
  discount_percentage?: number | null;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: Date;
}

export interface ShopImageRecord {
  id: number;
  image_url: string;
  title?: string;
  description?: string;
  created_at: Date;
}

export interface AdditionalServiceRecord {
  id: number;
  service_name: string;
  description: string;
  details?: string;
  is_active: boolean;
  created_at: Date;
}

interface MemoryStore {
  settings: Record<string, string>;
  admins: Array<{ id: number; username: string; password_hash: string; last_login?: Date }>;
  products: ProductRecord[];
  offers: OfferRecord[];
  shop_images: ShopImageRecord[];
  additional_services: AdditionalServiceRecord[];
}

const LOCAL_STORE_FILE = path.resolve(process.cwd(), '.data_store.json');

let pool: pg.Pool | null = null;
let usePostgres = false;
let memStore: MemoryStore = {
  settings: {
    whatsapp_number: DEFAULT_WHATSAPP,
    shop_name: 'Sree Durga Mata Stationery',
    shop_subtitle: 'BOOK STALL & FANCY ITEMS'
  },
  admins: [],
  products: [],
  offers: [],
  shop_images: [],
  additional_services: []
};

function loadLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      memStore = {
        settings: parsed.settings || {},
        admins: parsed.admins || [],
        products: parsed.products || [],
        offers: parsed.offers || [],
        shop_images: parsed.shop_images || [],
        additional_services: parsed.additional_services || []
      };
    }
  } catch (err) {
    console.warn('[DB] Could not read local store file, starting fresh', err);
  }

  if (DEFAULT_ADMIN_PASSWORD) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
    if (!memStore.admins || memStore.admins.length === 0) {
      memStore.admins = [
        {
          id: 1,
          username: DEFAULT_ADMIN_USER,
          password_hash: hash,
          last_login: new Date()
        }
      ];
      saveLocalStore();
    } else {
      // If the owner configured ADMIN_PASSWORD in environment, sync it
      memStore.admins[0].username = DEFAULT_ADMIN_USER;
      memStore.admins[0].password_hash = hash;
      saveLocalStore();
    }
  }

  if (!memStore.settings || !memStore.settings.whatsapp_number) {
    memStore.settings = {
      ...(memStore.settings || {}),
      whatsapp_number: DEFAULT_WHATSAPP,
      shop_name: 'Sree Durga Mata Stationery',
      shop_subtitle: 'BOOK STALL & FANCY ITEMS'
    };
    saveLocalStore();
  }
}

function saveLocalStore() {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(memStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save local store:', err);
  }
}

export async function initDb() {
  loadLocalStore();

  const hasPgConfig = Boolean(
    process.env.DATABASE_URL ||
    (process.env.PGHOST && process.env.PGDATABASE) ||
    (process.env.SQL_HOST && process.env.SQL_DB_NAME)
  );

  if (hasPgConfig) {
    try {
      if (process.env.DATABASE_URL) {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 5000,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
        });
      } else {
        pool = new Pool({
          host: process.env.SQL_HOST || process.env.PGHOST,
          user: process.env.SQL_USER || process.env.PGUSER,
          password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
          database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
          port: Number(process.env.PGPORT) || 5432,
          connectionTimeoutMillis: 5000,
        });
      }

      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS shop_settings (
              id SERIAL PRIMARY KEY,
              setting_key VARCHAR(100) UNIQUE NOT NULL,
              setting_value TEXT NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS admin_users (
              id SERIAL PRIMARY KEY,
              username VARCHAR(100) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              last_login TIMESTAMP WITH TIME ZONE
          );
          CREATE TABLE IF NOT EXISTS products (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              price DECIMAL(10, 2),
              category VARCHAR(100) DEFAULT 'General',
              image_url TEXT,
              is_available BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS offers (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              description TEXT,
              applicable_item VARCHAR(255),
              offer_price DECIMAL(10, 2),
              discount_percentage INT,
              start_date VARCHAR(50),
              end_date VARCHAR(50),
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS shop_images (
              id SERIAL PRIMARY KEY,
              image_url TEXT NOT NULL,
              title VARCHAR(255),
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS additional_services (
              id SERIAL PRIMARY KEY,
              service_name VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              details TEXT,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await client.query(`
          INSERT INTO shop_settings (setting_key, setting_value)
          VALUES ('whatsapp_number', $1)
          ON CONFLICT (setting_key) DO NOTHING;
        `, [DEFAULT_WHATSAPP]);

        if (DEFAULT_ADMIN_PASSWORD) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, salt);
          await client.query(`
            INSERT INTO admin_users (username, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
          `, [DEFAULT_ADMIN_USER, hash]);
        }

        usePostgres = true;
        console.log('[DB] Successfully connected to PostgreSQL instance');
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('[DB] PostgreSQL connection attempt was not ready or unavailable:', err.message);
      console.log('[DB] Utilizing persistent local fallback store.');
      usePostgres = false;
    }
  }
}

export const db = {
  // Settings
  async getSetting(key: string): Promise<string | null> {
    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT setting_value FROM shop_settings WHERE setting_key = $1', [key]);
        if (res.rows.length > 0) return res.rows[0].setting_value;
        return null;
      } catch (err) {
        console.error('[DB] Error getting setting from PG:', err);
      }
    }
    return memStore.settings[key] || null;
  },

  async setSetting(key: string, value: string): Promise<void> {
    if (usePostgres && pool) {
      try {
        await pool.query(`
          INSERT INTO shop_settings (setting_key, setting_value, updated_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (setting_key) 
          DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
        `, [key, value]);
      } catch (err) {
        console.error('[DB] Error setting in PG:', err);
      }
    }
    memStore.settings[key] = value;
    saveLocalStore();
  },

  // Admins
  async findAdminByUsername(username: string) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT id, username, password_hash FROM admin_users WHERE LOWER(username) = LOWER($1)', [username]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      } catch (err) {
        console.error('[DB] Error finding admin in PG:', err);
      }
    }
    return memStore.admins.find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
  },

  async findAdminById(id: number) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT id, username, password_hash FROM admin_users WHERE id = $1', [id]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      } catch (err) {
        console.error('[DB] Error finding admin by ID in PG:', err);
      }
    }
    return memStore.admins.find(a => a.id === id) || null;
  },

  async updateAdminCredentials(id: number, username: string, passwordHash?: string) {
    if (usePostgres && pool) {
      try {
        if (passwordHash) {
          await pool.query(
            'UPDATE admin_users SET username = $1, password_hash = $2 WHERE id = $3',
            [username, passwordHash, id]
          );
        } else {
          await pool.query(
            'UPDATE admin_users SET username = $1 WHERE id = $2',
            [username, id]
          );
        }
      } catch (err) {
        console.error('[DB] Error updating admin credentials in PG:', err);
        throw err;
      }
    }
    const admin = memStore.admins.find(a => a.id === id);
    if (admin) {
      admin.username = username;
      if (passwordHash) {
        admin.password_hash = passwordHash;
      }
      saveLocalStore();
    }
  },

  async updateAdminLastLogin(id: number) {
    if (usePostgres && pool) {
      try {
        await pool.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      } catch (err) {
        console.error('[DB] Error updating admin login:', err);
      }
    }
    const admin = memStore.admins.find(a => a.id === id);
    if (admin) {
      admin.last_login = new Date();
      saveLocalStore();
    }
  },

  // Products
  async getProducts(search?: string, category?: string, showAll?: boolean) {
    if (usePostgres && pool) {
      try {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];
        if (!showAll) {
          query += ' AND is_available = TRUE';
        }
        if (category && category !== 'All') {
          params.push(category);
          query += ` AND category = $${params.length}`;
        }
        if (search) {
          params.push(`%${search}%`);
          query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }
        query += ' ORDER BY id ASC';
        const res = await pool.query(query, params);
        return res.rows;
      } catch (err) {
        console.error('[DB] Error fetching products from PG:', err);
      }
    }

    let list = showAll ? memStore.products : memStore.products.filter(p => p.is_available);
    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    return list;
  },

  async addProduct(data: { name: string; description?: string; price?: number | null; category?: string; image_url?: string; is_available?: boolean }) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query(`
          INSERT INTO products (name, description, price, category, image_url, is_available)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          data.name,
          data.description || null,
          data.price !== undefined && data.price !== null ? data.price : null,
          data.category || 'General',
          data.image_url || null,
          data.is_available !== undefined ? data.is_available : true
        ]);
        const product = res.rows[0];
        if (product) {
          memStore.products = [product, ...memStore.products.filter(p => p.id !== product.id)];
          saveLocalStore();
        }
        return product;
      } catch (err) {
        console.error('[DB] Error adding product to PG:', err);
        throw err;
      }
    }

    const newProd: ProductRecord = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      price: data.price !== undefined && data.price !== null ? data.price : null,
      category: data.category || 'General',
      image_url: data.image_url || null,
      is_available: data.is_available !== undefined ? data.is_available : true,
      created_at: new Date()
    };
    memStore.products.unshift(newProd);
    saveLocalStore();
    return newProd;
  },

  async updateProduct(id: number, data: Partial<ProductRecord>) {
    if (usePostgres && pool) {
      try {
        const fields: string[] = [];
        const params: any[] = [];
        let i = 1;
        if (data.name !== undefined) { fields.push(`name = $${i++}`); params.push(data.name); }
        if (data.description !== undefined) { fields.push(`description = $${i++}`); params.push(data.description); }
        if (data.price !== undefined) { fields.push(`price = $${i++}`); params.push(data.price); }
        if (data.category !== undefined) { fields.push(`category = $${i++}`); params.push(data.category); }
        if (data.image_url !== undefined) { fields.push(`image_url = $${i++}`); params.push(data.image_url); }
        if (data.is_available !== undefined) { fields.push(`is_available = $${i++}`); params.push(data.is_available); }

        if (fields.length > 0) {
          params.push(id);
          const res = await pool.query(`
            UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *
          `, params);
          if (res.rows.length === 0) {
            return null;
          }
          const updated = res.rows[0];
          const idx = memStore.products.findIndex(p => p.id === id);
          if (idx !== -1) {
            memStore.products[idx] = updated;
          } else {
            memStore.products.push(updated);
          }
          saveLocalStore();
          return updated;
        }
      } catch (err) {
        console.error('[DB] Error updating product in PG:', err);
        throw err;
      }
    }

    const idx = memStore.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memStore.products[idx] = { ...memStore.products[idx], ...data };
      saveLocalStore();
      return memStore.products[idx];
    }
    return null;
  },

  async deleteProduct(id: number): Promise<boolean> {
    let deletedInPg = false;
    if (usePostgres && pool) {
      try {
        const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        deletedInPg = (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('[DB] Error deleting product from PG:', err);
        throw err;
      }
    }

    const hadInMem = memStore.products.some(p => p.id === id);
    memStore.products = memStore.products.filter(p => p.id !== id);
    saveLocalStore();

    if (usePostgres && pool) {
      return deletedInPg;
    }
    return hadInMem;
  },

  // Offers
  async getOffers(activeOnly: boolean = true) {
    if (usePostgres && pool) {
      try {
        const query = activeOnly ? 'SELECT * FROM offers WHERE is_active = TRUE ORDER BY id DESC' : 'SELECT * FROM offers ORDER BY id DESC';
        const res = await pool.query(query);
        return res.rows;
      } catch (err) {
        console.error('[DB] Error getting offers from PG:', err);
      }
    }
    return activeOnly ? memStore.offers.filter(o => o.is_active) : memStore.offers;
  },

  async addOffer(data: Omit<OfferRecord, 'id' | 'created_at'>) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query(`
          INSERT INTO offers (title, description, applicable_item, offer_price, discount_percentage, start_date, end_date, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          data.title,
          data.description,
          data.applicable_item || null,
          data.offer_price !== undefined ? data.offer_price : null,
          data.discount_percentage !== undefined ? data.discount_percentage : null,
          data.start_date || null,
          data.end_date || null,
          data.is_active !== undefined ? data.is_active : true
        ]);
        return res.rows[0];
      } catch (err) {
        console.error('[DB] Error adding offer to PG:', err);
      }
    }

    const newOffer: OfferRecord = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      applicable_item: data.applicable_item,
      offer_price: data.offer_price,
      discount_percentage: data.discount_percentage,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date()
    };
    memStore.offers.push(newOffer);
    saveLocalStore();
    return newOffer;
  },

  async updateOffer(id: number, data: Partial<OfferRecord>) {
    if (usePostgres && pool) {
      try {
        const fields: string[] = [];
        const params: any[] = [];
        let i = 1;
        if (data.title !== undefined) { fields.push(`title = $${i++}`); params.push(data.title); }
        if (data.description !== undefined) { fields.push(`description = $${i++}`); params.push(data.description); }
        if (data.applicable_item !== undefined) { fields.push(`applicable_item = $${i++}`); params.push(data.applicable_item); }
        if (data.offer_price !== undefined) { fields.push(`offer_price = $${i++}`); params.push(data.offer_price); }
        if (data.discount_percentage !== undefined) { fields.push(`discount_percentage = $${i++}`); params.push(data.discount_percentage); }
        if (data.start_date !== undefined) { fields.push(`start_date = $${i++}`); params.push(data.start_date); }
        if (data.end_date !== undefined) { fields.push(`end_date = $${i++}`); params.push(data.end_date); }
        if (data.is_active !== undefined) { fields.push(`is_active = $${i++}`); params.push(data.is_active); }

        if (fields.length > 0) {
          params.push(id);
          const res = await pool.query(`UPDATE offers SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, params);
          return res.rows[0];
        }
      } catch (err) {
        console.error('[DB] Error updating offer in PG:', err);
      }
    }

    const idx = memStore.offers.findIndex(o => o.id === id);
    if (idx !== -1) {
      memStore.offers[idx] = { ...memStore.offers[idx], ...data };
      saveLocalStore();
      return memStore.offers[idx];
    }
    return null;
  },

  async deleteOffer(id: number) {
    if (usePostgres && pool) {
      try {
        await pool.query('DELETE FROM offers WHERE id = $1', [id]);
        return true;
      } catch (err) {
        console.error('[DB] Error deleting offer in PG:', err);
      }
    }
    memStore.offers = memStore.offers.filter(o => o.id !== id);
    saveLocalStore();
    return true;
  },

  // Shop Images
  async getShopImages() {
    if (usePostgres && pool) {
      try {
        const res = await pool.query('SELECT * FROM shop_images ORDER BY id DESC');
        return res.rows;
      } catch (err) {
        console.error('[DB] Error getting shop images in PG:', err);
      }
    }
    return memStore.shop_images;
  },

  async addShopImage(data: { image_url: string; title?: string; description?: string }) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query(`
          INSERT INTO shop_images (image_url, title, description)
          VALUES ($1, $2, $3) RETURNING *
        `, [data.image_url, data.title || null, data.description || null]);
        return res.rows[0];
      } catch (err) {
        console.error('[DB] Error adding shop image in PG:', err);
      }
    }

    const newImg: ShopImageRecord = {
      id: Date.now(),
      image_url: data.image_url,
      title: data.title,
      description: data.description,
      created_at: new Date()
    };
    memStore.shop_images.push(newImg);
    saveLocalStore();
    return newImg;
  },

  async deleteShopImage(id: number) {
    if (usePostgres && pool) {
      try {
        await pool.query('DELETE FROM shop_images WHERE id = $1', [id]);
        return true;
      } catch (err) {
        console.error('[DB] Error deleting shop image in PG:', err);
      }
    }
    memStore.shop_images = memStore.shop_images.filter(img => img.id !== id);
    saveLocalStore();
    return true;
  },

  // Additional Services
  async getAdditionalServices(activeOnly: boolean = true) {
    if (usePostgres && pool) {
      try {
        const query = activeOnly ? 'SELECT * FROM additional_services WHERE is_active = TRUE ORDER BY id ASC' : 'SELECT * FROM additional_services ORDER BY id ASC';
        const res = await pool.query(query);
        return res.rows;
      } catch (err) {
        console.error('[DB] Error getting services in PG:', err);
      }
    }
    return activeOnly ? memStore.additional_services.filter(s => s.is_active) : memStore.additional_services;
  },

  async addAdditionalService(data: { service_name: string; description: string; details?: string; is_active?: boolean }) {
    if (usePostgres && pool) {
      try {
        const res = await pool.query(`
          INSERT INTO additional_services (service_name, description, details, is_active)
          VALUES ($1, $2, $3, $4) RETURNING *
        `, [data.service_name, data.description, data.details || null, data.is_active !== undefined ? data.is_active : true]);
        return res.rows[0];
      } catch (err) {
        console.error('[DB] Error adding additional service in PG:', err);
      }
    }

    const newSvc: AdditionalServiceRecord = {
      id: Date.now(),
      service_name: data.service_name,
      description: data.description,
      details: data.details,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date()
    };
    memStore.additional_services.push(newSvc);
    saveLocalStore();
    return newSvc;
  },

  async updateAdditionalService(id: number, data: Partial<AdditionalServiceRecord>) {
    if (usePostgres && pool) {
      try {
        const fields: string[] = [];
        const params: any[] = [];
        let i = 1;
        if (data.service_name !== undefined) { fields.push(`service_name = $${i++}`); params.push(data.service_name); }
        if (data.description !== undefined) { fields.push(`description = $${i++}`); params.push(data.description); }
        if (data.details !== undefined) { fields.push(`details = $${i++}`); params.push(data.details); }
        if (data.is_active !== undefined) { fields.push(`is_active = $${i++}`); params.push(data.is_active); }

        if (fields.length > 0) {
          params.push(id);
          const res = await pool.query(`UPDATE additional_services SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, params);
          return res.rows[0];
        }
      } catch (err) {
        console.error('[DB] Error updating additional service in PG:', err);
      }
    }

    const idx = memStore.additional_services.findIndex(s => s.id === id);
    if (idx !== -1) {
      memStore.additional_services[idx] = { ...memStore.additional_services[idx], ...data };
      saveLocalStore();
      return memStore.additional_services[idx];
    }
    return null;
  },

  async deleteAdditionalService(id: number) {
    if (usePostgres && pool) {
      try {
        await pool.query('DELETE FROM additional_services WHERE id = $1', [id]);
        return true;
      } catch (err) {
        console.error('[DB] Error deleting additional service in PG:', err);
      }
    }
    memStore.additional_services = memStore.additional_services.filter(s => s.id !== id);
    saveLocalStore();
    return true;
  }
};
