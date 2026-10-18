
/**
 * Standard English WhatsApp enquiry message for Xerox requests.
 * Prices and totals are intentionally excluded.
 */
export function formatXeroxWhatsAppMessage(
  customerName: string,
  items: XeroxItemRequest[],
  _estimatedTotal: number,
  customerNote?: string
): string {
  let msg = `Hello Sree Durga Mata Stationery,\n\n`;
  msg += `My name is ${customerName.trim()}.\n\n`;
  msg += `I would like to enquire about the following Xerox services:\n\n`;

  items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.label} — Quantity: ${item.quantity}\n`;
  });

  if (customerNote && customerNote.trim()) {
    msg += `\nAdditional Notes: ${customerNote.trim()}\n`;
  }

  msg += `\nPlease confirm the availability and price. Thank you.`;
  return msg;
}
