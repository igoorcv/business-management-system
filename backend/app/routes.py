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
        price=data['price']
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
    product = Product.query.get(id)

    if not product:
        return jsonify({'error': 'Produto não encontrado'}), 404

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
    product.category = data['category']
    product.price = data['price']

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

    new_order = Order(
        customer_name=data['customer_name'],
        total_price = data['total_price'],
        status = data['status']
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({
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

    #order.customer_name = data['customer_name']
    #order.total_price = data['total_price']
    #order.status = data['status']
    order.customer_name = data.get('customer_name')
    order.total_price = data.get('total_price')
    order.status = data.get('status')

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
        quantity=data['quantity']
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

# Cria método UPDATE OrderItem
