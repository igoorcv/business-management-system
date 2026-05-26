import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {

  const [products, setProducts] = useState([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  // Busca produtos
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  // Cria produto
  const createProduct = async () => {
    try {

      await axios.post('http://localhost:5000/products', {
        name,
        price,
        category
      });

      setName('');
      setPrice('');
      setCategory('');

      fetchProducts();

    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  // Carrega ao abrir página
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Produtos
      </h1>

      {/* FORMULÁRIO */}

      <div className="mb-6 flex gap-2">

        <input
          type="text"
          placeholder="Nome do produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
        >

          <option value="">
            Selecione categoria
          </option>

          <option value="Pizza">
            Pizza
          </option>

          <option value="Bebida">
            Bebida
          </option>

          <option value="Sobremesa">
            Sobremesa
          </option>

        </select>

        <button
          onClick={createProduct}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Criar
        </button>

      </div>

      {/* LISTA */}

      <div>

        {products.map((product) => (

          <div
            key={product.id}
            className="border p-4 mb-2"
          >

            <h2 className="font-bold">
              {product.name}
            </h2>

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