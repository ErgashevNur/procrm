import { useState } from "react";
import { useNotification } from "../hooks/useNotification";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotification();

  return (
    <div className="relative inline-block">
      {/* 🔔 Bell tugmasi */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-11 right-0 z-50 max-h-[480px] w-80 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-gray-400 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Bildirishnomalar
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-700"
              >
                Hammasini o'qildi ✓
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              <svg
                className="mr-2 h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Yuklanmoqda...
            </div>
          ) : notifications.length === 0 ? (
            /* Bo'sh holat */
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-2 h-10 w-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="text-sm">Bildirishnoma yo'q</span>
            </div>
          ) : (
            /* Notification list */
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors ${!n.isRead ? "cursor-pointer bg-blue-50 hover:bg-blue-100" : "cursor-default bg-gray-500 text-black"} `}
                >
                  {/* O'qilmagan nuqta */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${n.isRead ? "bg-transparent" : "bg-blue-500"}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${n.isRead ? "font-normal text-gray-600" : "font-semibold text-gray-800"}`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-300">
                      {new Date(n.createdAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
