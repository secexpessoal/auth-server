import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProvider } from "./app/app.provider";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

root.render(
  <StrictMode>
    <AppProvider />
  </StrictMode>,
);
