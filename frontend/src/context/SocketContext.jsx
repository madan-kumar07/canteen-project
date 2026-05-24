import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useApp } from './AppContext';

const SocketContext = createContext(null);
const HOST = window.location.hostname;
const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1' || HOST.startsWith('192.168.') || HOST.startsWith('10.');
const BACKEND = import.meta.env.VITE_WS_URL || (IS_LOCAL ? `http://${HOST}:5000` : `https://canteen-backend-zdh1.onrender.com`);

export function SocketProvider({ children }) {
  const { dispatch, toast } = useApp();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [quality, setQuality]     = useState('connecting'); // good | slow | offline | connecting

  useEffect(() => {
    const socket = io(BACKEND, {
      transports: ['websocket', 'polling'],
      reconnectionDelay:    1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: Infinity,
      timeout:              15000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setQuality('good');
      console.log('[WS] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setQuality('offline');
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setQuality('offline');
    });

    socket.on('reconnect', () => {
      setConnected(true);
      setQuality('good');
    });

    /* ── Order status ── */
    socket.on('order_status_changed', ({ orderId, order_id, status, order }) => {
      const id = orderId || order_id;
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId: id, updates: { status, ...(order || {}) } } });
      window.dispatchEvent(new CustomEvent('sc:order_status', { detail: { orderId: id, status, order } }));

      const msgs = {
        Preparing: { type: 'info',    title: 'Order Accepted',    msg: 'Chef is preparing your meal' },
        Ready:     { type: 'success', title: 'Ready for Pickup!', msg: 'Come collect your order now' },
        Completed: { type: 'success', title: 'Order Completed',   msg: 'Enjoy your meal!' },
        Cancelled: { type: 'error',   title: 'Order Cancelled',   msg: 'Your order was cancelled' },
      };
      if (msgs[status]) {
        toast(msgs[status].type, msgs[status].title, msgs[status].msg);
        dispatch({ type: 'ADD_NOTIF', payload: { title: msgs[status].title, msg: msgs[status].msg, orderId: id } });
      }
    });

    /* ── New order (admin) ── */
    socket.on('order_placed', (order) => {
      window.dispatchEvent(new CustomEvent('sc:order_placed', { detail: order }));
    });

    /* ── Menu updates ── */
    socket.on('menu_updated', (data) => {
      if (Array.isArray(data)) {
        window.dispatchEvent(new CustomEvent('sc:menu_refresh', { detail: data }));
      } else {
        window.dispatchEvent(new CustomEvent('sc:menu_item', { detail: data }));
      }
    });

    /* ── Queue updates ── */
    socket.on('queue_updated', (data) => {
      window.dispatchEvent(new CustomEvent('sc:queue', { detail: data }));
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, quality, emit, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() { return useContext(SocketContext); }
