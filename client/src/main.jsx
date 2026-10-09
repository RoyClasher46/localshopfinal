import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./app/App";
import "./styles/globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import { AuthProvider } from "../src/shared/context/AuthContext";
import { AdminAuthProvider } from "../src/shared/context/AdminAuthContext";
import { CartProvider } from "../src/shared/context/CartContext";
import { ReviewProvider } from "../src/shared/context/ReviewContext";
import { LocationProvider } from "../src/shared/context/LocationContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <ReviewProvider>
              <LocationProvider>
                <App />
              </LocationProvider>
            </ReviewProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
);
