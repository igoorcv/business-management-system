import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Products from './pages/Products';
import Orders from './pages/Orders';

function App() {

  return (

    <BrowserRouter>

      <div className="p-4 bg-gray-100 flex gap-4">

        <Link to="/products">
          Produtos
        </Link>

        <Link to="/orders">
          Pedidos
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

      </Routes>

    </BrowserRouter>

  );

}

export default App;