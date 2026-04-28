import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

/**
 * Reads the Socket.io context.
 *
 * @returns {object}
 */
export const useSocket = () => useContext(SocketContext);
