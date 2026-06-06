import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/app/store/auth-store";

let socket: Socket | null = null;

export function getRealtimeSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8000", {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  socket.auth = {
    token: useAuthStore.getState().accessToken,
  };

  return socket;
}
