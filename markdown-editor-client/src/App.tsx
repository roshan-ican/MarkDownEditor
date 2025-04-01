import { useEffect, useRef, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import "./App.css";
import config from "./config/config";

import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";

marked.use(markedKatex());



const WS_URL = config.VITE_WS_BASE_URL;

function App() {
  const [content, setContent] = useState<string>("**Welcome to collaborative markdown!**");
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

  const handleDownloadHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Markdown Preview</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            background-color: #15202B;
            color: white;
            padding: 2rem;
            line-height: 1.6;
          }
          h1, h2, h3, h4, h5, h6 { font-weight: bold; }
          a { color: #58a6ff; }
        </style>
      </head>
      <body>
        ${marked.parse(content)}
      </body>
      </html>
    `.trim();

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "markdown.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App" data-color-mode="light">
      <h1>📝 Collaborative Markdown Editor</h1>

      <div style={{ margin: "20px auto", maxWidth: "800px" }}>
        <MDEditor value={content} onChange={handleChange} height={500} />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#1e1e1e",
          color: "white",
          borderRadius: "10px",
        }}
        dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
      />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleDownloadHTML}>⬇️ Download as HTML</button>
      </div>
    </div>
  );
}

export default App;