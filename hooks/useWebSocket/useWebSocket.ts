import { useCallback, useEffect, useRef, useState } from 'react';
import createWebSocket from './webSocket';
import { VesselCoordinate } from '@/shared/types';
import Toast from 'react-native-toast-message';

export const useWebSocket = (url: string) => {
  const [vesselCoordinateData, setVesselCoordinateData] = useState<VesselCoordinate[]>([]);
  const wsRef = useRef<any>(null);

  const onWebsocketClose = useCallback((retry: number) => {
    Toast.show({
      type: 'error',
      text1: 'Connection lost to server',
      text2: `Retrying in 10 seconds... (Attempt ${retry + 1})`,
  });
  }, [url]);
  
  const onWebsocketError = useCallback((error: Event) => {
    Toast.show({
      type: 'error',
      text1: 'Error retrieving data from server',
      text2: `Please reload the app or try again soon. Detailed error can be found in the logs`,
  });
}, [url]);

  useEffect(() => {
    wsRef.current = createWebSocket(url, setVesselCoordinateData, onWebsocketError, onWebsocketClose);
    return () => {
      wsRef.current.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    wsRef.current.send(message);
  };

  return { vesselCoordinateData, sendMessage };
};