import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echo: Echo<"pusher"> | null = null;
let activeChannelId: string | null = null;
let pusherLogAttached = false;

declare global {
  interface Window {
    Pusher?: typeof Pusher;
  }
}

function pusherLog(message: string, ...args: unknown[]): void {
  if (process.env.NEXT_PUBLIC_PUSHER_LOGS === "false") return;
  const timestamp = new Date().toISOString();
  const prefix = `%c[PUSHER ${timestamp}]`;
  const style = "color:#e24f8a;font-weight:bold";
  if (args.length > 0) {
    console.log(prefix, style, message, ...args);
  } else {
    console.log(prefix, style, message);
  }
}

function attachPusherLogging(instance: Echo<"pusher">): void {
  if (process.env.NEXT_PUBLIC_PUSHER_LOGS === "false") return;
  const connector = instance.connector as {
    pusher?: {
      log?: (message: string) => void;
      connection?: {
        bind_all?: (callback: (eventName: string, data: unknown) => void) => void;
        bind?: (event: string, callback: () => void) => void;
      };
    };
  };

  const pusher = connector.pusher;
  if (!pusher) return;

  if (typeof Pusher.log === "function" && !pusherLogAttached) {
    Pusher.log = (message: string) => pusherLog(message);
  }
  pusherLogAttached = true;

  const connection = pusher.connection;
  if (!connection) return;

  if (typeof connection.bind_all === "function") {
    connection.bind_all((eventName: string, data: unknown) => {
      pusherLog(`connection event "${eventName}"`, data ?? "");
    });
  } else {
    const events = [
      "initialized",
      "connecting",
      "connected",
      "unavailable",
      "failed",
      "disconnected",
      "reconnecting",
      "reconnect_attempt",
      "reconnected",
      "state_change",
      "error",
      "ping",
      "pong",
      "available_offline",
      "unavailable_offline",
      "connection_established",
      "connection_skipped",
      "connection_dead",
    ] as const;
    for (const event of events) {
      connection.bind?.(event, () => {
        pusherLog(`connection event "${event}"`);
      });
    }
  }
}

export function getEcho(): Echo<"pusher"> {
  if (echo) return echo;

  if (typeof window === "undefined") {
    throw new Error("Echo can only be initialized on the client.");
  }

  if (!window.Pusher) {
    window.Pusher = Pusher;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const authEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`;

  pusherLog("initializing Echo", {
    key,
    cluster,
    authEndpoint,
    hasToken: Boolean(window.localStorage.getItem("auth_token")),
  });

  echo = new Echo<"pusher">({
    broadcaster: "pusher",
    key,
    cluster,
    encrypted: true,
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("auth_token") ?? ""}`,
      },
    },
  });

  attachPusherLogging(echo);

  return echo;
}

export function subscribeToUserNotifications(
  userId: number,
  handlers: {
    onNotification: (event: unknown) => void;
    onError?: (error: unknown) => void;
  },
): void {
  if (typeof window === "undefined") return;

  const instance = getEcho();
  const channelName = `private-users.${userId}`;
  const channel = instance.channel(channelName);

  activeChannelId = channelName;

  pusherLog(`subscribing to channel "${channelName}"`);

  const pusherChannel = (
    channel as unknown as {
      subscription?: {
        bind_global?: (callback: (eventName: string, data: unknown) => void) => void;
      };
    }
  ).subscription;

  if (typeof pusherChannel?.bind_global === "function") {
    pusherChannel.bind_global((eventName: string, data: unknown) => {
      pusherLog(`channel "${channelName}" event "${eventName}"`, data ?? "");
      if (eventName.startsWith("pusher:")) return;
      handlers.onNotification(data);
    });
  } else {
    channel.listen(
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      (event: unknown) => handlers.onNotification(event),
    );
  }
  pusherLog(`listening on "${channelName}" for all events`);

  if (typeof channel.error === "function") {
    channel.error((error: unknown) => {
      pusherLog(`channel "${channelName}" error`, error);
      handlers.onError?.(error);
    });
  }
}

export function unsubscribeUserNotifications(userId: number): void {
  if (!echo || typeof window === "undefined") return;
  const channelName = `private.users.${userId}`;
  pusherLog(`unsubscribing from channel "${channelName}"`);
  echo.leaveChannel(channelName);
  if (activeChannelId === channelName) {
    activeChannelId = null;
  }
}

export function disconnectEcho(): void {
  if (!echo || typeof window === "undefined") return;
  pusherLog("disconnecting Echo");
  echo.disconnect();
  echo = null;
  activeChannelId = null;
  pusherLogAttached = false;
}