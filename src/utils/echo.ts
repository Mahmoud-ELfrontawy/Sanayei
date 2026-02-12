import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import { BASE_URL } from '../Api/chat.api';

// Make Pusher available globally for Laravel Echo
(window as any).Pusher = Pusher;

// Enable Pusher logging - useful for debugging
Pusher.logToConsole = true;

// Echo instance - will be initialized after login
let echoInstance: Echo<any> | null = null;

export const initializeEcho = (token: string) => {
    if (echoInstance) return;

    // Remove /api from BASE_URL to get root URL for broadcasting/auth
    const rootUrl = BASE_URL.replace('/api', '');

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'd95fa9401ed812570532',
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'eu',
        forceTLS: true,
        authorizer: (channel: any, _options: any) => {
            return {
                authorize: (socketId: string, callback: Function) => {
                    axios.post(`${rootUrl}/broadcasting/auth`, {
                        socket_id: socketId,
                        channel_name: channel.name
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        callback(true, error);
                    });
                }
            };
        }
    });

};

export const disconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};

export const getEcho = (): Echo<any> | null => {
    return echoInstance;
};

export default {
    initialize: initializeEcho,
    disconnect: disconnectEcho,
    getEcho,
};
