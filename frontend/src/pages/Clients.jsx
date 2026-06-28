// =========================
// PÁGINA DE CLIENTES
// =========================

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

function Clients() {
  const [clients, setClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');

  const statusDropdownRef = useRef(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const [loading, setLoading] = useState(true);


  const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500";

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
    
    } finally {

        setLoading(false);

    }

  };

  useEffect(() => {
    fetchClients();
    setErrorMessage('');
  }, []);

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          statusDropdownRef.current &&
          !statusDropdownRef.current.contains(event.target)
        ) {
          setShowStatusDropdown(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  );

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
    setErrorMessage('');
  };

  const createClient = async () => {
    try {

      await axios.post('http://localhost:5000/clients', {
        ...form,
        is_active: Boolean(form.is_active)
      });

      resetForm();
      setShowModal(false);
      fetchClients();

    } catch (error) {

      setErrorMessage(
        error.response?.data?.message ||
        'Ocorreu um erro ao criar o cliente.'
      );

      console.error(error);
    }
  };

  const updateClient = async () => {
    try {

      await axios.put(`http://localhost:5000/clients/${editingId}`, {
        ...form,
        is_active: Boolean(form.is_active)
      });

      setErrorMessage('');
      resetForm();
      setShowModal(false);
      fetchClients();

    } catch (error) {

      setErrorMessage(
        error.response?.data?.message ||
        'Ocorreu um erro ao atualizar o cliente.'
      );

      console.error(error);
    }
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

      {/* BUTTON + SEARCH */}
      <div className="mb-6 flex justify-between gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-48 border border-purple-600 bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded transition-colors"
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

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Nome</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Telefone</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Bairro</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Endereço</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Complemento</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Taxa de entrega</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          
          <tbody>

            {loading ? (

                <tr>

                    <td
                        colSpan="6"
                        className="py-10"
                    >

                        <LoadingSpinner
                            message="Carregando clientes..."
                        />

                    </td>

                </tr>

            ) : filteredClients.length === 0 ? (

                <tr>

                    <td
                        colSpan="6"
                        className="text-center py-10 text-gray-500"
                    >
                        Nenhum cliente encontrado
                    </td>

                </tr>

            ) : (

                filteredClients.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition">

                    <td className="px-4 py-2 text-sm text-gray-800">{c.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{c.phone}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{c.neighborhood || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{c.address || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{c.complement || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      R$ {Number(
                        c.delivery_fee
                      ).toFixed(2) || '-'}</td>

                    <td className="px-4 py-2">
                      {c.is_active ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-left flex gap-2">

                      <button
                        onClick={() => startEdit(c)}
                        className="w-30 px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteClient(c.id)}
                        className="w-30 px-3 py-1 text-xs border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Excluir
                      </button>

                    </td>

                  </tr>
                ))
            )
          }

        </tbody>

        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-[600px] rounded-lg shadow-lg">

            {/* HEADER */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edição de cliente' : 'Criação de cliente'}
              </h2>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-5 col-span-4">

              {errorMessage && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                  {errorMessage}
                </div>
              )}

              <input
                placeholder="Nome"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Telefone"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                placeholder="Bairro"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
              />

              <input
                placeholder="Endereço"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              <input
                placeholder="Complemento"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.complement}
                onChange={(e) =>
                  setForm({ ...form, complement: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Taxa de entrega"
                value={form.delivery_fee}
                onChange={(e) =>
                  setForm({ ...form, delivery_fee: e.target.value })
                }
              />

              <div 
                ref={statusDropdownRef}
                className="w-full relative"
              >

                <input
                  type="text"
                  readOnly
                  value={
                    form.is_active === true
                      ? 'Ativo'
                      : form.is_active === false
                        ? 'Inativo'
                        : ''
                  }
                  placeholder="Selecione o status"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={inputClass}
                />

                <div className="
                  absolute
                  bottom-full
                  mb-1
                  z-50
                  w-full
                  bg-white
                  rounded-md
                  shadow-lg
                  overflow-hidden
                ">

                  {showStatusDropdown && (
                    <>
                      <div
                        onClick={() => {
                          setForm({ ...form, is_active: true });
                          setShowStatusDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-purple-200"
                      >
                        Ativo
                      </div>

                      <div
                        onClick={() => {
                          setForm({ ...form, is_active: false });
                          setShowStatusDropdown(false);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-purple-200"
                      >
                        Inativo
                      </div>
                    </>
                  )}

                </div>

              </div>

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