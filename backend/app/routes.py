# Criação de rotas

from flask import Blueprint, jsonify, request

from .models import Product
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