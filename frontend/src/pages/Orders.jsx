import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Orders() {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [status, setStatus] = useState('Pendente');
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [products, setProducts] = useState([]);

    // Busca produtos
    const fetchProducts = async () => {

        const response = await axios.get(
            'http://localhost:5000/products'
        );

        setProducts(response.data);
    };

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
                status: status
            });

            await axios.post(
                'http://localhost:5000/orders',
                {
                    customer_name: customerName,
                    status: status
                }
            );

            setCustomerName('');
            setStatus('Pendente');

            fetchOrders();

            setShowModal(false);

        } catch (error) {

            console.error(
                'Erro ao criar pedido:',
                error
            );

        }

    };

    // Cria items do pedido
    

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

        setStatus(order.status || 'Pendente');

        setShowModal(true);

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
            setStatus('Pendente');
            setShowModal(false);

        } catch (error) {

            console.error(
                'Erro ao atualizar pedido:',
                error
            );

        }

    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    return (

        <div className="p-10">

            <h1 className="text-3xl font-bold mb-6">
                Pedidos
            </h1>

            {/* BOTÕES NO HEADER */}
            <div className="mb-6">

                <button
                    onClick={() => {
                        setEditingId(null);
                        setCustomerName('');
                        setStatus('Pendente');
                        setShowModal(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Novo Pedido
                </button>


            </div>

            {/* GRID */}

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
                            Total: R$ {order.total_price?.toFixed(2)}
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

            {/* MODAL */}
            {
                showModal && (

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

                        <div className="bg-white p-6 rounded-lg w-[450px] shadow-lg">

                            <h2 className="text-xl font-bold mb-4">

                                {editingId
                                    ? 'Editar Pedido'
                                    : 'Novo Pedido'}

                            </h2>
                            
                            <input
                                type="text"
                                placeholder="Nome do cliente"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                className="border p-2 w-full mb-3"
                            />

                            <select
                                onChange={(e) => {

                                    const productId = Number(e.target.value);

                                    if (!productId) return;

                                    setSelectedProducts([
                                        ...selectedProducts,
                                        {
                                            product_id: productId,
                                            quantity: 1
                                        }
                                    ]);
                                }}
                            >
                                <option value="">
                                    Selecione um produto
                                </option>

                                {products.map(product => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                                className="border p-2 w-full mb-4"
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

                            <div className="flex justify-end gap-2">

                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={() => {

                                        if (editingId) {
                                            updateOrder();
                                        } else {
                                            createOrder();
                                        }

                                        setShowModal(false);

                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    {
                                        editingId
                                            ? 'Atualizar'
                                            : 'Criar'
                                    }
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default Orders;