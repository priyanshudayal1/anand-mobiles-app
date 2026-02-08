/**
 * WebSocket Service for Real-time Notifications
 * Connects to the backend WebSocket server for real-time notification updates
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL, getWebSocketURL } from "../constants/constants";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.pingInterval = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.isConnected = false;
  }

  /**
   * Connect to the WebSocket server
   * @returns {Promise<boolean>} Whether connection was successful
   */
  async connect() {
    if (this.isConnecting || this.isConnected) {
      return this.isConnected;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        this.isConnecting = false;
        return false;
      }

      const wsUrl = `${getWebSocketURL()}?token=${token}`;
      console.log(
        "🔌 WebSocket: Connecting to",
        wsUrl.replace(/token=.*/, "token=***"),
      );

      return new Promise((resolve) => {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log("🔌 WebSocket: ✅ Connected successfully");
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.emit("connected", null);
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            console.log("🔌 WebSocket: 📨 RAW MESSAGE RECEIVED:", event.data);
            const data = JSON.parse(event.data);
            console.log(
              "🔌 WebSocket: 📦 PARSED MESSAGE:",
              JSON.stringify(data, null, 2),
            );
            this.handleMessage(data);
          } catch (error) {
            console.error("🔌 WebSocket: Error parsing message", error);
          }
        };

        this.socket.onerror = (error) => {
          console.error(
            "🔌 WebSocket: ❌ Connection error",
            error?.message || "Unknown error",
          );
          this.emit("error", error);
        };

        this.socket.onclose = (event) => {
          console.log(
            `🔌 WebSocket: Disconnected (code: ${event.code}, reason: ${event.reason || "none"})`,
          );
          this.isConnected = false;
          this.isConnecting = false;
          this.stopPingInterval();
          this.emit("disconnected", { code: event.code, reason: event.reason });

          // For abnormal closures (1006), don't reconnect - likely backend is down
          // For other errors, attempt reconnection if not a clean close
          if (event.code === 1006) {
            this.emit("backend_unavailable", null);
          } else if (
            event.code !== 1000 &&
            event.code !== 4001 &&
            event.code !== 4002 &&
            event.code !== 4003
          ) {
            this.attemptReconnect();
          }
          resolve(false);
        };

        // Timeout for connection
        setTimeout(() => {
          if (!this.isConnected && this.isConnecting) {
            console.error("🔌 WebSocket: ⏱️ Connection timeout after 10s");
            this.socket?.close();
            this.isConnecting = false;
            resolve(false);
          }
        }, 10000); // 10 second timeout
      });
    } catch (error) {
      console.error("❌ WebSocket: Connection error", error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    this.stopPingInterval();
    if (this.socket) {
      this.socket.close(1000, "User disconnect");
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit("max_reconnect_reached", null);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    // Only log first few attempts

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { type } = data;
    console.log("🔌 WebSocket: 🎯 HANDLING MESSAGE TYPE:", type);

    switch (type) {
      case "connection_established":
        console.log("🔌 WebSocket: ✅ Connection acknowledged by server");
        break;

      case "new_notification":
        console.log(
          "🔌 WebSocket: 📬 NEW_NOTIFICATION received:",
          JSON.stringify(data.notification, null, 2),
        );
        this.emit("new_notification", data.notification);
        console.log("🔌 WebSocket: ✅ Emitted 'new_notification' event");
        break;

      case "broadcast_notification":
        console.log(
          "🔌 WebSocket: 📢 BROADCAST_NOTIFICATION received:",
          JSON.stringify(data.notification, null, 2),
        );
        this.emit("broadcast_notification", data.notification);
        console.log("🔌 WebSocket: ✅ Emitted 'broadcast_notification' event");
        break;

      case "notifications_list":
        this.emit("notifications_list", data.notifications);
        break;

      case "unread_count":
      case "unread_count_update":
        this.emit("unread_count", data.unread_count);
        break;

      case "mark_read_result":
        this.emit("mark_read_result", data);
        break;

      case "mark_all_read_result":
        this.emit("mark_all_read_result", data);
        break;

      case "pong":
        // Ping response received
        break;

      case "error":
        console.error("❌ WebSocket: Server error", data.message);
        this.emit("server_error", data.message);
        break;

      default:
      // Unknown message types are ignored
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    console.warn("🔌 WebSocket: Cannot send - not connected");
    return false;
  }

  /**
   * Request notifications list from server
   */
  requestNotifications(limit = 50) {
    return this.send({ type: "get_notifications", limit });
  }

  /**
   * Request unread count from server
   */
  requestUnreadCount() {
    return this.send({ type: "get_unread_count" });
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId) {
    return this.send({ type: "mark_read", notification_id: notificationId });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    return this.send({ type: "mark_all_read" });
  }

  /**
   * Start ping interval to keep connection alive
   */
  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      this.send({ type: "ping" });
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Add an event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Remove an event listener
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if WebSocket is connected
   */
  getIsConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
