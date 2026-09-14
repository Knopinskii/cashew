/** One place that knows how tokens are stored, so nothing has to remember
 *  that there are two of them. */
const ACCESS = "token";
const REFRESH = "refresh";

export const getAccessToken = () => localStorage.getItem(ACCESS);
export const getRefreshToken = () => localStorage.getItem(REFRESH);

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS, access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
