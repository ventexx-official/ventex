/**
 * Ventexx WhatsApp P2P Utility
 * Handles message formatting and WhatsApp deep-link generation.
 * The seller phone number is NEVER exposed in client HTML.
 */

export interface WhatsAppMessageParams {
  productName: string;
  productCategory: string;
  priceInr: number; // in paise (divide by 100)
  priceUsd?: number;
  productId: string;
  dealCode: string;
  buyerName: string;
  buyerEmail: string;
}

export function generateDealCode(productId: string): string {
  const prefix = productId.replace(/-/g, '').slice(0, 4).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `VTX-${prefix}-${timestamp}`;
}

export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const priceInr = (params.priceInr / 100).toLocaleString('en-IN');
  const listingUrl = `https://ventexx.com/marketplace/${params.productId}`;

  return `🛒 *PURCHASE REQUEST — Ventexx Marketplace*
━━━━━━━━━━━━━━━━━━━━━━━━

📦 *Product Details*
• Name: ${params.productName}
• Category: ${params.productCategory}
• Price: ₹${priceInr}
• Listing: ${listingUrl}

🎫 *Deal Code:* \`${params.dealCode}\`
(Use this code in all communications for this order)

👤 *Buyer Information*
• Name: ${params.buyerName}
• Email: ${params.buyerEmail}

💬 *Next steps:*
1️⃣ Confirm product availability
2️⃣ Agree on delivery timeline
3️⃣ Choose payment: UPI / Bank Transfer / PayPal / Other
4️⃣ Buyer pays advance OR full amount upfront — your choice
5️⃣ Deliver product / send access link
6️⃣ Buyer confirms receipt

━━━━━━━━━━━━━━━━━━━━━━━━
Sent via Ventexx Marketplace · ventexx.com
Transaction ref: ${params.dealCode}`;
}

export function openWhatsApp(phoneNumber: string, message: string): void {
  // Remove spaces, dashes, parentheses from phone number
  const clean = phoneNumber.replace(/[\s\-\(\)]/g, '');
  // Ensure it starts with +
  const normalized = clean.startsWith('+') ? clean : `+${clean}`;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${normalized.replace('+', '')}?text=${encoded}`, '_blank');
}
