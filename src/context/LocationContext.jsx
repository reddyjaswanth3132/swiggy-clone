import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

// Default location: Koramangala, Bangalore
const DEFAULT_LOCATION = {
    latitude: 12.9352,
    longitude: 77.6245,
    address: 'Koramangala, Bangalore',
    city: 'Bangalore'
};

export function LocationProvider({ children }) {
    const [location, setLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('swiggy_location');
            return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
        } catch {
            return DEFAULT_LOCATION;
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // prompt | granted | denied

    // Persist location to localStorage
    useEffect(() => {
        localStorage.setItem('swiggy_location', JSON.stringify(location));
    }, [location]);

    // Check geolocation permission status
    useEffect(() => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                setPermissionStatus(result.state);
                result.onchange = () => setPermissionStatus(result.state);
            }).catch(() => { });
        }
    }, []);

    // Detect location using GPS
    const detectLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    // Reverse geocode using Nominatim (free, no API key)
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
                        );
                        const data = await res.json();
                        const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        const city = data.address?.city || data.address?.town || data.address?.village || 'Bangalore';
                        const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || '';

                        const newLocation = {
                            latitude,
                            longitude,
                            address: area ? `${area}, ${city}` : address,
                            city
                        };
                        setLocation(newLocation);
                        setPermissionStatus('granted');
                        resolve(newLocation);
                    } catch (e) {
                        // Fallback if reverse geocoding fails
                        const newLocation = {
                            latitude,
                            longitude,
                            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                            city: 'Bangalore'
                        };
                        setLocation(newLocation);
                        setPermissionStatus('granted');
                        resolve(newLocation);
                    }
                    setLoading(false);
                },
                (err) => {
                    switch (err.code) {
                        case 1: setError('Location permission denied. Please enable it in browser settings.'); break;
                        case 2: setError('Location unavailable. Please try again.'); break;
                        case 3: setError('Location request timed out. Please try again.'); break;
                        default: setError('Failed to detect location.');
                    }
                    setPermissionStatus('denied');
                    setLoading(false);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }, []);

    // Set location manually with address search
    const setManualLocation = useCallback(async (searchText) => {
        if (!searchText.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`
            );
            const data = await res.json();

            if (data.length > 0) {
                const result = data[0];
                const newLocation = {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    address: result.display_name.split(',').slice(0, 3).join(', '),
                    city: result.display_name.split(',').slice(-3, -2)[0]?.trim() || 'Bangalore'
                };
                setLocation(newLocation);
                setLoading(false);
                return newLocation;
            } else {
                setError('Location not found. Please try a different search.');
                setLoading(false);
                return null;
            }
        } catch (e) {
            setError('Failed to search location. Please try again.');
            setLoading(false);
            return null;
        }
    }, []);

    // Set location by selecting from predefined cities
    const setCity = useCallback((cityName) => {
        const cities = {
            'Bangalore': { latitude: 12.9352, longitude: 77.6245, address: 'Koramangala, Bangalore', city: 'Bangalore' },
            'Mumbai': { latitude: 19.0760, longitude: 72.8777, address: 'Andheri, Mumbai', city: 'Mumbai' },
            'Delhi': { latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, Delhi', city: 'Delhi' },
            'Hyderabad': { latitude: 17.3850, longitude: 78.4867, address: 'Banjara Hills, Hyderabad', city: 'Hyderabad' },
            'Chennai': { latitude: 13.0827, longitude: 80.2707, address: 'T Nagar, Chennai', city: 'Chennai' },
            'Pune': { latitude: 18.5204, longitude: 73.8567, address: 'Kothrud, Pune', city: 'Pune' },
            'Kolkata': { latitude: 22.5726, longitude: 88.3639, address: 'Park Street, Kolkata', city: 'Kolkata' },
            'Ahmedabad': { latitude: 23.0225, longitude: 72.5714, address: 'CG Road, Ahmedabad', city: 'Ahmedabad' }
        };
        if (cities[cityName]) {
            setLocation(cities[cityName]);
        }
    }, []);

    return (
        <LocationContext.Provider value={{
            location,
            loading,
            error,
            permissionStatus,
            detectLocation,
            setManualLocation,
            setCity,
            setLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (!context) throw new Error('useLocation must be used within LocationProvider');
    return context;
}
