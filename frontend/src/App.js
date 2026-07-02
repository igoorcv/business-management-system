import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";

function App() {
  return (
    <BrowserRouter>

      <Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        <Routes>

          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />

          <Route
            path="/home"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

        </Routes>

      </Layout>

    </BrowserRouter>


  );
}

export default App;