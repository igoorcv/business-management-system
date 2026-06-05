import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Orders() {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customerName, setCustomerName] = useState('');
    //const [totalPrice, setTotalPrice] = useState('');
    const [status, setStatus] = useState('Pendente');

    const [editingId, setEditingId] = useState(null);

    // Busca pedidos
    const fetchOrders = async () => {

        try {

            const response = await axios.get(
                'http://localhost:5000/orders'
            );

            setOrders(response.data);

        } catch (error) {

            console.error(
                'Erro ao buscar pedidos:',
                error
            );

        }

    };

    // Cria pedido
    const createOrder = async () => {

        try {

            console.log({
                customer_name: customerName,
                //total_price: totalPrice,
                status: status
            });

            await axios.post(
                'http://localhost:5000/orders',
                {
                    customer_name: customerName,
                    //total_price: totalPrice,
                    status: status
                }
            );

            setCustomerName('');
            //setTotalPrice('');
            setStatus('Pendente');

            fetchOrders();

        } catch (error) {

            console.error(
                'Erro ao criar pedido:',
                error
            );

        }

    };

    // Deleta pedido
    const deleteOrder = async (id) => {

        try {

            await axios.delete(
                `http://localhost:5000/orders/${id}`
            );

            fetchOrders();

        } catch (error) {

            console.error(
                'Erro ao deletar pedido:',
                error
            );

        }

    };

    // Edita pedido
    const editOrder = (order) => {

        console.log(order);

        setEditingId(order.id);

        setCustomerName(order.customer_name || '');

        //setTotalPrice(order.total_price || '');

        setStatus(order.status || 'Pendente');

    };

    const updateOrder = async () => {
        console.log('UPDATE EXECUTADO');
        console.log('editingId:', editingId);

        console.log({
            customer_name: customerName,
            //total_price: totalPrice,
            status: status
        });

        try {

            await axios.put(
                `http://localhost:5000/orders/${editingId}`,
                {
                    customer_name: customerName,
                    //total_price: totalPrice,
                    status: status
                }
            );

            fetchOrders();

            setEditingId(null);

            setCustomerName('');
            //setTotalPrice('');
            setStatus('Pendente');

        } catch (error) {

            console.error(
                'Erro ao atualizar pedido:',
                error
            );

        }

    };

    useEffect(() => {

        fetchOrders();

    }, []);

    return (

        <div className="p-10">

            <h1 className="text-3xl font-bold mb-6">
                Pedidos
            </h1>

            {/* FORMULÁRIO */}

            <div className="flex gap-2 mb-6">

                <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(e) =>
                        setCustomerName(e.target.value)
                    }
                    className="border p-2"
                />

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    className="border p-2"
                >

                    <option value="Pendente">
                        Pendente
                    </option>

                    <option value="Em preparo">
                        Em preparo
                    </option>

                    <option value="Saiu para entrega">
                        Saiu para entrega
                    </option>

                    <option value="Entregue">
                        Entregue
                    </option>

                </select>

                <button
                    onClick={
                        editingId
                            ? updateOrder
                            : createOrder
                    }
                    className="bg-green-500 text-white px-4 py-2"
                >
                    {
                        editingId
                            ? 'Atualizar Pedido'
                            : 'Criar Pedido'
                    }
                </button>

            </div>

            {/* LISTA */}

            <div>

                {orders.map((order) => (

                    <div
                        key={order.id}
                        className="border p-4 mb-2"
                    >

                        <h2 className="font-bold">
                            {order.customer_name}
                        </h2>

                        <p>
                            Total: R$ {order.total?.toFixed(2)}
                        </p>

                        <p>
                            Status: {order.status}
                        </p>

                        <button
                            onClick={() => editOrder(order)}
                            className="bg-yellow-500 text-white px-3 py-1 mt-2 mr-2"
                        >
                            Editar
                        </button>

                        <button
                             onClick={() => navigate(`/orders/${order.id}`)}
                            className="bg-blue-500 text-white px-3 py-1 mt-2 mr-2"
                        >
                        Ver Itens
                        </button>

                        <button
                            onClick={() => deleteOrder(order.id)}
                            className="bg-red-500 text-white px-3 py-1 mt-2"
                        >
                            Excluir
                        </button>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default Orders;