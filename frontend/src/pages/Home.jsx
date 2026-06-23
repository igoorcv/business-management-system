import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const [activeMovement, setActiveMovement] = useState(null);
  const [movements, setMovements] = useState([]);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [movementSummary, setMovementSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState([]);

  // Listar histórico
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
  
  // Buscar moviments abertos
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

  useEffect(() => {
    fetchMovements();
    fetchActiveMovement();
  }, []);
  
  // Abrir novo moviments
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

  // Fechar moviments
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

  // Carrega sumário do movimento de um ID específico
  const fetchCloseSummary = async () => {
    console.log("ACTIVE MOVEMENT:", activeMovement);

    try {
      const id = activeMovement?.id;

      console.log("MOVEMENT ID:", id);

      if (!id) return;

      const [summaryRes, productsRes, driversRes] = await Promise.all([
        axios.get(`http://localhost:5000/movements/${id}/summary`),
        axios.get(`http://localhost:5000/movements/${id}/top-products`),
        axios.get(`http://localhost:5000/movements/${id}/delivery-drivers`)
      ]);

      setMovementSummary(summaryRes.data);
      setTopProducts(productsRes.data);
      setDeliveryDrivers(driversRes.data);

    } catch (error) {
      console.error(error);
    }
  };



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

      {/* SEÇÃO DE EXPEDIENTE */}
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
                Iniciado às {activeMovement.openedAt}
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() => navigate('/orders')}
                className="
                  bg-purple-600
                  hover:bg-purple-800
                  text-white
                  px-5
                  py-2
                  rounded
                  transition-colors
                "
              >
                Acessar pedidos
              </button>

              <button
                onClick={() => {
                  setShowCloseModal(true);
                  fetchCloseSummary();
                }}
                className="
                  bg-red-600
                  hover:bg-red-700
                  text-white
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
                {movementSummary?.total_orders}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Balcão
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {movementSummary?.counter_orders}
                
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Retirada
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {movementSummary?.pickup_orders}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Entrega
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {movementSummary?.delivery_orders}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-gray-500 text-sm">
                Faturamento
              </div>

              <div className="text-2xl font-bold text-green-600 mt-1">
                R$ {Number(movementSummary?.revenue).toFixed(2)}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8 text-center">

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhum expediente aberto
          </h2>

          <p className="text-gray-500 mb-6">
            Inicie um expediente para começar a registrar pedidos.
          </p>

          <button
            onClick={handleOpenMovement}
            className="
              bg-purple-600
              hover:bg-purple-800
              text-white
              px-8
              py-3
              rounded
              transition-colors
            "
          >
            Iniciar expediente
          </button>

        </div>
      )}

      {/* HISTÓRICO */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-800">
            Histórico de expedientes
          </h2>
        </div>

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

              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                Ações
              </th>
            </tr>
          </thead>

          {/* body da table */}
          <tbody>

            {movements.map((movement) => (
              <tr
                key={movement.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >

                <td className="px-4 py-3">
                  {formatDateTime(
                    movement.opened_at
                  )}
                </td>

                <td className="px-4 py-3">
                  {formatDateTime(
                    movement.closed_at
                  )}
                </td>

                <td className="px-4 py-3">
                  {movement.total_orders}
                </td>

                <td className="px-4 py-3">
                  R$ {Number(
                    movement.revenue
                  ).toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  {calculateDuration(
                    movement.opened_at,
                    movement.closed_at
                  )}
                </td>

                <td className="px-4 py-3">

                  {movement.status === 'OPEN' ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                      Aberto
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                      Encerrado
                    </span>
                  )}

                </td>

                <td className="px-4 py-3 text-right">

                  <button
                    className="
                      border
                      border-blue-600
                      text-blue-600
                      hover:bg-blue-50
                      px-3
                      py-1
                      rounded
                      transition-colors
                    "
                  >
                    Visualizar resumo
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL FECHAMENTO */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-[700px] max-w-[95vw]">

            <div className="px-6 py-5 border-b bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                Resumo do expediente
              </h2>
            </div>

            <div className="p-6 space-y-6">

              <div>
                <h3 className="font-semibold mb-2">
                  Pedidos
                </h3>

                <ul className="text-gray-700 space-y-1">
                  <li>Total de pedidos: {movementSummary?.total_orders || 0}</li>
                  <li>Delivery: {movementSummary?.delivery_orders || 0}</li>
                  <li>Balcão: {movementSummary?.counter_orders || 0}</li>
                  <li>Retirada: {movementSummary?.pickup_orders || 0}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Produtos mais vendidos
                </h3>

                <ul className="text-gray-700 space-y-1">
                  {topProducts.map((p, i) => (
                    <li key={i}>
                      * {p.name} - {p.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Entregadores
                </h3>

                <ul className="text-gray-700 space-y-1">
                  {deliveryDrivers.map((d, i) => (
                    <li key={i}>
                      {d.name} - R$ {Number(d.amount).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Faturamento
                </h3>

                <div className="text-3xl font-bold text-green-600">
                  R$ {Number(movementSummary?.revenue || 0).toFixed(2)}
                </div>
              </div>

            </div>

            <div className="p-4 border-t flex justify-end gap-4">

              <button
                onClick={() => setShowCloseModal(false)}
                className="
                  px-5
                  py-2
                  border
                  rounded
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                onClick={handleCloseMovement}
                className="
                  px-5
                  py-2
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  rounded
                "
              >
                Confirmar fechamento
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Home;