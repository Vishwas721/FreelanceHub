import React from "react";
import ReactDOM from "react-dom/client";
import AuthProvider from "./AuthContext";
import { DndProvider } from "react-dnd"; // ✅ Import drag-drop provider
import { HTML5Backend } from "react-dnd-html5-backend"; // ✅ Import backend
import App from "./components/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider> {/* ✅ Keeps authentication context */}
    <DndProvider backend={HTML5Backend}> {/* ✅ Enables drag-and-drop */}
      <App />
    </DndProvider>
  </AuthProvider>
);