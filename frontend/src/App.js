import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";

function App() {
  return (
    <BrowserRouter>

      <Layout>

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