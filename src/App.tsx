import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import AppRouter from "./router/AppRouter"

function App() {

  return (
    <div>
      <AppRouter/>
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
