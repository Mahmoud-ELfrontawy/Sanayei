import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import AppRouter from "./router/AppRouter";
import LogoLoader from "./components/ui/loaders/FullPageLoader";

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ toast after reload
  useEffect(() => {
  const toastData = localStorage.getItem("after_reload_toast");

  if (!toastData) return;

  const { message, type } = JSON.parse(toastData);

  const timer = setTimeout(() => {
    switch (type) {
      case "success":
        toast.success(message);
        break;

      case "error":
        toast.error(message);
        break;

      case "info":
        toast.info(message);
        break;

      default:
        toast(message);
    }

    localStorage.removeItem("after_reload_toast");
  }, 300); // 👈 تأخير بسيط جدًا

  return () => clearTimeout(timer);
}, []);



  return (
    <>
      {/* loader فقط */}
      {loading && <LogoLoader />}

      {/* الموقع */}
      {!loading && <AppRouter />}

      {/* ✅ لازم يكون دايمًا موجود */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        rtl
      />
    </>
  );
}


export default App;
