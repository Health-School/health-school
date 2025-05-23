import React from "react";
import { Notification } from "@/components/notification/Notification";

interface NotificationModalProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
}) => (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ background: "rgba(30,41,59,0.35)" }}
  >
    <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-lg relative">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
        onClick={onClose}
      >
        ×
      </button>
      <h2 className="text-2xl font-bold mb-2">{notification.title}</h2>
      <div className="text-xs text-gray-400 mb-1">
        {notification.lectureName} ·{" "}
        {new Date(notification.createdAt).toLocaleString()}
      </div>
      <div
        className="text-gray-700 whitespace-pre-line mt-4"
        dangerouslySetInnerHTML={{ __html: notification.content }}
      />
    </div>
  </div>
);

export default NotificationModal;
