import { useCallback, useEffect, useState } from "react";
import type { Notification } from "@observatoire360/shared";
import { api, ApiRequestError } from "@/app/lib/api";

interface UnreadCountResponse {
    count: number;
}

interface PaginatedNotifications {
    data: Notification[];
    total: number;
    page: number;
    pageSize: number;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await api.get<UnreadCountResponse>("/notifications/unread-count");
            setUnreadCount(data.count);
        } catch {
            // Silently ignore polling errors
        }
    }, []);

    // Poll unread count every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30_000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.get<PaginatedNotifications>("/notifications");
            setNotifications(data.data);
            setUnreadCount(data.data.filter((n) => !n.isRead).length);
        } catch (err) {
            setError(
                err instanceof ApiRequestError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : "Erreur inattendue."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // Best-effort
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            // Best-effort
        }
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}
