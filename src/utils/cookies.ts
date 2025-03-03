// Function to set a cookie
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === "undefined") return; // Check if running on server

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Function to get a cookie
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null; // Check if running on server

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};
