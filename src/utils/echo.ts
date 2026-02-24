import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup Pusher globally for Laravel Echo
(window as any).Pusher = Pusher;

let echoInstance: Echo<any> | null = null;

export const initializeEcho = (token: string) => {
  if (echoInstance) return echoInstance;

  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const authEndpoint = apiUrl
      ? `${apiUrl.replace(/\/$/, '')}/broadcasting/auth`
      : '/api/broadcasting/auth';

    echoInstance = new Echo<any>({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
      forceTLS: true,
      encrypted: true,
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    console.log('📡 [Echo] Initialized successfully');
    return echoInstance;
  } catch (error) {
    console.error('❌ [Echo] Initialization failed:', error);
    return null;
  }
};

export const getEcho = () => echoInstance;

export const disconnectEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    console.log('🔌 [Echo] Disconnected');
  }
};