import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalMonitoring } from "./lib/monitoring";

setupGlobalMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
