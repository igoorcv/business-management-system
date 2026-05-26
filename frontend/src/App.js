import { useEffect, useState } from 'react';

import api from './services/api';

function App() {

  const [products, setProducts] = useState([]);

  useEffect(() => {

    loadProducts();

  }, []);

  async function loadProducts() {

    try {

      const response = await api.get('/products');

      setProducts(response.data);

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Produtos
      </h1>

      <div className="space-y-4">

        {products.map(product => (

          <div
            key={product.id}
            className="border p-4 rounded"
          >

            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>

            <p>
              Categoria: {product.category}
            </p>

            <p>
              R$ {product.price}
            </p>

          </div>

        ))}

      </div>

    </div>

  );
}

export default App;