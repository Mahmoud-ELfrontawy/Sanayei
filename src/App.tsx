import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import AppRouter from "./router/AppRouter";
import LogoLoader from "./components/ui/loaders/FullPageLoader";
import { useTheme } from "./context/ThemeContext";

function App() {
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate a 1-second loading time

    return () => clearTimeout(timer);
  }, []);

  // ✅ toast after reload
  useEffect(() => {
    if (loading) return; // Wait until loader is gone

    const toastData = localStorage.getItem("after_reload_toast");
    if (!toastData) return;

    try {
      const { message, type } = JSON.parse(toastData);

      setTimeout(() => {
        switch (type) {
          case "success": toast.success(message); break;
          case "error": toast.error(message); break;
          case "info": toast.info(message); break;
          default: toast(message);
        }
      }, 300); // Small delay after loader disappears

      localStorage.removeItem("after_reload_toast");
    } catch (e) {
      localStorage.removeItem("after_reload_toast");
    }
  }, [loading]);

  if (loading) {
    return <LogoLoader />;
  }

  return (
    <>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
    </>
  );
}

export default App;
