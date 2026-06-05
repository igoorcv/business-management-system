import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function OrderDetails() {

    const { id } = useParams();

    const [order, setOrder] = useState(null);

    useEffect(() => {

        fetch(`http://localhost:5000/orders/${id}`)
            .then(response => response.json())
            .then(data => setOrder(data));

    }, [id]);

    if (!order) {
        return <p>Carregando...</p>;
    }

    return (
        <div>
            <h1>Pedido #{order.id}</h1>

            <p>Cliente: {order.customer_name}</p>
            <p>Status: {order.status}</p>
            <p>Total: R$ {order.total_price}</p>

            <h2>Itens</h2>

            <table>
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                    </tr>
                </thead>

                <tbody>
                    {order.items?.map(item => (
                        <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>
                                R$ {item.unit_price}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default OrderDetails;