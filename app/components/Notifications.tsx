import { useEffect, useState } from "react";
import echo from "@/services/echo.service";

const Notifications = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    echo
      .channel("requests")
      .listen(".request.updated", (event: { request: any }) => {
        setNotifications((prev) => [
          `Solicitud ${event.request.unique_id} ha sido actualizada.`,
          ...prev,
        ]);
      });

    return () => {
      echo.leaveChannel("requests");
    };
  }, []);

  return (
    <div>
      {notifications.map((notif, index) => (
        <div key={index}>{notif}</div>
      ))}
    </div>
  );
};

export default Notifications;
