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
      console.log("🔌 WebSocket: Already connected or connecting");
      return this.isConnected;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.log("🔌 WebSocket: No user token, skipping connection");
        this.isConnecting = false;
        return false;
      }

      const wsUrl = `${getWebSocketURL()}?token=${token}`;
      console.log("🔌 WebSocket: Connecting to", getWebSocketURL());

      return new Promise((resolve) => {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log("✅ WebSocket: Connected successfully");
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.emit("connected", null);
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("🔌 WebSocket: Error parsing message", error);
          }
        };

        this.socket.onerror = (error) => {
          console.error("❌ WebSocket: Error", error);
          this.emit("error", error);
        };

        this.socket.onclose = (event) => {
          console.log(
            "🔌 WebSocket: Connection closed",
            event.code,
            event.reason,
          );
          this.isConnected = false;
          this.isConnecting = false;
          this.stopPingInterval();
          this.emit("disconnected", { code: event.code, reason: event.reason });

          // Attempt reconnection if not a clean close
          if (
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
            console.log("🔌 WebSocket: Connection timeout");
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
    console.log("🔌 WebSocket: Disconnecting...");
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
      console.log("🔌 WebSocket: Max reconnect attempts reached");
      this.emit("max_reconnect_reached", null);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `🔌 WebSocket: Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

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

    switch (type) {
      case "connection_established":
        console.log("🔌 WebSocket: Connection acknowledged by server");
        break;

      case "new_notification":
        console.log(
          "📬 WebSocket: New notification received",
          data.notification,
        );
        this.emit("new_notification", data.notification);
        break;

      case "notifications_list":
        console.log("📋 WebSocket: Notifications list received", data.total);
        this.emit("notifications_list", data.notifications);
        break;

      case "unread_count":
      case "unread_count_update":
        console.log("🔢 WebSocket: Unread count update", data.unread_count);
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
        console.log("🔌 WebSocket: Unknown message type", type, data);
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
