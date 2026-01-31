/**
 * @file main.tsx
 * @description Application entry point that mounts the React app to the DOM
 * 
 * @dependencies react-dom, App.tsx, index.css
 * @usage Entry point referenced in index.html
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
