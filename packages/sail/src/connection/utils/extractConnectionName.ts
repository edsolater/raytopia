/**
 * get default RPC name from url
 */

export function extractConnectionName(url: string) {
  const matchedLocalhost = url.match(/(https:\/\/|http:\/\/)?localhost.*/);
  if (matchedLocalhost)
    return 'localhost';

  try {
    const urlObj = new globalThis.URL(url);
    return urlObj.hostname;
  } catch {
    return '--';
  }
}
