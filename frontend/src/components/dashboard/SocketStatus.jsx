import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import socketService from "@/lib/socket";

const SocketStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketService.isEnabled) {
      return;
    }

    socketService.connect();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);

    // Check initial connection status
    setIsConnected(socketService.isConnected);

    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);
    };
  }, []);

  if (!socketService.isEnabled) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
        <WifiOff className="h-3 w-3" />
        <span>Realtime Disabled</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Offline</span>
        </>
      )}
    </Badge>
  );
};

export default SocketStatus;

