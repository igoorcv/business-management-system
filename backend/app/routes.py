# Criação de rotas

from flask import Blueprint, jsonify, request

from .models import Product, Order, Client, OrderItem
from . import db

routes = Blueprint('routes', __name__)

# Cria método GET Test
@routes.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'Hello from Flask!'})

# Cria método GET Products
@routes.route('/products', methods=['GET'])
def get_products():

    #products = Product.query.filter_by(is_active=True).all()
    products = Product.query.all()

    return jsonify([
        product.to_dict()
        for product in products
    ])

# Cria método POST Product
@routes.route('/products', methods=['POST'])
def create_product():

    data = request.get_json()

    new_product = Product(
        name=data['name'],
        category=data['category'],
        code=data['code'],
        price=data['price'],
        is_active=data['is_active']
    )

    db.session.add(new_product)

    db.session.commit()

    return jsonify({
        "message": "Produto criado com sucesso!"
    }), 201
    # Obs: React → Flask → SQLAlchemy → PostgreSQL

# Cria método DELETE Product
@routes.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    #product = Product.query.get(id)
    product = Product.query.get_or_404(id)

    if not product:
        return jsonify({'error': 'Produto não encontrado'}), 404
    
    product.is_active = False

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Produto deletado com sucesso!'})

# Cria método UPDATE Product
@routes.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get(id)

    if not product:
        return jsonify({'error': 'Produto não encontrado'}), 404

    data = request.json

    product.name = data['name']
    product.code=data['code'],
    product.category = data['category']
    product.price = data['price']
    product.is_active = data['is_active']

    db.session.commit()

    return jsonify({
        'message': 'Produto atualizado com sucesso'
    })

# Cria método GET Orders
@routes.route('/orders', methods=['GET'])
def get_orders():

    orders = Order.query.all()

    output = []

    for order in orders:
        output.append(order.to_dict())

    return jsonify(output)

# Cria método GET Order
@routes.route('/orders/<int:id>', methods=['GET'])
def get_order(id):

    order = db.session.get(Order, id)

    if not order:
        return jsonify({
            'message': 'Pedido não encontrado'
        }), 404

    return jsonify(order.to_dict())

# Cria método POST Order
@routes.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    
    print(data)
    
    new_order = Order(
        client_id=data['client_id'],
        order_type=data['order_type'],
        customer_name=data['customer_name'],
        phone=data.get('phone'),
        
        payment_method=data.get('payment_method'),
        discount=data.get('discount', 0),
        delivery_fee=data.get('delivery_fee', 0),
        
        total=0,
        status=data['status']
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        'id': new_order.id,
        'message': 'Pedido criado com sucesso'
    }), 201

# Cria método DELETE Order
@routes.route('/orders/<int:id>', methods=['DELETE'])
def delete_order(id):

    order = Order.query.get(id)

    if not order:

        return jsonify({
            'error': 'Pedido não encontrado'
        }), 404

    # Remove os itens do pedido
    OrderItem.query.filter_by(
        order_id=id
    ).delete()
    
    # Remove o pedido
    db.session.delete(order)

    db.session.commit()

    return jsonify({
        'message': 'Pedido deletado com sucesso'
    })

# Cria método UPDATE Order
@routes.route('/orders/<int:id>', methods=['PUT'])
def update_order(id):

    order = Order.query.get(id)

    if not order:

        return jsonify({
            'error': 'Pedido não encontrado'
        }), 404

    data = request.json
    
    order.customer_name = data.get('customer_name')
    order.status = data.get('status')
    order.payment_method = data.get('payment_method')
    order.discount = data.get('discount', 0)
    order.delivery_fee = data.get('delivery_fee', 0)
    
    items = data.get('items', [])
    
    current_items = OrderItem.query.filter_by(
        order_id=id
    ).all()
    
    received_ids = {
        item['id']
        for item in items
        if item.get('id')
    }
    
    # Remover itens do pedido
    for current_item in current_items:

        if current_item.id not in received_ids:

            db.session.delete(current_item)
    
    # Atualizar ou adicionar itens
    for item_data in items:

        if item_data.get('id'):

            item = OrderItem.query.filter_by(
                id=item_data['id'],
                order_id=id
            ).first()

            if item:

                item.quantity = item_data['quantity']
                item.observation = item_data.get('observation')
                
        else:

            new_item = OrderItem(
                order_id=id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                observation=item_data.get('observation')
            )

            db.session.add(new_item)
    
    order.calculate_total()
    
    db.session.commit()

    return jsonify({
        'message': 'Pedido atualizado com sucesso'
    })

# Cria método GET Order-Items
@routes.route('/order-items', methods=['GET'])
def get_order_items():

    items = OrderItem.query.all()

    return jsonify([
        item.to_dict()
        for item in items
    ])

# Cria método POST OrderItem
@routes.route('/order-items', methods=['POST'])
def create_order_item():

    data = request.get_json()

    item = OrderItem(
        order_id=data['order_id'],
        product_id=data['product_id'],
        quantity=data['quantity'],
        observation=data.get('observation')
    )

    db.session.add(item)
    db.session.commit()
    
    order = Order.query.get(item.order_id)

    order.calculate_total()

    db.session.commit()

    return jsonify(item.to_dict()), 201

# Cria método DELETE OrderItem
@routes.route('/order-items/<int:id>', methods=['DELETE'])
def delete_order_item(id):

    item = OrderItem.query.get_or_404(id)

    db.session.delete(item)

    db.session.commit()

    return jsonify({
        'message': 'Item removido'
    })

# Cria método POST Client
@routes.route('/clients', methods=['POST'])
def create_client():

    data = request.get_json()

    client = Client(
        nome=data['nome'],
        telefone=data['telefone'],
        endereco=data.get('endereco'),
        complemento=data.get('complemento'),
        bairro=data.get('bairro')
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({
        'id': client.id
    }), 201

# Cria método GET Client by Phone
@routes.route('/clients/search')
def search_client():

    phone = request.args.get('phone')

    client = Client.query.filter_by(
        telefone=phone
    ).first()

    if not client:
        return jsonify(None)

    return jsonify({
        'id': client.id,
        'nome': client.nome,
        'telefone': client.telefone,
        'endereco': client.endereco,
        'complemento': client.complemento,
        'bairro': client.bairro
    })

# Cria método UPDATE Client


# Cria método DELETE Client


# Cria método UPDATE Status Order
@routes.route('/orders/<int:id>/status', methods=['PUT'])
def update_order_status(id):

    order = Order.query.get_or_404(id)

    data = request.json

    #order.status = data['status']
    
    from datetime import datetime
    
    new_status = data['status']

    if (
        new_status == 'Finalizado'
        and order.status != 'Finalizado'
    ):
        order.finalized_at = datetime.now()

    order.status = new_status
    
    if (
        new_status == 'Finalizado'
        and order.status != 'Finalizado'
    ):
        order.finalized_at = datetime.now()

    elif (
        new_status != 'Finalizado'
        and order.status == 'Finalizado'
    ):
        order.finalized_at = None

    order.status = new_status

    db.session.commit()

    return jsonify({
        'message': 'Status atualizado'
    })
    
# Atualiza delivery_person no Order
@routes.route(
    '/orders/<int:order_id>/delivery',
    methods=['PUT']
)
def assign_delivery_person(order_id):

    data = request.json

    order = Order.query.get_or_404(order_id)

    order.delivery_person = data.get(
        'delivery_person'
    )

    order.status = 'Saiu para entrega'

    db.session.commit()

    return jsonify({
        "message": "Entrega liberada"
    }) 