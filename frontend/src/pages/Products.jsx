// =========================
// PÁGINA DE PRODUTOS
// =========================

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const categoryOrder = {
  Bebida: 1,
  Esfiha: 2,
  Pizza: 3,
  Sobremesa: 4
};

const categories = ['Bebida', 'Esfiha', 'Pizza', 'Sobremesa'];
const states = [
  { label: 'Ativo', value: true },
  { label: 'Inativo', value: false }
];


function Products() {
  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    code: '',
    name: '',
    price: '',
    category: '',
    is_active: true
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({ code: '', name: '', price: '', category: '', is_active: true });
    setEditingId(null);
  };

  const createProduct = async () => {
    await axios.post('http://localhost:5000/products', {
      ...form,
      is_active: Boolean(form.is_active)
    });
    resetForm();
    setShowModal(false);
    fetchProducts();
  };

  const updateProduct = async () => {
    await axios.put(`http://localhost:5000/products/${editingId}`, {
      ...form,
      is_active: Boolean(form.is_active)
    });
    console.log("ENVIANDO PRO BACK:", form);
    resetForm();
    setShowModal(false);
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      code: product.code || '',
      name: product.name,
      price: product.price,
      category: product.category,
      is_active: Boolean(product.is_active)
    });
    setShowModal(true);
  };

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:5000/products/${id}`);
    fetchProducts();
  };

  const isFormValid =
    form.name.trim() !== '' &&
    form.price !== '' &&
    form.category !== '';

  // 🔎 FILTRO DE BUSCA POR NOME
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 ordenação por categoria
  const sortedProducts = [...filteredProducts].sort(
    (a, b) => categoryOrder[a.category] - categoryOrder[b.category]
  );

  return (
    <div className="p-10">

      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Produtos
        </h1>
      
      {/* SEARCH */}
      <div className="
        mb-6
        flex
        flex justify-between
        gap-2"
      >

        <button
          onClick={() => setShowModal(true)}
          className="
            w-48
            bg-purple-600
            hover:bg-purple-800
            text-white
            px-4
            py-2
            rounded
            transition-colors
            "
        >
          Novo produto
        </button>

        <input
          type="text"
          placeholder="Buscar produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-64
            max-w-md
            border
            border-gray-300
            rounded-md
            px-3
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-purple-500
            bg-white
          "
        />

      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Categoria
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Código
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Nome
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Preço
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Estado
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>

            {sortedProducts.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >

                <td className="px-4 py-2 text-sm font-medium text-gray-700">
                  {p.category}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800">
                  {p.code || '-'}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800">
                  {p.name}
                </td>

                <td className="px-4 py-2 text-sm text-gray-700">
                  R$ {Number(p.price).toFixed(2)}
                </td>

                <td className="px-4 py-2 text-sm">
                  {p.is_active ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                      Inativo
                    </span>
                  )}
                </td>

                <td className="px-4 py-2 text-right whitespace-nowrap">

                  <button
                    onClick={() => startEdit(p)}
                    className="
                      flex-1
                      bg-white
                      border
                      border-blue-700
                      hover:bg-blue-50
                      text-blue-700
                      px-3
                      py-0.8
                      mr-2
                      rounded
                      transition-colors  
                    "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="
                      flex-1
                      bg-white
                      border
                      border-red-600
                      text-red-600
                      hover:bg-red-50
                      px-3
                      py-0.8
                      mr-2
                      rounded
                      transition-colors
                    "
                  >
                    Excluir
                  </button>

                </td>

              </tr>
            ))}

            {sortedProducts.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-500"
                >
                  Nenhum produto encontrado
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[95vw]">

            {/* HEADER */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edição de produto' : 'Criação de produto'}
              </h2>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5">

              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Código (opcional)"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
              />

              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Nome"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Preço"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />

              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="">Selecione a categoria</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                value={form.is_active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.value === "true"
                  })
                }
              >
                <option value={true}>Ativo</option>
                <option value={false}>Inativo</option>
              </select>

            </div>

            {/* FOOTER */}
            <div className="p-4 px-6 border-t flex justify-end gap-4">

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="
                  w-32
                  px-8
                  py-2
                  rounded
                  border
                  border-purple-600
                  text-purple-600
                  bg-white
                  hover:bg-purple-50
                  transition-colors
                  "
              >
                Cancelar
              </button>

              <button
                onClick={editingId ? updateProduct : createProduct}
                disabled={!isFormValid}
                className={`
                  w-32
                  px-8
                  py-2
                  rounded
                  text-white
                  transition-colors
                  ${
                    isFormValid
                      ? 'bg-purple-600 hover:bg-purple-800'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Products;