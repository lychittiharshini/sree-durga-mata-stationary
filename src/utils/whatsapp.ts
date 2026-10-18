
/**
 * Build a WhatsApp click-to-chat URL.
 * Converts literal \n text into actual line breaks.
 */
export function buildWhatsAppUrl(
  rawPhone: string,
  messageText: string
): { url: string | null; error?: string } {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      url: null,
      error: "The shop WhatsApp number has not been configured yet.",
    };
  }

  // Keep digits only. Include the country code, e.g. 91 for India.
  const cleanPhone = rawPhone.replace(/\D/g, "");

  if (!/^\d{10,15}$/.test(cleanPhone)) {
    return {
      url: null,
      error: "Invalid WhatsApp number. Include the country code.",
    };
  }

  // Convert escaped line breaks into real line breaks.
  const cleanMessage = messageText
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  return {
    url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      cleanMessage
    )}`,
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
 * Xerox enquiry message.
 * Prices and totals are intentionally excluded.
 */
export function formatXeroxWhatsAppMessage(
  customerName: string,
  items: XeroxItemRequest[],
  _estimatedTotal: number,
  customerNote?: string
): string {
  const name = customerName.trim() || "Customer";

  const lines: string[] = [
    "Hello Sree Durga Mata Stationery!",
    "",
    `Customer Name: ${name}`,
    "",
    "Xerox Services Requested:",
  ];

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.label}`);
    lines.push(`   Quantity: ${item.quantity} page${item.quantity === 1 ? "" : "s"}`);
  });

  if (customerNote?.trim()) {
    lines.push("", `Additional Notes: ${customerNote.trim()}`);
  }

  lines.push("", "Please confirm the details. Thank you!");

  return lines.join("\n");
}

/**
 * Stationery enquiry message.
 * Keeps item prices and estimated totals.
 */
export function formatStationeryWhatsAppMessage(
  customerName: string,
  items: StationeryRequestItem[],
  estimatedKnownTotal: number,
  hasUnpricedItems: boolean,
  customerNote?: string
): string {
  const name = customerName.trim() || "Customer";

  const lines: string[] = [
    "Hello Sree Durga Mata Stationery!",
    "",
    `Customer Name: ${name}`,
    "",
    "I would like to enquire about the following items:",
    "",
  ];

  items.forEach((item, index) => {
    let itemLine = `${index + 1}. ${item.name}`;

    if (item.isCustom) {
      itemLine += " (Custom Item)";
    }

    itemLine += ` — Quantity: ${item.quantity}`;

    if (item.price !== null && item.price !== undefined) {
      itemLine += ` — Unit Price: ₹${item.price}`;
      itemLine += ` — Subtotal: ₹${item.price * item.quantity}`;
    } else {
      itemLine += " — Unit Price: Price to be confirmed";
      itemLine += " — Subtotal: To be confirmed";
    }

    if (item.offerNote) {
      itemLine += ` [Offer: ${item.offerNote}]`;
    }

    if (item.notes?.trim()) {
      itemLine += ` (Note: ${item.notes.trim()})`;
    }

    lines.push(itemLine);
  });

  lines.push("");

  if (estimatedKnownTotal > 0) {
    let totalLine = `Estimated Total: ₹${estimatedKnownTotal}`;

    if (hasUnpricedItems) {
      totalLine += " (plus items with price to be confirmed)";
    }

    lines.push(totalLine);
  } else {
    lines.push("Estimated Total: To be confirmed by shop");
  }

  if (customerNote?.trim()) {
    lines.push("", `Additional Notes: ${customerNote.trim()}`);
  }

  lines.push(
    "",
    "Please confirm the availability and final amount. Thank you!"
  );

  return lines.join("\n");
}
