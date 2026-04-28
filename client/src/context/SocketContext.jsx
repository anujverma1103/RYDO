import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

const getSocketURL = () => {
  const rawURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return rawURL.replace(/\/api$/, '').replace(/\/$/, '');
};

/**
 * Owns the Socket.io client connection and user room join.
 *
 * @param {{children: import('react').ReactNode}} props - Provider props.
 * @returns {JSX.Element}
 */
export const SocketProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user?._id) {
      setSocket(null);
      return undefined;
    }

    const socketInstance = io(getSocketURL(), {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('join-room', user._id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user?._id]);

  const emit = useCallback(
    (event, data) => {
      socket?.emit(event, data);
    },
    [socket]
  );

  const on = useCallback(
    (event, callback) => {
      socket?.on(event, callback);
    },
    [socket]
  );

  const off = useCallback(
    (event, callback) => {
      socket?.off(event, callback);
    },
    [socket]
  );

  const value = useMemo(
    () => ({
      emit,
      off,
      on,
      socket
    }),
    [emit, off, on, socket]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
