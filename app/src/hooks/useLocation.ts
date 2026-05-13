import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ coords: null, loading: false, error: '위치 권한이 필요합니다' });
        return;
      }

      // 첫 위치 빠르게 가져오기
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        coords: { lat: initial.coords.latitude, lng: initial.coords.longitude },
        loading: false,
        error: null,
      });

      // 이후 실시간 업데이트
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
        (loc) => {
          setState(prev => ({
            ...prev,
            coords: { lat: loc.coords.latitude, lng: loc.coords.longitude },
          }));
        }
      );
    })();

    return () => { sub?.remove(); };
  }, []);

  return state;
}
