const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(?:\+91[\s-]?)?(?<!\d)[6-9]\d{9}(?!\d)/g;
const urlPattern = /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi;

export function sanitizeMessage(content: string) {
  const flags: string[] = [];
  let masked = content;

  if (emailPattern.test(masked)) {
    flags.push("email");
    masked = masked.replace(emailPattern, "[contact hidden]");
  }
  if (phonePattern.test(masked)) {
    flags.push("phone");
    masked = masked.replace(phonePattern, "[contact hidden]");
  }

  const externalUrls = content.match(urlPattern)?.filter((url) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return !parsed.hostname.includes("ventex");
    } catch {
      return true;
    }
  }) || [];

  if (externalUrls.length > 0) flags.push("external_url");

  return {
    masked,
    flags: Array.from(new Set(flags)),
    hasExternalUrl: externalUrls.length > 0,
  };
}
