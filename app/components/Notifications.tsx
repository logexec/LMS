import { useEffect } from "react";
import Pusher from "pusher-js";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  wsHost: "localhost",
  wsPort: 6001,
  forceTLS: false,
  disableStats: true,
  cluster: "", // Propiedad vacía para evitar el error de TypeScript
});

const channel = pusher.subscribe("notifications");
channel.bind("NewNotification", function (data: { message: string }) {
  console.log("Notificación recibida:", data.message);
});

useEffect(() => {
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, []);
