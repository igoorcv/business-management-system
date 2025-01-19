# Criação de rotas

from flask import Blueprint, jsonify

routes = Blueprint('routes', __name__)

@routes.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({'message': 'Hello from Flask!'})
