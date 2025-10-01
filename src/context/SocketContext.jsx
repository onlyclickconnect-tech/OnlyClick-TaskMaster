import { createContext, useContext, useEffect, useRef, useState } from "react";
// Removed socket.io-client import - no backend connections
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dummy socket connection - always connected in demo mode
    if (isLoggedIn) {
      setConnected(true);
      setError(null);
    } else {
      setConnected(false);
    }
  }, [isLoggedIn]);

  // Dummy socket methods
  const emitEvent = (event, data) => {
  };

  const onEvent = (event, callback) => {
  };

  const offEvent = (event, callback) => {
  };

  return (
    <SocketContext.Provider 
      value={{ 
        socket: socketRef.current, 
        connected, 
        error,
        emitEvent,
        onEvent,
        offEvent
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

