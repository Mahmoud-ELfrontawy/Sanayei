import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.tsx";

import { AuthProvider } from "./context/AuthContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";

// ✅ Providers الجديدة بعد تقسيم الشات
import { UserChatProvider } from "./context/UserChatProvider.tsx";
import { CraftsmanChatProvider } from "./context/CraftsmanChatProvider.tsx";

/* ================= React Query Client ================= */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ================= Render App ================= */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>

          {/* ✅ لف التطبيق بالاتنين علشان يدعم user + craftsman */}
          <UserChatProvider>
            <CraftsmanChatProvider>
              <App />
            </CraftsmanChatProvider>
          </UserChatProvider>

        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
