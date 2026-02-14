/**
 * Echo / Pusher — DISABLED
 * 
 * The backend does not have a `broadcasting/auth` route, so all private-channel
 * subscriptions fail with 404 and spam the console with errors.
 * 
 * Real-time is replaced by polling fallback in the chat providers
 * (contacts every 15 s, messages every 8 s).
 * 
 * When the backend adds `broadcasting/auth`, uncomment the full implementation
 * and remove the stubs below.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initializeEcho = (_token: string) => {
  return null;
};

export const disconnectEcho = () => {
  // no-op
};

export const getEcho = () => null;

export default {
  initialize: initializeEcho,
  disconnect: disconnectEcho,
  getEcho,
};