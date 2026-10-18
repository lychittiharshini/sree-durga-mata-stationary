# Sree Durga Mata Stationery
### BOOK STALL & FANCY ITEMS — Official Shop Website

A clean, attractive, mobile-first website for **Sree Durga Mata Stationery – Book Stall & Fancy Items**. Customers can browse Xerox options and stationery products, enter their name, and send pre-filled WhatsApp enquiries directly to the shop.

---

## 🌟 Key Updates & Features

1. **Authentic Shop Branding**:
   - **Sree Durga Mata Stationery** in vivid green text.
   - **BOOK STALL & FANCY ITEMS** in white text underneath on a rich maroon background.
   - No unnecessary photo banners, deity images, or uploaded banner widgets on customer screens.

2. **Clean Homepage — Only Two Main Service Options**:
   - 1. Shop branding.
   - 2. English & తెలుగు language selector.
   - 3. Simple WhatsApp contact button.
   - 4. Exactly two main service cards:
     - **Xerox**
     - **Stationery Items**
   - Click to open dedicated Xerox or Stationery sections with smooth "← Back to Main Menu" navigation.
   - All duplicate service cards, repetitive content, and QR code sections removed.

3. **Required Customer Name & WhatsApp Enquiry**:
   - Customers must enter their name before opening WhatsApp.
   - Enquiries are **always formatted in English** (even when browsing in Telugu) per shop requirements:
     ```
     Hello Sree Durga Mata Stationery,

     My name is [Customer Name].

     I would like to enquire about the following items:

     1. [Item or Xerox option] — Quantity: [Qty] — Unit Price: ₹[Price] — Subtotal: ₹[Subtotal]

     Estimated Total: ₹[Total]

     Additional Notes: [Customer Notes]

     Please confirm the availability and final amount. Thank you.
     ```
   - Does not auto-send; customer reviews and sends the message themselves in WhatsApp.

4. **Fixed Xerox Rates**:
   - **Black & White — Single Side**: ₹5
   - **Black & White — Double Side**: ₹6
   - **Colour — Single Side**: ₹10
   - **Colour — Double Side**: ₹20
   - Prices appear *only* inside the Xerox section (never exposed on the homepage).
   - Rates are permanently fixed and cannot be changed via the admin panel.

5. **Stationery Section**:
   - Search bar and category filters.
   - Displays real products from PostgreSQL.
   - Allows adding unlisted custom items with custom name and quantity.
   - Full request summary with quantity controls and item removal.

6. **Admin Dashboard (Full Owner Management)**:
   - Discreet **Admin Login** link in the footer.
   - Secure hashed password authentication and rate-limited endpoints.
   - The shop owner can:
     - Update the shop's WhatsApp phone number.
     - Add, edit, and delete stationery products, prices, and stock status.
     - Publish, edit, and remove special offers and sales.
     - Add and manage shop gallery images.
     - Add and manage additional services (spiral binding, lamination, etc.).
   - Xerox prices remain strictly fixed.
   - If no offers, images, or additional services have been added, their sections remain hidden on customer screens.

---

## 🚀 Running the Project

### Install dependencies:
```bash
npm install
```

### Start development server:
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### Admin Credentials:
- **Default Username**: `admin`
- **Default Password**: `DurgaMata@2026`
*(Configurable via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`).*
