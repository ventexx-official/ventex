export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Ventexx";
export const OG_IMAGE_URL = `${BASE_URL}/og-image.png`;

export function emailFor(localPart: string) {
  const host = new URL(BASE_URL).hostname;
  return `${localPart}@${host}`;
}
