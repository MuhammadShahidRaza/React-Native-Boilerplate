import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getKeychainItem } from 'utils/storage';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';

export interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, connected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!ENV_CONSTANTS.SOCKET_BASE_URL || !ENV_CONSTANTS.IS_ALPHA_PHASE) return;

    let socketInstance: Socket | null = null;

    const init = async () => {
      const token = await getKeychainItem(VARIABLES.USER_TOKEN);
      const url = `${ENV_CONSTANTS.SOCKET_BASE_URL}?token=${token ?? ''}`;

      socketInstance = io(url, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketInstance.on('connect', () => setConnected(true));
      socketInstance.on('disconnect', () => setConnected(false));
      socketInstance.on('connect_error', () => setConnected(false));

      setSocket(socketInstance);
    };

    init();

    return () => {
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
      setSocket(null);
      setConnected(false);
    };
  }, []);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
