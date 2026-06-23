import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Products from './pages/Products';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Home from "./pages/Home";

function App() {

  return (

    <BrowserRouter>

      <div className="p-4 bg-gray-100 flex gap-4">

        <Link to="/home">
          Home
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
          path="/home"
          element={<Home />} 
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/orders"
          element={<Orders />}
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