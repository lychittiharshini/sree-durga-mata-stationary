
/**
 * Build a WhatsApp click-to-chat URL.
 */
export function buildWhatsAppUrl(
  rawPhone: string,
  messageText: string
): { url: string | null; error?: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      url: null,
      error: 'The shop WhatsApp number has not been configured yet.',
    };
  }

  const cleanPhone = rawPhone.replace(/[\s\-()+]/g, '');

  if (!/^\d{10,15}$/.test(cleanPhone)) {
    return {
      url: null,
      error: 'Invalid WhatsApp number. Include the country code.',
    };
  }

  // Convert literal "\n" text into real line breaks.
  const cleanMessage = messageText
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .trim();

  return {
    url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(cleanMessage)}`,
  };
}

export interface XeroxItemRequest {
  label: string;
  pricePerPage?: number;
  quantity: number;
  total?: number;
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
 * Xerox enquiry message — no prices or totals.
 */
export function formatXeroxWhatsAppMessage(
  customerName: string,
  items: XeroxItemRequest[],
  _estimatedTotal: number,
  customerNote?: string
): string {
  const lines: string[] = [
    'Hello Sree Durga Mata Stationery!',
    '',
    `Customer Name: ${customerName.trim()}`,
    '',
    'Xerox Services Requested:',
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.label}`);
    lines.push(`   Quantity: ${item.quantity} pages`);
  });

  if (customerNote?.trim()) {
    lines.push('', `Additional Notes: ${customerNote.trim()}`);
  }

  lines.push('', 'Please confirm the details. Thank you!');

  return lines.join('\n');
}

/**
 * Stationery enquiry — preserve existing price behavior.
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
      itemLine += ` — Unit Price: ₹${item.price} — Subtotal: ₹${
        item.price * item.quantity
      }`;
    } else {
      itemLine +=
        ` — Unit Price: Price to be confirmed — Subtotal: To be confirmed`;
    }

    if (item.offerNote) {
      itemLine += ` [Offer: ${item.offerNote}]`;
    }

    if (item.notes?.trim()) {
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

  if (customerNote?.trim()) {
    msg += `\nAdditional Notes: ${customerNote.trim()}\n`;
  }

  msg += `\nPlease confirm the availability and final amount. Thank you.`;

  return msg;
}
