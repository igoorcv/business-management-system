// =========================
// PÁGINA PRINCIPAL
// =========================

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MovementSummaryModal from '../components/MovementSummaryModal';

function Home() {


  // =========================================================
  // Referências para funções, estados e variáveis auxiliares 
  // =========================================================

  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [activeMovement, setActiveMovement] = useState(null);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [movementSummary, setMovementSummary] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  

  // ==================================================
  // Functions para conectar ações do front-end e APIs
  // ==================================================

  // Consulta todos os expediente independente do status
  const fetchMovements = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/movements'
      );

      setMovements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Consulta um expediente específico que possui status OPEN
  const fetchActiveMovement = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/movements/active'
      );

      setActiveMovement(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Cria um novo expediente na base de dados
  const handleOpenMovement = async () => {
    try {
      await axios.post(
        'http://localhost:5000/movements/open'
      );

      await fetchActiveMovement();
      await fetchMovements();

      navigate('/orders');
    } catch (error) {
      console.error(error);
    }
  };

  // Atualiza o status de um expediente específico a partir do ID
  const handleCloseMovement = async () => {
    try {

      await axios.post(
        `http://localhost:5000/movements/${activeMovement.id}/close`
      );

      setShowCloseModal(false);

      await fetchActiveMovement();
      await fetchMovements();

    } catch (error) {
      console.error(error);
    }
  };

  // Consulta informações de um movement_id específico a partir do ID para ser utilizado na modal de Sumário 
  const fetchCloseSummary = async () => {

    try {

      if (!activeMovement?.id) return;

      const response = await axios.get(
        `http://localhost:5000/movements/${activeMovement.id}/summary`
      );

      setMovementSummary(response.data);

    } catch (error) {
      console.error(error);
    }

  };


  // =====================================
  // Functions para tratar dados das APIs 
  // =====================================

  // Recebe uma data em formato de string e a converte para um formato amigável: DD/MM/AAAA, HH:MM
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcula quanto tempo passou entre data de início e término, convertendo para um formato amigável: 2h 45min
  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = endDate - startDate;

    const hours = Math.floor(
      diffMs / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) /
      (1000 * 60)
    );

    return `${hours}h ${minutes}min`;
  };


  // ==========================================================================================================================
  // Executa as seguintes functions assim que o componente é carregado pela 1ª vez, mesmo que não exista interações de clicks 
  // ==========================================================================================================================
  useEffect(() => {
    fetchMovements();
    fetchActiveMovement();
  }, []);



  // ==========================
  // Renderização do front-end
  // ==========================
  return (
    <div className="p-10">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Início
        </h1>

        <p className="text-gray-500 mt-2">
          Gerencie o expediente e acompanhe o histórico do seu negócio.
        </p>
      </div>

      {/* BODY - Detalhes do expediente em andamento */}
      {activeMovement ? (

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">

          {/* EXPEDIENTE EM ANDAMENTO */}
          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>

                <span className="font-semibold text-green-700">
                  Expediente em andamento
                </span>
              </div>

              <p className="text-gray-600">
                Iniciado às {formatDateTime(activeMovement.opened_at)}
              </p>
            </div>

            <div className="flex justify-between gap-3">

              <button
                onClick={() => navigate('/orders')}
                className="
                  w-48
                  bg-purple-600
                  hover:bg-purple-800
                  text-white
                  px-5
                  py-2
                  rounded
                  transition-colors
                "
              >
                Ver pedidos
              </button>

              <button
                onClick={() => {
                  setSelectedMovement(activeMovement);
                  setShowCloseModal(true);
                  fetchCloseSummary();
                }}
                className="
                  w-48
                  border
                  border-red-600
                  hover:bg-red-50
                  text-red-600
                  px-5
                  py-2
                  rounded
                  transition-colors
                "
              >
                Encerrar expediente
              </button>

            </div>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-5 gap-4 mt-6">

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Total
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {activeMovement?.total_orders || 0}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Balcão
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {activeMovement?.counter_orders || 0}

              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Retirada
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {activeMovement?.pickup_orders || 0}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Entrega
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {activeMovement?.delivery_orders || 0}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Faturamento
              </div>

              <div className="text-2xl font-bold text-green-600 mt-1">
                R$ {Number(activeMovement?.revenue || 0).toFixed(2)}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="
          mb-6 
          flex 
          justify-between
          gap-2
        "
        >
          <button
            onClick={handleOpenMovement}
            className="w-48 border border-purple-600 bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded transition-colors"
          >
            Iniciar expediente
          </button>

        </div>
      )}

      {/* BODY - Histórico de expedientes
      <div className="px-0 py-4">
        <h2 className="font-semibold text-gray-800">
          Histórico de expedientes
        </h2>
      </div>
      */}

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          {/* header da table */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Início
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Término
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Pedidos
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Faturamento
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Duração
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>

          {/* body da table */}
          <tbody>

            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >

                <td className="px-4 py-2 text-sm text-gray-800">
                  {formatDateTime(
                    movement.opened_at
                  )}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800">
                  {formatDateTime(
                    movement.closed_at
                  )}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800 font-medium">
                  {movement.total_orders}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800 font-medium">
                  R$ {Number(
                    movement.revenue
                  ).toFixed(2)}
                </td>

                <td className="px-4 py-2 text-sm text-gray-800">
                  {calculateDuration(
                    movement.opened_at,
                    movement.closed_at
                  )}
                </td>

                <td className="px-4 py-2">

                  {movement.status === 'OPEN' ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                      Aberto
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                      Encerrado
                    </span>
                  )}

                </td>

                <td className="px-4 py-2 text-left flex gap-2">

                  <button
                    onClick={async () => {
                      const response = await axios.get(
                        `http://localhost:5000/movements/${movement.id}/summary`
                      );
                      setMovementSummary(response.data);
                      setSelectedMovement(movement);
                      setShowCloseModal(true);
                    }}
                    className="w-30 px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Ver resumo
                  </button>

                  <button
                    onClick={() => navigate(`/orders?movement_id=${movement.id}`)}
                    className="w-30 px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Ver pedidos
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      
      <MovementSummaryModal
          open={showCloseModal}
          summary={movementSummary}
          showConfirmButton={
              selectedMovement?.status === 'OPEN'
                  ? true
                  : false
          }
          onClose={() => setShowCloseModal(false)}
          onConfirmClose={handleCloseMovement}
      />

    </div>
  );
}

export default Home;