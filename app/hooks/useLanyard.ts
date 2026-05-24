import { useEffect, useState } from "react";

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardActivity {
  type: number;
  id: string;
  name: string;
  state?: string;
  details?: string;
  application_id?: string;
  created_at?: number;
  timestamps?: { start?: number; end?: number };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface LanyardData {
  discord_status: DiscordStatus;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
  listening_to_spotify: boolean;
  kv: Record<string, string>;
  discord_user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    public_flags: number;
  };
  activities: LanyardActivity[];
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps?: { start: number; end: number };
  } | null;
}

export function useLanyard(userId: string): LanyardData | null {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let heartbeat: ReturnType<typeof setInterval>;
    let dead = false;

    const connect = () => {
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string);
        if (msg.op === 1) {
          heartbeat = setInterval(
            () => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ op: 3 })),
            msg.d.heartbeat_interval
          );
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        }
        if (msg.op === 0) setData(msg.d);
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        clearInterval(heartbeat);
        if (!dead) setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      dead = true;
      clearInterval(heartbeat);
      ws?.close();
    };
  }, [userId]);

  return data;
}
