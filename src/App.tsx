import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "./router/AppRouter"
import { useEffect, useState } from "react";
import LogoLoader from "./components/ui/loaders/FullPageLoader";

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // ثانية إلا ربع — شكل احترافي

    return () => clearTimeout(timer);
  }, []);

    if (loading) {
      return <LogoLoader/>
    }

  return (
    <div>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnHover
      />
    </div>
  )
}

export default App
