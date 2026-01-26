import geoip from "geoip-lite";

export function getCurrencyFromIp(ip: string): string {
  // Handle localhost or empty IP
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return "USD"; // Default to USD for localhost
  }

  const geo = geoip.lookup(ip);
  if (geo && geo.country === "IN") {
    return "INR";
  }

  return "USD";
}
