import { useRef } from 'react';
import { useSocketContext } from 'context/SocketContext';

type EventCallback = (...args: any[]) => void;

/**
 * Socket helpers (on, off, emit, disconnect) + connection status. All from Context.
 */
const useSocket = () => {
  const { socket, connected } = useSocketContext();
  const eventsRef = useRef<Record<string, EventCallback>>({});

  const on = (event: string, callback: EventCallback) => {
    if (socket) {
      socket.on(event, callback);
      eventsRef.current[event] = callback;
    }
  };

  const off = (event: string) => {
    if (socket && eventsRef.current[event]) {
      socket.off(event, eventsRef.current[event]);
      delete eventsRef.current[event];
    }
  };

  const emit = (event: string, data?: any) => {
    if (socket) socket.emit(event, data);
  };

  const disconnectSocket = () => {
    if (socket) socket.disconnect();
  };

  return { socket, connected, on, off, emit, disconnectSocket };
};

export default useSocket;
