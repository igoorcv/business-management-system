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
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Busca produtos
    const fetchProducts = async () => {

        const response = await axios.get(
            'http://localhost:5000/products'
        );

        setProducts(response.data);
    };

    // Adicione produto
    const addProduct = () => {

        if (!selectedProductId) return;

        const product = products.find(
            p => p.id === Number(selectedProductId)
        );

        const existingProduct = selectedProducts.find(
            p => p.product_id === product.id
        );

        if (existingProduct) {

            const updated = selectedProducts.map(item =>
                item.product_id === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + quantity
                    }
                    : item
            );

            setSelectedProducts(updated);

        } else {

            setSelectedProducts([
                ...selectedProducts,
                {
                    product_id: product.id,
                    product_name: product.name,
                    unit_price: product.price,
                    quantity
                }
            ]);
        }

        setSelectedProductId('');
        setQuantity(1);
    };

    // Remove produto
    const removeProduct = (productId) => {

        setSelectedProducts(
            selectedProducts.filter(
                item => item.product_id !== productId
            )
        );

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

            const orderResponse = await axios.post(
                'http://localhost:5000/orders',
                {
                    customer_name: customerName,
                    status: status
                }
            );

            const orderId = orderResponse.data.id;

            for (const item of selectedProducts) {

                await axios.post(
                    'http://localhost:5000/order-items',
                    {
                        order_id: orderId,
                        product_id: item.product_id,
                        quantity: item.quantity
                    }
                );
            }

            setCustomerName('');
            setStatus('Pendente');
            setSelectedProducts([]);
            
            setShowModal(false);

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

    const orderTotal = selectedProducts.reduce(
        (total, item) =>
            total + (item.unit_price * item.quantity),
        0
    );

    const isFormValid =
        customerName.trim() !== '' &&
        selectedProducts.length > 0;

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

                        <div className="bg-white rounded-lg shadow-lg w-[1100px] max-w-[95vw] p-6">

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

                            <div className="border rounded p-3 mb-4">

                                <h3 className="font-bold mb-3">
                                    Produtos
                                </h3>

                                <div className="flex gap-2 mb-4">

                                    <select
                                        value={selectedProductId}
                                        onChange={(e) =>
                                            setSelectedProductId(e.target.value)
                                        }
                                        className="border p-2 flex-1"
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

                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(Number(e.target.value))
                                        }
                                        className="border p-2 w-24"
                                    />

                                    <button
                                        onClick={addProduct}
                                        className="bg-blue-500 text-white px-4"
                                    >
                                        Adicionar
                                    </button>

                                </div>

                                {selectedProducts.length > 0 && (

                                    <table className="w-full border">

                                        <thead>

                                            <tr className="bg-gray-100">

                                                <th className="p-2 text-left">
                                                    Produto
                                                </th>

                                                <th className="p-2">
                                                    Qtde
                                                </th>

                                                <th className="p-2">
                                                    Unitário
                                                </th>

                                                <th className="p-2">
                                                    Subtotal
                                                </th>

                                                <th className="p-2">
                                                    Ações
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {selectedProducts.map(item => (

                                                <tr
                                                    key={item.product_id}
                                                    className="border-t"
                                                >

                                                    <td className="p-2">
                                                        {item.product_name}
                                                    </td>

                                                    <td className="p-2 text-center">

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => {

                                                                const updated =
                                                                    selectedProducts.map(prod =>
                                                                        prod.product_id === item.product_id
                                                                            ? {
                                                                                ...prod,
                                                                                quantity: Number(e.target.value)
                                                                            }
                                                                            : prod
                                                                    );

                                                                setSelectedProducts(updated);
                                                            }}
                                                            className="border w-20 text-center"
                                                        />

                                                    </td>

                                                    <td className="p-2 text-center">
                                                        R$ {item.unit_price.toFixed(2)}
                                                    </td>

                                                    <td className="p-2 text-center">
                                                        R$ {(item.unit_price * item.quantity).toFixed(2)}
                                                    </td>

                                                    <td className="p-2 text-center">

                                                        <button
                                                            onClick={() =>
                                                                removeProduct(item.product_id)
                                                            }
                                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                                        >
                                                            X
                                                        </button>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                )}

                                <div className="text-right mt-4 font-bold text-lg">

                                    Total: R$ {orderTotal.toFixed(2)}

                                </div>

                            </div>

                            {selectedProducts.map((item, index) => {

                                const product = products.find(
                                    p => p.id === item.product_id
                                );

                                return (

                                    <div
                                        key={index}
                                        className="flex gap-2 mt-2"
                                    >

                                        <span>
                                            {product?.name}
                                        </span>

                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => {

                                                const updated = [...selectedProducts];

                                                updated[index].quantity =
                                                    Number(e.target.value);

                                                setSelectedProducts(updated);
                                            }}
                                        />

                                    </div>

                                );
                            })}

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
                                    disabled={!isFormValid}
                                    className={`px-4 py-2 rounded text-white ${
                                        isFormValid
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
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