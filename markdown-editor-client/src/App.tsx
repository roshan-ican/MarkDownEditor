import  { useEffect, useRef, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "./App.css";
import config from "./config/config";

const WS_URL = config.VITE_WS_BASE_URL;

console.log(WS_URL, "WS_URL")

function App() {
  const [content, setContent] = useState<string>(
    "**Welcome to collaborative markdown!**"
  );
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "init" || msg.type === "update") {
        setContent(msg.data);
      }
    };

    socket.onclose = () => {
      console.log("❌ Disconnected from WebSocket server");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleChange = (value?: string) => {
    setContent(value || "");
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "update", data: value }));
    }
  };

  return (
    <div className="App" data-color-mode="light">
      <h1>📝 Collaborative Markdown Editor</h1>
      <div style={{ margin: "20px auto", maxWidth: "800px" }}>
        <MDEditor value={content} onChange={handleChange} height={500} />
      </div>
    </div>
  );
}

export default App;
