# Criação de rotas

from flask import Blueprint, jsonify, request

from .models import Product, Order
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
        output.append({
            'id': order.id,
            'customer_name': order.customer_name,
            'total': order.total,
            'status': order.status
        })

    return jsonify(output)

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
