// =========================
// PÁGINA DE CLIENTES
// =========================

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Clients() {
  const [clients, setClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    complement: '',
    neighborhood: '',
    is_active: true
  });

  const fetchClients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/clients');
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      phone: '',
      address: '',
      complement: '',
      neighborhood: '',
      delivery_fee: '',
      is_active: true
    });
    setEditingId(null);
  };

  const createClient = async () => {
    await axios.post('http://localhost:5000/clients', {
      ...form,
      is_active: Boolean(form.is_active)
    });

    resetForm();
    setShowModal(false);
    fetchClients();
  };

  const updateClient = async () => {
    await axios.put(`http://localhost:5000/clients/${editingId}`, {
      ...form,
      is_active: Boolean(form.is_active)
    });

    resetForm();
    setShowModal(false);
    fetchClients();
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      address: client.address || '',
      complement: client.complement || '',
      neighborhood: client.neighborhood || '',
      delivery_fee: client.delivery_fee || '',
      is_active: Boolean(client.is_active)
    });
    setShowModal(true);
  };

  const deleteClient = async (id) => {
    await axios.delete(`http://localhost:5000/clients/${id}`);
    fetchClients();
  };

  const isFormValid =
    form.name.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.address.trim() !== '';

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10">

      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Clientes
        </h1>

        <p className="text-gray-500 mt-2">
          Cadastre clientes e gerencie seus endereços.
        </p>
      </div>

      {/* SEARCH + BUTTON */}
      <div className="mb-6 flex justify-between gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-48 bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded"
        >
          Novo cliente
        </button>

        <input
          type="text"
          placeholder="Buscar cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nome</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Telefone</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Endereço</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Bairro</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Taxa de entrega</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">

                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.phone}</td>
                <td className="px-4 py-2">{c.address || '-'}</td>
                <td className="px-4 py-2">{c.neighborhood || '-'}</td>
                <td className="px-4 py-2">{c.delivery_fee || '-'}</td>

                <td className="px-4 py-2">
                  {c.is_active ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                      Inativo
                    </span>
                  )}
                </td>

                <td className="px-4 py-2 text-right">

                  <button
                    onClick={() => startEdit(c)}
                    className="w-30 mr-2 px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => deleteClient(c.id)}
                    className="w-30 px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
                  >
                    Excluir
                  </button>

                </td>

              </tr>
            ))}

            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  Nenhum cliente encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-[600px] rounded-lg shadow-lg">

            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-bold">
                {editingId ? 'Editar cliente' : 'Novo cliente'}
              </h2>
            </div>

            <div className="p-6 space-y-4">

              <input
                placeholder="Nome"
                className="w-full border p-2 rounded"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Telefone"
                className="w-full border p-2 rounded"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                placeholder="Endereço"
                className="w-full border p-2 rounded"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              <input
                placeholder="Complemento"
                className="w-full border p-2 rounded"
                value={form.complement}
                onChange={(e) =>
                  setForm({ ...form, complement: e.target.value })
                }
              />

              <input
                placeholder="Bairro"
                className="w-full border p-2 rounded"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
              />

              <input
                placeholder="Taxa de entrega"
                className="w-full border p-2 rounded"
                value={form.delivery_fee}
                onChange={(e) =>
                  setForm({ ...form, delivery_fee: e.target.value })
                }
              />

              <select
                className="w-full border p-2 rounded"
                value={form.is_active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.value === 'true'
                  })
                }
              >
                <option value={true}>Ativo</option>
                <option value={false}>Inativo</option>
              </select>

            </div>

            <div className="p-4 flex justify-end gap-3 border-t">

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
                disabled={!isFormValid}
                onClick={editingId ? updateClient : createClient}
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

export default Clients;