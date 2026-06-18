import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { NumericFormat } from 'react-number-format';
import {
    DragDropContext,
    Droppable,
    Draggable
} from '@hello-pangea/dnd';

function Orders() {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [status, setStatus] = useState('Em preparo');
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('balcao');

    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [complement, setComplement] = useState('');
    const [district, setDistrict] = useState('');

    const [clientId, setClientId] = useState(null);
    const [clientFound, setClientFound] = useState(false);

    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('');
    const [discount, setDiscount] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');

    const [paymentSearch, setPaymentSearch] = useState('');
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

    const statusColumns = [
        'Em preparo',
        'Pronto',
        'Saiu para entrega',
        'Finalizado'
    ];

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
                    product_price: product.price,
                    quantity,
                    observation: ''
                }
            ]);
        }

        setSelectedProductId('');
        setProductSearch('');
        setQuantity(1);
        setShowProductDropdown(false);
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

            if (!paymentMethod) {
                alert('Forma de pagamento é obrigatória');
                return;
            }

            if (!customerName.trim()) {
                alert('Nome do cliente é obrigatório');
                return;
            }

            if (selectedProducts.length === 0) {
                alert('Adicione pelo menos um produto');
                return;
            }

            if (orderType === 'entrega') {

                if (!phone.trim()) {
                    alert('Telefone é obrigatório');
                    return;
                }

                if (!address.trim()) {
                    alert('Endereço é obrigatório');
                    return;
                }

                if (!district.trim()) {
                    alert('Bairro é obrigatório');
                    return;
                }

            }

            let currentClientId = clientId;

            if (
                orderType === 'entrega' &&
                !currentClientId
            ) {

                const response = await axios.post(
                    'http://localhost:5000/clients',
                    {
                        nome: customerName,
                        telefone: phone,
                        endereco: address,
                        complemento: complement,
                        bairro: district
                    }
                );

                currentClientId = response.data.id;
            }

            const orderResponse = await axios.post(
                'http://localhost:5000/orders',
                {
                    order_type: orderType,
                    client_id: currentClientId,
                    customer_name: customerName,
                    phone: phone,
                    status: status,
                    payment_method: paymentMethod,
                    discount: Number(discount || 0),
                    delivery_fee: Number(deliveryFee || 0)
                }
            );

            const orderId = orderResponse.data.id;

            for (const item of selectedProducts) {

                await axios.post(
                    'http://localhost:5000/order-items',
                    {
                        order_id: orderId,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        observation: item.observation
                    }
                );
            }

            setCustomerName('');
            setPhone('');
            setAddress('');
            setComplement('');
            setDistrict('');

            setClientId(null);
            setClientFound(false);

            setOrderType('balcao');

            setStatus('Em preparo');
            setSelectedProducts([]);

            setPaymentMethod('');
            setPaymentSearch('');
            setShowPaymentDropdown(false);

            setDiscount(0);
            setDeliveryFee(0);
            
            setShowModal(false);

            fetchOrders();

        } catch (error) {

            console.error(
                'Erro ao criar pedido:',
                error.response?.data || error
            );

            alert('Erro ao criar pedido');

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
        setStatus(order.status || 'Em preparo');

        setPaymentMethod(order.payment_method || '');
        setPaymentSearch(order.payment_method || '');

        setDiscount(order.discount || 0);
        setDeliveryFee(order.delivery_fee || 0);

        setSelectedProducts(
            order.items.map(item => ({
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_price: item.product_price,
                quantity: item.quantity,
                observation: item.observation || ''
            }))
        );

        setShowModal(true);

    };

    const updateOrder = async () => {
        console.log('UPDATE EXECUTADO');
        console.log('editingId:', editingId);

        console.log({
            customer_name: customerName,
            status: status
        });

        try {

            await axios.put(
                `http://localhost:5000/orders/${editingId}`,
                {
                    customer_name: customerName,
                    status: status,
                    payment_method: paymentMethod,
                    discount: Number(discount || 0),
                    delivery_fee: Number(deliveryFee || 0),
                    items: selectedProducts
                }
            );

            fetchOrders();

            setEditingId(null);

            setCustomerName('');
            setStatus('Em preparo');
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

    // Close modal
    const resetForm = () => {
        setCustomerName('');
        setPhone('');
        setAddress('');
        setComplement('');
        setDistrict('');

        setClientId(null);
        setClientFound(false);

        setOrderType('balcao');

        setStatus('Em preparo');

        setSelectedProducts([]);

        setSelectedProductId('');
        setProductSearch('');
        setShowProductDropdown(false);

        setPaymentMethod('');
        setPaymentSearch('');
        setShowPaymentDropdown(false);

        setDiscount('');
        setDeliveryFee('');

        setQuantity(1);

    }; 
    
    // Soma total do pedido
    const orderTotal = selectedProducts.reduce(
        (total, item) =>
            total + (item.product_price * item.quantity),
        0
    );

    const finalTotal =
        orderTotal
        - Number(discount || 0)
        + (orderType === 'entrega'
            ? Number(deliveryFee || 0)
            : 0);

    const isFormValid =
        customerName.trim() !== '' &&
        selectedProducts.length > 0 &&
        paymentMethod.trim() !== '';

    // Busca client por phone
    const handlePhoneChange = async (e) => {

        const phoneValue = e.target.value;

        setPhone(phoneValue);

        if (phoneValue.length < 10) {
            return;
        }

        try {

            const response = await axios.get(
                `http://localhost:5000/clients/search?phone=${phoneValue}`
            );

            const client = response.data;

            if (client) {

                setClientFound(true);

                setClientId(client.id);

                setCustomerName(client.nome);

                setAddress(client.endereco || '');

                setComplement(client.complemento || '');

                setDistrict(client.bairro || '');

            } else {

                setClientFound(false);

                setClientId(null);

            }

        } catch (error) {

            console.error(error);

        }

    };

    // Atualiza status arrastando card
    const handleDragEnd = async (result) => {

        if (!result.destination) {
            return;
        }

        const orderId = Number(
            result.draggableId
        );

        const newStatus =
            result.destination.droppableId;

        try {

            await axios.put(
                `http://localhost:5000/orders/${orderId}/status`,
                {
                    status: newStatus
                }
            );

            fetchOrders();

        } catch (error) {

            console.error(
                'Erro ao mover pedido:',
                error
            );

        }

    };

    // Estilização do campo INPUT
    const inputClass =
        "border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500";

    const selectClass =
        "border border-gray-300 rounded-md px-3 py-2 pr-12 w-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-400";

    const quantityOptions = [
        { value: 1/3, label: '⅓' },
        { value: 1/2, label: '½' },

        ...Array.from(
            { length: 500 },
            (_, i) => ({
                value: i + 1,
                label: String(i + 1)
            })
        )
    ];

    const filteredProducts = products.filter(product =>
        product.name
            .toLowerCase()
            .includes(productSearch.toLowerCase())
    );

    const productDropdownRef = useRef(null);

    const clearSelectedProduct = () => {
        setSelectedProductId('');
        setProductSearch('');
        setShowProductDropdown(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                productDropdownRef.current &&
                !productDropdownRef.current.contains(event.target)
            ) {
                setShowProductDropdown(false);
            }
            if (
                paymentDropdownRef.current &&
                !paymentDropdownRef.current.contains(event.target)
            ) {
                setShowPaymentDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    const paymentOptions = [
        'Dinheiro',
        'PIX',
        'Cartão de Crédito',
        'Cartão de Débito',
        'Vale Refeição',
        'Vale Alimentação'
    ];

    const filteredPayments = paymentOptions.filter(payment =>
        payment
            .toLowerCase()
            .includes(paymentSearch.toLowerCase())
    );
    
    const clearPaymentMethod = () => {
        setPaymentMethod('');
        setPaymentSearch('');
        setShowPaymentDropdown(false);
    };

    const paymentDropdownRef = useRef(null);

    const getStatusColor = (status) => {

        switch (status) {

            case 'Em preparo':
                return 'border-orange-400 bg-orange-50';

            case 'Pronto':
                return 'border-yellow-400 bg-yellow-10';
                
            case 'Saiu para entrega':
                return 'border-blue-400 bg-blue-50';

            case 'Finalizado':
                return 'border-green-600 bg-green-50';

            default:
                return 'border-gray-300 bg-gray-50';
        }

    };

    const getOrderTypeBadge = (type) => {

        switch (type) {

            case 'entrega':
                return 'bg-blue-100 text-blue-800';

            case 'retirada':
                return 'bg-green-100 text-green-800';

            case 'balcao':
                return 'bg-purple-100 text-purple-800';

            default:
                return 'bg-gray-100 text-gray-800';
        }

    };

    const getWaitingTime = (createdAt) => {

        if (!createdAt) return 0;

        const created = new Date(createdAt);

        const now = new Date();

        return Math.floor(
            (now - created) / 1000 / 60
        );
    };

    const getWaitingColor = (minutes) => {

        if (minutes >= 40)
            return 'text-red-600';

        if (minutes >= 20)
            return 'text-orange-600';

        return 'text-green-600';

    };


    // FRONT-END
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
                        setStatus('Em preparo');
                        setShowModal(true);
                    }}
                    className="
                    bg-purple-600
                    hover:bg-purple-800
                    text-white
                    px-4
                    py-2
                    rounded
                    flex-1
                    transition-colors"
                >
                    Novo pedido
                </button>


            </div>
            
            {/* KANBAN */}
            <DragDropContext
                onDragEnd={handleDragEnd}
            >

                <div
                    className="
                        flex
                        gap-4
                        overflow-x-auto
                        pb-4
                        items-start
                    "
                >

                    {statusColumns.map(status => (

                        <Droppable
                            key={status}
                            droppableId={status}
                        >
                            {/* Card */}
                            {(provided) => (
                                
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="
                                        min-w-[280px]
                                        flex-1
                                        bg-slate-50
                                        rounded-xl
                                        p-4
                                        border
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            justify-between
                                            items-center
                                            mb-4
                                        "
                                    >

                                        <h2
                                            className="
                                                font-bold
                                                text-lg
                                            "
                                        >
                                            {status}
                                        </h2>
                                       
                                       {/* Contador */}
                                        <span
                                            className="
                                                bg-purple-800
                                                text-white
                                                rounded-full
                                                w-8
                                                h-8
                                                flex
                                                items-center
                                                justify-center
                                                text-sm
                                                font-semibold
                                            "
                                        >

                                            {
                                                orders.filter(
                                                    o =>
                                                        o.status === status
                                                ).length
                                            }
                                        </span>

                                    </div>

                                    {
                                        orders
                                            .filter(
                                                order =>
                                                    order.status === status
                                            )
                                            .map(
                                                (
                                                    order,
                                                    index
                                                ) => (

                                                <Draggable
                                                    key={order.id}
                                                    draggableId={String(order.id)}
                                                    index={index}
                                                >
                                                    {(provided) => {

                                                        const waitingMinutes =
                                                            getWaitingTime(order.created_at);

                                                        return (

                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`
                                                                    bg-white
                                                                    rounded-xl
                                                                    shadow-sm
                                                                    hover:shadow-lg
                                                                    transition-all
                                                                    p-3
                                                                    mb-3
                                                                    border-l-4
                                                                    ${getStatusColor(order.status)}
                                                                `}
                                                            >

                                                                {/* Cabeçalho */}
                                                                <div className="flex justify-between mb-3">

                                                                    {/* Coluna esquerda */}
                                                                    <div className="flex flex-col gap-2">

                                                                        <span className="font-semibold text-sm text-gray-700">
                                                                            Comanda #{order.id}
                                                                        </span>

                                                                        <div
                                                                            className="
                                                                                font-semibold
                                                                                text-gray-800
                                                                                text-base
                                                                                py-1
                                                                            "
                                                                        >
                                                                            {order.customer_name}
                                                                        </div>

                                                                        <div className="text-base text-gray-500">
                                                                            🍕 {order.items?.length || 0} itens
                                                                        </div>

                                                                    </div>

                                                                    {/* Coluna direita */}
                                                                    <div
                                                                        className="
                                                                            flex
                                                                            flex-col
                                                                            items-end
                                                                            gap-2
                                                                        "
                                                                    >

                                                                        <span
                                                                            className={`
                                                                                text-sm
                                                                                font-semibold
                                                                                ${getWaitingColor(waitingMinutes)}
                                                                            `}
                                                                        >
                                                                            ⏱ {waitingMinutes} min
                                                                        </span>

                                                                        <span
                                                                            className={`
                                                                                inline-flex
                                                                                items-center
                                                                                px-3
                                                                                py-1
                                                                                rounded-full
                                                                                text-sm
                                                                                font-medium
                                                                                ${getOrderTypeBadge(order.order_type)}
                                                                            `}
                                                                        >
                                                                            {order.order_type}
                                                                        </span>

                                                                        <div
                                                                            className="
                                                                                text-lg
                                                                                font-bold
                                                                                text-purple-700
                                                                            "
                                                                        >
                                                                            R$ {Number(order.total_price || 0).toFixed(2)}
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                                {/* Botões */}
                                                                <div
                                                                    className="
                                                                        flex
                                                                        gap-2
                                                                        mt-5
                                                                    "
                                                                >

                                                                    <button
                                                                        onClick={() => editOrder(order)}
                                                                        className="
                                                                            flex-1
                                                                            bg-purple-600
                                                                            hover:bg-purple-800
                                                                            text-white
                                                                            px-4
                                                                            py-1
                                                                            rounded
                                                                            transition-colors
                                                                        "
                                                                    >
                                                                        Editar
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => {

                                                                                e.stopPropagation();

                                                                                if (
                                                                                    window.confirm(
                                                                                        'Deseja excluir este pedido?'
                                                                                    )
                                                                                ) {
                                                                                    deleteOrder(order.id);
                                                                                }

                                                                            }}
                                                                        className="
                                                                            flex-1
                                                                            bg-white
                                                                            border
                                                                            border-red-600
                                                                            text-red-600
                                                                            hover:bg-red-50
                                                                            px-4
                                                                            py-1
                                                                            rounded
                                                                            transition-colors
                                                                        "
                                                                    >
                                                                        Cancelar
                                                                    </button>

                                                                </div>
                                                                

                                                            </div>

                                                        );

                                                    }}
                                                </Draggable>

                                            ))

                                    }

                                    {
                                        provided.placeholder
                                    }

                                </div>

                            )}

                        </Droppable>

                    ))}

                </div>

            </DragDropContext>

            {/* MODAL */}
            {
                showModal && (

                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                        <div className="
                            bg-white
                            rounded-lg
                            shadow-lg
                            w-[1100px]
                            max-w-[95vw]
                            max-h-[90vh]
                            flex
                            flex-col
                        ">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">

                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingId
                                        ? 'Edição de pedido'
                                        : 'Criação de pedido'}
                                </h2>

                            </div>
                            
                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6">

                                {/* Informações do cliente */}
                                <div className="border rounded-lg p-4 mb-4">

                                    <h3 className="font-semibold mb-3">
                                        Informações do cliente
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3">
                                        Qual tipo de pedido você deseja fazer?
                                    </p>

                                    <div className="flex gap-2 mb-6">

                                        <button
                                            type="button"
                                            onClick={() => setOrderType('balcao')}
                                            className={`px-4 py-2 rounded border ${
                                                orderType === 'balcao'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            Balcão
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setOrderType('entrega')}
                                            className={`px-4 py-2 rounded border ${
                                                orderType === 'entrega'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            Entrega
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setOrderType('retirada')}
                                            className={`px-4 py-2 rounded border ${
                                                orderType === 'retirada'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            Retirada
                                        </button>

                                    </div>
                                    
                                    {/* Campos */}
                                    {orderType === 'balcao' && (
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-4">
                                                <input
                                                    className={inputClass}
                                                    placeholder="Nome"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {orderType === 'retirada' && (
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-6">
                                                <input
                                                    className={inputClass}
                                                    placeholder="Nome"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-6">
                                                <input
                                                    className={inputClass}
                                                    placeholder="Telefone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {orderType === 'entrega' && (
                                        
                                        <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-2">
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Telefone"
                                                        value={phone}
                                                        onChange={handlePhoneChange}
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Nome"
                                                        value={customerName}
                                                        onChange={(e) => setCustomerName(e.target.value)}
                                                    />
                                                </div>

                                                <div className="col-span-4">
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Endereço"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Complemento"
                                                        value={complement}
                                                        onChange={(e) => setComplement(e.target.value)}
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <input
                                                        className={inputClass}
                                                        placeholder="Bairro"
                                                        value={district}
                                                        onChange={(e) => setDistrict(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                    )}

                                </div>
                                
                                {/* Informações do pedido */}
                                <div className="border rounded-lg p-4 mb-4">

                                    <h3 className="font-semibold mb-3">
                                        Informações do pedido
                                    </h3>
                                    
                                    {/* Campos */}
                                    <div className="grid grid-cols-12 gap-4 mb-4">
                                        
                                        {/* Selecione um produto */}
                                        <div 
                                            ref={productDropdownRef}
                                            className="col-span-7 relative">

                                            <input
                                                type="text"
                                                value={productSearch}
                                                placeholder="Selecione um produto"
                                                onChange={(e) => {
                                                    setProductSearch(e.target.value);
                                                    setSelectedProductId('');
                                                    setShowProductDropdown(true);
                                                }}
                                                onFocus={() => setShowProductDropdown(true)}
                                                className={inputClass}
                                            />

                                            {selectedProductId && (
                                                <button
                                                    type="button"
                                                    onClick={clearSelectedProduct}
                                                    className="
                                                        absolute
                                                        right-3
                                                        top-1/2
                                                        -translate-y-1/2
                                                        text-gray-400
                                                        hover:text-red-500
                                                        font-bold
                                                        text-lg
                                                    "
                                                >
                                                    ×
                                                </button>
                                            )}

                                            {showProductDropdown && (
                                                <div
                                                    className="
                                                        absolute
                                                        z-50
                                                        w-full
                                                        mt-1
                                                        bg-white
                                                        border
                                                        border-gray-300
                                                        rounded-md
                                                        shadow-lg
                                                        max-h-60
                                                        overflow-y-auto
                                                    "
                                                >
                                                    {filteredProducts.map(product => (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => {
                                                                setSelectedProductId(product.id);
                                                                setProductSearch(product.name);
                                                                setShowProductDropdown(false);
                                                            }}
                                                            className="
                                                                px-3
                                                                py-2
                                                                cursor-pointer
                                                                hover:bg-purple-200
                                                            "
                                                        >
                                                            {product.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Quantidade */}
                                        <div className="col-span-2">
                                            <Select
                                                options={quantityOptions}
                                                value={
                                                    quantityOptions.find(
                                                        option => option.value === quantity
                                                    )
                                                }
                                                onChange={(selected) =>
                                                    setQuantity(selected?.value)
                                                }
                                                placeholder="Qtd."
                                                isSearchable
                                                styles={{
                                                    control: (provided) => ({
                                                        ...provided,
                                                        minHeight: '42px',
                                                        height: '42px',
                                                        borderColor: '#E9D5FF',
                                                        borderRadius: '0.375rem',
                                                        boxShadow: 'none',
                                                    }),

                                                    valueContainer: (provided) => ({
                                                        ...provided,
                                                        height: '42px',
                                                        padding: '0 12px',
                                                    }),

                                                    input: (provided) => ({
                                                        ...provided,
                                                        margin: '0px',
                                                        padding: '0px',
                                                    }),

                                                    indicatorsContainer: (provided) => ({
                                                        ...provided,
                                                        height: '42px',
                                                    }),

                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        backgroundColor: state.isFocused
                                                            ? '#E9D5FF' // bg-purple-200
                                                            : 'white',
                                                        //color: 'black'
                                                        color: state.isSelected
                                                                ? 'black'
                                                                : '#6B21A8', // bg-purple-800
                                                    }),
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Botão: Adicionar item */}
                                        <div className="col-span-3">
                                            <button
                                                onClick={addProduct}
                                                className="w-full h-full bg-purple-600 text-white rounded-md hover:bg-purple-800"
                                            >
                                                + Adicionar item
                                            </button>
                                        </div>

                                    </div>

                                    {/* Grid */}
                                    {selectedProducts.length > 0 && (

                                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                                            
                                            <table className="w-full">
                                                
                                                {/* Header */}
                                                <thead>

                                                    <tr className="bg-gray-100 border-b border-gray-200">

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Produto
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Qtde
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Observação
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Unitário
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Subtotal
                                                        </th>

                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                            Ações
                                                        </th>

                                                    </tr>

                                                </thead>

                                                {/* Body */}
                                                <tbody>

                                                    {/* Styles grid */}
                                                    {selectedProducts.map(item => (
                                                        
                                                        <tr
                                                            key={item.product_id}
                                                            className="
                                                                border-b
                                                                border-gray-100
                                                                hover:bg-gray-50
                                                                transition-colors
                                                            "
                                                        >
                                                            
                                                            {/* Produto */}
                                                            <td className="px-4 py-2 text-left text-sm">
                                                                {item.product_name}
                                                            </td>

                                                            {/* Quantidade */}
                                                            <td className="px-4 py-2 text-left text-sm">

                                                                <div className="w-24">

                                                                    <Select
                                                                        options={quantityOptions}
                                                                        value={
                                                                            quantityOptions.find(
                                                                                option => option.value === item.quantity
                                                                            )
                                                                        }
                                                                        onChange={(selected) => {

                                                                            const updated =
                                                                                selectedProducts.map(prod =>
                                                                                    prod.product_id === item.product_id
                                                                                        ? {
                                                                                            ...prod,
                                                                                            quantity: selected?.value
                                                                                        }
                                                                                        : prod
                                                                                );

                                                                            setSelectedProducts(updated);

                                                                        }}
                                                                        isSearchable
                                                                        maxMenuHeight={180}
                                                                        styles={{
                                                                            control: (provided) => ({
                                                                                ...provided,
                                                                                minHeight: '38px',
                                                                                height: '38px',
                                                                                borderColor: '#E9D5FF',
                                                                                borderRadius: '0.375rem',
                                                                                boxShadow: 'none',
                                                                            }),

                                                                            valueContainer: (provided) => ({
                                                                                ...provided,
                                                                                height: '38px',
                                                                                padding: '0 8px',
                                                                            }),

                                                                            input: (provided) => ({
                                                                                ...provided,
                                                                                margin: '0',
                                                                                padding: '0',
                                                                            }),

                                                                            indicatorsContainer: (provided) => ({
                                                                                ...provided,
                                                                                height: '38px',
                                                                            }),

                                                                            option: (provided, state) => ({
                                                                                ...provided,
                                                                                backgroundColor: state.isFocused
                                                                                    ? '#E9D5FF'
                                                                                    : 'white',

                                                                                color: state.isSelected
                                                                                    ? 'black'
                                                                                    : '#6B21A8',
                                                                            }),
                                                                            menuPortal: (provided) => ({
                                                                                ...provided,
                                                                                zIndex: 9999,
                                                                            })
                                                                        }}
                                                                        menuPortalTarget={document.body}
                                                                        menuPosition="fixed"
                                                                    />

                                                                </div>

                                                            </td>
                                                            
                                                            {/* Observação */}
                                                            <td className="px-4 py-2 text-left text-sm">

                                                                <div className="w-90">
                                                                    <input
                                                                            className={inputClass}
                                                                            placeholder="Digite aqui"
                                                                            value={item.observation || ''}
                                                                            onChange={(e) => {
                                                                                const updated =
                                                                                    selectedProducts.map(prod =>
                                                                                        prod.product_id === item.product_id
                                                                                            ? {
                                                                                                ...prod,
                                                                                                observation: e.target.value
                                                                                            }
                                                                                            : prod
                                                                                    );

                                                                                setSelectedProducts(updated);
                                                                            }}
                                                                        />
                                                                </div>
                                                            </td>
                                
                                                            {/* Unitário */}
                                                            <td className="px-4 py-2 text-left text-sm">
                                                                R$ {item.product_price.toFixed(2)}
                                                            </td>
                                                            
                                                            {/* Subtotal */}
                                                            <td className="px-4 py-2 text-left text-sm font-medium">
                                                                R$ {(item.product_price * item.quantity).toFixed(2)}
                                                            </td>

                                                            {/* Ações */}
                                                            <td className="px-4 py-2 text-left text-sm">

                                                                <button
                                                                    onClick={() =>
                                                                        removeProduct(item.product_id)
                                                                    }
                                                                    
                                                                    className="
                                                                        bg-red-500
                                                                        hover:bg-red-600
                                                                        text-white
                                                                        px-3
                                                                        py-1
                                                                        rounded-md
                                                                        transition-colors
                                                                    "
                                                                >
                                                                    X
                                                                </button>

                                                            </td>

                                                        </tr>

                                                    ))}

                                                </tbody>

                                            </table>
                                        </div>
                                    )}

                                </div>

                                {/* Informações de pagamento */}
                                <div className="border rounded-lg p-4 mb-4">

                                    <h3 className="font-semibold mb-3">
                                        Informações de pagamento
                                    </h3>

                                    {/* Campos */}
                                    <div className="grid grid-cols-12 gap-4">

                                        {/* Forma de pagamento */}                            
                                        <div
                                            ref={paymentDropdownRef}
                                            className="col-span-4"
                                        >    

                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Forma de pagamento
                                        </label>

                                            <div className="col-span-4 relative">

                                                <input
                                                    type="text"
                                                    value={paymentSearch}
                                                    placeholder="Selecione um pagamento"
                                                    onChange={(e) => {
                                                        setPaymentSearch(e.target.value);
                                                        setPaymentMethod('');
                                                        setShowPaymentDropdown(true);
                                                    }}
                                                    onFocus={() => setShowPaymentDropdown(true)}
                                                    className={inputClass}
                                                />

                                                {paymentMethod && (
                                                    <button
                                                        type="button"
                                                        onClick={clearPaymentMethod}
                                                        className="
                                                            absolute
                                                            right-3
                                                            top-1/2
                                                            -translate-y-1/2
                                                            text-gray-400
                                                            hover:text-red-500
                                                            font-bold
                                                            text-lg
                                                        "
                                                    >
                                                        ×
                                                    </button>
                                                )}

                                                {showPaymentDropdown && (

                                                    <div
                                                        className="
                                                            absolute
                                                            bottom-full
                                                            mb-1
                                                            z-50
                                                            w-full
                                                            bg-white
                                                            border
                                                            border-gray-300
                                                            rounded-md
                                                            shadow-lg
                                                            max-h-60
                                                            overflow-y-auto
                                                        "
                                                    >

                                                        {filteredPayments.map(payment => (

                                                            <div
                                                                key={payment}
                                                                onClick={() => {
                                                                    setPaymentMethod(payment);
                                                                    setPaymentSearch(payment);
                                                                    setShowPaymentDropdown(false);
                                                                }}
                                                                className="
                                                                    px-3
                                                                    py-2
                                                                    cursor-pointer
                                                                    hover:bg-purple-200
                                                                "
                                                            >
                                                                {payment}
                                                            </div>

                                                        ))}

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                        {/* Desconto */}
                                        <div className="col-span-2">

                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Desconto
                                            </label>

                                            <div className="relative">

                                                <span
                                                    className="
                                                        absolute
                                                        left-3
                                                        top-1/2
                                                        -translate-y-1/2
                                                        text-gray-500
                                                    "
                                                >
                                                    R$ -
                                                </span>

                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={discount}
                                                    onChange={(e) =>
                                                        setDiscount(e.target.value)
                                                    }
                                                    placeholder="0,00"
                                                    className="
                                                        border
                                                        border-gray-300
                                                        rounded-md
                                                        pl-10
                                                        pr-3
                                                        py-2
                                                        w-full
                                                        focus:outline-none
                                                        focus:ring-2
                                                        focus:ring-purple-500
                                                    "
                                                />

                                            </div>

                                        </div>

                                        {/* Taxa entrega */}
                                        {orderType === 'entrega' && (

                                            <div className="col-span-2">

                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Taxa de entrega
                                                </label>

                                                <div className="relative">

                                                    <span
                                                        className="
                                                            absolute
                                                            left-3
                                                            top-1/2
                                                            -translate-y-1/2
                                                            text-gray-500
                                                        "
                                                    >
                                                        R$
                                                    </span>

                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={deliveryFee}
                                                        onChange={(e) =>
                                                            setDeliveryFee(e.target.value)
                                                        }
                                                        placeholder="0,00"
                                                        className="
                                                            border
                                                            border-gray-300
                                                            rounded-md
                                                            pl-10
                                                            pr-3
                                                            py-2
                                                            w-full
                                                            focus:outline-none
                                                            focus:ring-2
                                                            focus:ring-purple-500
                                                            
                                                        "
                                                    />

                                                </div>

                                            </div>

                                        )}

                                        {/* Total */}
                                        <div
                                            className={`
                                                ${orderType === 'entrega'
                                                    ? 'col-span-4'
                                                    : 'col-span-6'
                                                }
                                                flex
                                                items-center
                                                justify-end
                                            `}
                                        >

                                            <div>

                                                <div className="text-sm text-gray-500">
                                                    Valor total
                                                </div>

                                                <div className="text-2xl font-bold text-purple-700">
                                                    R$ {finalTotal.toFixed(2)}
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>                            
                            
                            </div>

                            {/* Botões */}
                            <div className="p-4 px-6 border-t flex justify-end gap-4">

                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowModal(false);
                                        setEditingId(null);
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
                                    onClick={() => {

                                        if (editingId) {
                                            updateOrder();
                                        } else {
                                            createOrder();
                                        }

                                        setShowModal(false);

                                    }}
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