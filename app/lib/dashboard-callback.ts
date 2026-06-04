/** Dashboard URL that restores a serial lookup after sign-in or registration. */
export function dashboardCallbackWithSerial(serial: string): string {
  const params = new URLSearchParams({ serial: serial.trim() });
  return `/dashboard?${params.toString()}`;
}

export function encodeDashboardCallback(serial: string): string {
  return encodeURIComponent(dashboardCallbackWithSerial(serial));
}
