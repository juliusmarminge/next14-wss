"use client";

import { useEffect, useState } from "react";

const useWebSocket = (
  url: string,
  opts: {
    onMessage: (e: MessageEvent) => void;
  }
) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log("connected");
    };
    ws.onclose = () => {
      console.log("disconnected");
    };
    ws.onmessage = opts.onMessage;

    setWs(ws);

    return () => {
      ws.close();
      setWs(null);
    };
  }, [url]);

  return ws;
};

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useWebSocket("ws://localhost:3000", {
    onMessage: (e) => setMessages((messages) => [...messages, e.data]),
  });

  return (
    <div>
      <span>Ready? {ws?.readyState}</span>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const message = new FormData(form).get("message");
          if (message === null) return;

          ws?.send(message?.toString());
          form.reset();
        }}
      >
        <input type="text" name="message" placeholder="write something" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
