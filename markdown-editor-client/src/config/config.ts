export class Config {
    VITE_WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:9999";
}
const config = new Config();
export default config;