"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSession } from "next-auth/react"

interface Notification {
  id: string
  title: string
  message: string
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  isRead: boolean
  createdAt: Date
  data?: any
}

export function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Set up real-time updates
    const eventSource = new EventSource("/api/notifications/stream")
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    }

    return () => {
      eventSource.close()
    }
  }, [session?.user?.id])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500"
      case "HIGH":
        return "bg-orange-500"
      case "MEDIUM":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex-shrink-0 flex space-x-1">
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
