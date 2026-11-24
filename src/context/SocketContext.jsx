import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

const runtimeEnv = typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__ : {};
const serverUrl =
  runtimeEnv.API_URL ||
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:3001`;

const appEnv = runtimeEnv.APP_ENV || import.meta.env.VITE_APP_ENV || 'development';
const appVersion = runtimeEnv.APP_VERSION || import.meta.env.VITE_APP_VERSION || '1.0.0';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [role, setRole] = useState(null);
  const [presetsData, setPresetsData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let sessionId = localStorage.getItem('catan_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('catan_session_id', sessionId);
    }

    const newSocket = io(serverUrl, {
      auth: { sessionId },
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('gameState', (state) => {
      setGameState(state);
    });

    newSocket.on('timerTick', (timeLeft) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          moduleStates: {
            ...prev.moduleStates,
            timer: {
              ...prev.moduleStates.timer,
              timeLeft,
            },
          },
        };
      });
    });

    newSocket.on('serverInfo', (info) => {
      setServerIp(info.localIp);
    });

    newSocket.on('sessionRestored', (restoredRole) => {
      setRole(restoredRole);
    });

    newSocket.on('presetsData', (data) => {
      setPresetsData(data);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        gameState,
        serverIp,
        role,
        setRole,
        presetsData,
        isAdmin,
        setIsAdmin,
        appEnv,
        appVersion,
        apiUrl: serverUrl,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
