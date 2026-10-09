import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from "./app/components/shared/ErrorBoundary.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallbackTitle="Error crítico en la aplicación">
    <App />
  </ErrorBoundary>
);