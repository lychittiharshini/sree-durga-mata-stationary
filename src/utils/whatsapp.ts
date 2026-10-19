/**
 * Formats a clean WhatsApp click-to-chat URL:
 * https://wa.me/<CLEAN_NUMBER>?text=<ENCODED_MESSAGE>
 */
export function buildWhatsAppUrl(rawPhone: string, messageText: string): { url: string | null; error?: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      url: null,
      error: 'The shop WhatsApp number has not been configured yet. Please check back shortly.'
    };
  }

  // Sanitize: strip spaces, dashes, brackets, plus sign
  const cleanPhone = rawPhone.replace(/[\s\-\(\)\+]/g, '');

  if (!/^\d{10,15}$/.test(cleanPhone)) {
    return {
      url: null,
      error: 'Invalid shop WhatsApp number format. Please ensure it has a valid country code.'
    };
  }

  const encodedMessage = encodeURIComponent(messageText.trim());
  return {
    url: `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  };
}

export interface XeroxItemRequest {
  label: string;
  pricePerPage?: number | null;
  quantity: number;
  total?: number | null;
}

export interface StationeryRequestItem {
  id?: number;
  name: string;
  quantity: number;
  price?: number | null;
  isCustom?: boolean;
  notes?: string;
  offerNote?: string;
}

/**
 * Standard English WhatsApp enquiry message for Xerox requests
 * Always in English per requirement!
 */
export function formatXeroxWhatsAppMessage(
  customerName: string,
  items: XeroxItemRequest[],
  estimatedTotal?: number | null,
  customerNote?: string,
  showPrices?: boolean
): string {
  let msg = `Hello Sri Durga Mata Stationery,\n\n`;
  msg += `My name is ${customerName.trim()}.\n\n`;
  msg += `I would like to enquire about the following items:\n\n`;

  const pricesVisible = Boolean(showPrices);

  items.forEach((item, idx) => {
    let line = `${idx + 1}. ${item.label} — Quantity: ${item.quantity}`;
    if (pricesVisible && item.pricePerPage && item.pricePerPage > 0) {
      const lineTotal = item.total && item.total > 0 ? item.total : (item.pricePerPage * item.quantity);
      line += ` — Unit Price: ₹${item.pricePerPage} — Subtotal: ₹${lineTotal}`;
    }
    msg += `${line}\n`;
  });

  if (pricesVisible && estimatedTotal && estimatedTotal > 0) {
    msg += `\nEstimated Total: ₹${estimatedTotal}\n`;
  } else {
    msg += `\nEstimated Total: To be confirmed by shop\n`;
  }

  if (customerNote && customerNote.trim()) {
    msg += `\nAdditional Notes: ${customerNote.trim()}\n`;
  }

  msg += `\nPlease confirm the availability and final amount. Thank you.`;
  return msg;
}

/**
 * Standard English WhatsApp enquiry message for Stationery requests
 * Always in English per requirement!
 */
export function formatStationeryWhatsAppMessage(
  customerName: string,
  items: StationeryRequestItem[],
  estimatedKnownTotal: number,
  hasUnpricedItems: boolean,
  customerNote?: string
): string {
  let msg = `Hello Sree Durga Mata Stationery,\n\n`;
  msg += `My name is ${customerName.trim()}.\n\n`;
  msg += `I would like to enquire about the following items:\n\n`;

  items.forEach((item, idx) => {
    let itemLine = `${idx + 1}. ${item.name}`;
    if (item.isCustom) {
      itemLine += ` (Custom Item)`;
    }
    itemLine += ` — Quantity: ${item.quantity}`;

    if (item.price !== null && item.price !== undefined) {
      itemLine += ` — Unit Price: ₹${item.price} — Subtotal: ₹${item.price * item.quantity}`;
    } else {
      itemLine += ` — Unit Price: Price to be confirmed — Subtotal: To be confirmed`;
    }

    if (item.offerNote) {
      itemLine += ` [Offer: ${item.offerNote}]`;
    }

    if (item.notes && item.notes.trim()) {
      itemLine += ` (Note: ${item.notes.trim()})`;
    }

    msg += `${itemLine}\n`;
  });

  if (estimatedKnownTotal > 0) {
    msg += `\nEstimated Total: ₹${estimatedKnownTotal}`;
    if (hasUnpricedItems) {
      msg += ` (plus items with price to be confirmed)`;
    }
    msg += `\n`;
  } else {
    msg += `\nEstimated Total: To be confirmed by shop\n`;
  }

  if (customerNote && customerNote.trim()) {
    msg += `\nAdditional Notes: ${customerNote.trim()}\n`;
  }

  msg += `\nPlease confirm the availability and final amount. Thank you.`;
  return msg;
}
