import { useState, useEffect, useCallback } from 'react';
import { updateCraftsmanLocation } from '../Api/technicians.api';
import { useAuth } from './useAuth';

export const useLocation = () => {
    const { /* user, */ userType, isAuthenticated } = useAuth();
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setError(null);
            },
            (err) => {
                setError(err.message);
            }
        );
    }, []);

    // Effect for periodic location updates (for craftsmen)
    useEffect(() => {
        if (isAuthenticated && userType === 'craftsman') {
            const interval = setInterval(() => {
                navigator.geolocation.getCurrentPosition((position) => {
                    updateCraftsmanLocation(
                        position.coords.latitude,
                        position.coords.longitude
                    ).catch(err => console.error("Failed to update location", err));
                });
            }, 30000); // 30 seconds interval (adjustable)

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, userType]);

    useEffect(() => {
        getPosition();
    }, [getPosition]);

    return { location, error, refreshLocation: getPosition };
};
