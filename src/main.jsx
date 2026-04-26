import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/index.js";
import App from "./App.jsx";
import { disableDevTools } from "./utils/disableDevTools.js";

disableDevTools();

createRoot(document.getElementById("root")).render(<App />);
