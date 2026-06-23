import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Products from './pages/Products';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import OrderDetails from "./pages/OrderDetails";

function App() {

  return (

    <BrowserRouter>

      <div className="p-4 bg-gray-100 flex gap-4">

        <Link to="/orders">
          Pedidos
        </Link>

        <Link to="/products">
          Produtos
        </Link>

        <Link to="/clients">
          Clientes
        </Link>

      </div>

      <Routes>

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route 
          path="/orders/:id"
          element={<OrderDetails />} 
        />

        <Route 
          path="/clients"
          element={<Clients />} 
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;