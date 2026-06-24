# =========================
# CRIAÇÃO DE ROTAS 
# =========================

from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import func

from .models import Product, Order, Client, OrderItem, Movement
from . import db

routes = Blueprint('routes', __name__)


# =========================
# API clients
# =========================

# Consulta todos os clientes independente do status
@routes.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients])

# Cria um novo cliente na base de dados
@routes.route('/clients', methods=['POST'])
def create_client():

    data = request.get_json()

    client = Client(
        name=data['name'],
        phone=data['phone'],
        address=data.get('address'),
        complement=data.get('complement'),
        neighborhood=data.get('neighborhood'),
        delivery_fee=data.get('delivery_fee'),
        is_active=data.get('is_active', True)
    )

    db.session.add(client)
    db.session.commit()

    return jsonify({
        'id': client.id
    }), 201

# Consulta um cliente específico a partir do Phone
@routes.route('/clients/search')
def search_client():

    phone = request.args.get('phone')

    client = Client.query.filter_by(
        phone=phone
    ).first()

    if not client:
        return jsonify(None)

    return jsonify({
        'id': client.id,
        'name': client.name,
        'phone': client.phone,
        'address': client.address,
        'complement': client.complement,
        'neighborhood': client.neighborhood,
        'delivery_fee': client.delivery_fee
    })

# Atualiza um cliente específico a partir do ID
@routes.route('/clients/<int:id>', methods=['PUT'])
def update_client(id):
    client = Client.query.get_or_404(id)

    data = request.get_json()

    client.name = data.get('name', client.name)
    client.phone = data.get('phone', client.phone)
    client.address = data.get('address', client.address)
    client.complement = data.get('complement', client.complement)
    client.neighborhood = data.get('neighborhood', client.neighborhood)
    client.delivery_fee = data.get('delivery_fee', client.delivery_fee)
    client.is_active = data.get('is_active', client.is_active)

    try:
        db.session.commit()
        return jsonify(client.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Exclui um cliente específico a partir do ID
@routes.route('/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)

    try:
        db.session.delete(client)
        db.session.commit()
        return jsonify({"message": "Client deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    

# =========================
# API products
# =========================

# Consulta todos os produtos independente do status
@routes.route('/products', methods=['GET'])
def get_products():

    products = Product.query.all()

    return jsonify([
        product.to_dict()
        for product in products
    ])

# Cria um novo produto na base de dados
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

# Atualiza um produto específico a partir do ID
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

# Exclui um produto específico a partir do ID
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


# =========================
# API movements
# =========================

# Consulta todos os expoediente independente do status
@routes.route('/movements', methods=['GET'])
def get_movements():

    movements = (
        db.session.query(
            Movement,
            func.count(Order.id).label('total_orders'),
            func.coalesce(
                func.sum(Order.total),
                0
            ).label('revenue')
        )
        .outerjoin(
            Order,
            Order.movement_id == Movement.id
        )
        .group_by(Movement.id)
        .order_by(Movement.opened_at.desc())
        .all()
    )

    result = []

    for movement, total_orders, revenue in movements:

        data = movement.to_dict()

        data['total_orders'] = total_orders
        data['revenue'] = float(revenue)

        result.append(data)

    return jsonify(result)

# Consulta um expediente específico que possui status OPEN
@routes.route('/movements/active', methods=['GET'])
def get_active_movement():

    movement = Movement.query.filter_by(
        status='OPEN'
    ).first()

    if not movement:
        return jsonify(None)

    orders = Order.query.filter_by(
        movement_id=movement.id
    )

    total_orders = orders.count()

    counter_orders = orders.filter_by(
        order_type='balcao'
    ).count()

    pickup_orders = orders.filter_by(
        order_type='retirada'
    ).count()

    delivery_orders = orders.filter_by(
        order_type='entrega'
    ).count()

    revenue = (
        db.session.query(
            func.coalesce(
                func.sum(Order.total),
                0
            )
        )
        .filter(
            Order.movement_id == movement.id
        )
        .scalar()
    )

    return jsonify({
        **movement.to_dict(),
        "total_orders": total_orders,
        "counter_orders": counter_orders,
        "pickup_orders": pickup_orders,
        "delivery_orders": delivery_orders,
        "revenue": float(revenue)
    })

# Cria um novo expediente na base de dados
@routes.route('/movements/open', methods=['POST'])
def open_movement():

    opened_movement = Movement.query.filter_by(
        status='OPEN'
    ).first()

    if opened_movement:
        return jsonify({
            "error": "Já existe um expediente aberto"
        }), 400

    movement = Movement(
        opened_at=datetime.now(),
        status='OPEN'
    )

    db.session.add(movement)
    db.session.commit()

    return jsonify(
        movement.to_dict()
    ), 201

# Atualiza o status de um expediente específico a partir do ID
@routes.route('/movements/<int:id>/close', methods=['POST'])
def close_movement(id):

    movement = Movement.query.get_or_404(id)

    if movement.status == 'CLOSED':
        return jsonify({
            "error": "Expediente já encerrado"
        }), 400
    
    orders = Order.query.filter_by(movement_id=id).all()
    
    movement.total_orders = len(orders)
    
    movement.total_counter_orders = len([
        o for o in orders if o.order_type == 'counter'
    ])

    movement.total_pickup_orders = len([
        o for o in orders if o.order_type == 'pickup'
    ])

    movement.total_delivery_orders = len([
        o for o in orders if o.order_type == 'delivery'
    ])

    movement.revenue = sum(o.total or 0 for o in orders)

    movement.closed_at = datetime.now()

    movement.status = 'CLOSED'

    db.session.commit()

    return jsonify(
        movement.to_dict()
    )
 
# Consulta informações de um movement_id específico a partir do ID para ser utilizado na modal de Sumário 
@routes.route('/movements/<int:movement_id>/summary', methods=['GET'])
def get_movement_summary(movement_id):

    movement = Movement.query.get_or_404(movement_id)

    orders_query = Order.query.filter(
        Order.movement_id == movement_id
    )

    # -----------------------------
    # RESUMO DE PEDIDOS
    # -----------------------------

    total_orders = orders_query.count()

    counter_orders = orders_query.filter(
        Order.order_type == 'balcao'
    ).count()

    pickup_orders = orders_query.filter(
        Order.order_type == 'retirada'
    ).count()

    delivery_orders = orders_query.filter(
        Order.order_type == 'entrega'
    ).count()

    revenue = (
        db.session.query(
            func.coalesce(
                func.sum(Order.total),
                0
            )
        )
        .filter(
            Order.movement_id == movement_id
        )
        .scalar()
    )

    # -----------------------------
    # TOP 5 PRODUTOS
    # -----------------------------

    top_products_query = (
        db.session.query(
            Product.name,
            func.sum(
                OrderItem.quantity
            ).label('quantity')
        )
        .join(
            OrderItem,
            Product.id == OrderItem.product_id
        )
        .join(
            Order,
            Order.id == OrderItem.order_id
        )
        .filter(
            Order.movement_id == movement_id
        )
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(
                OrderItem.quantity
            ).desc()
        )
        .limit(3)
        .all()
    )

    top_products = [
        {
            "product_name": name,
            "quantity": float(quantity)
        }
        for name, quantity in top_products_query
    ]

    # -----------------------------
    # PAGAMENTO DOS ENTREGADORES
    # -----------------------------

    delivery_people_query = (
        db.session.query(
            Order.delivery_person
        )
        .filter(
            Order.movement_id == movement_id
        )
        .filter(
            Order.order_type == 'entrega'
        )
        .filter(
            Order.delivery_person.isnot(None)
        )
        .distinct()
        .all()
    )

    delivery_people = []

    for (delivery_person,) in delivery_people_query:

        orders = (
            Order.query
            .filter(
                Order.movement_id == movement_id,
                Order.order_type == 'entrega',
                Order.delivery_person == delivery_person
            )
            .all()
        )

        total_sold = sum(
            order.total
            for order in orders
        )

        delivery_people.append({
            "name": delivery_person,

            "order_slip_ids": [
                order.order_slip_id
                for order in orders
            ],

            "orders_total": round(
                float(total_sold),
                2
            ),

            "payment": round(
                float(total_sold) * 0.10,
                2
            )
        })

    # -----------------------------
    # RESPONSE
    # -----------------------------

    return jsonify({
        "movement_id": movement.id,

        "opened_at": (
            movement.opened_at.isoformat()
            if movement.opened_at
            else None
        ),

        "closed_at": (
            movement.closed_at.isoformat()
            if movement.closed_at
            else None
        ),

        "status": movement.status,

        "total_orders": total_orders,

        "counter_orders": counter_orders,

        "pickup_orders": pickup_orders,

        "delivery_orders": delivery_orders,

        "revenue": round(
            float(revenue),
            2
        ),

        "top_products": top_products,

        "delivery_people": delivery_people
    })


# =========================
# API orders
# =========================

# Consulta todos os pedidos que possuem moviment_id com status OPEN
@routes.route('/orders', methods=['GET'])
def get_orders():

    movement_id = request.args.get('movement_id')

    query = Order.query

    if movement_id:
        query = query.filter_by(movement_id=movement_id)
    else:
        active_movement = Movement.query.filter_by(status='OPEN').first()

        if not active_movement:
            return jsonify([])

        query = query.filter_by(movement_id=active_movement.id)


    orders = query.all()

    return jsonify([o.to_dict() for o in orders])

# Consulta um pedido específico a partir do ID
@routes.route('/orders/<int:id>', methods=['GET'])
def get_order(id):

    order = db.session.get(Order, id)

    if not order:
        return jsonify({
            'message': 'Pedido não encontrado'
        }), 404

    return jsonify(order.to_dict())

# Cria um novo pedido associado ao moviment_id que possui status OPEN
@routes.route('/orders', methods=['POST'])
def create_order():
    data = request.json
    
    active_movement = Movement.query.filter_by(status='OPEN').first()

    if not active_movement:
        return jsonify({
            "error": "Nenhum movimento aberto"
        }), 400
    
    max_slip = db.session.query(
        func.max(Order.order_slip_id)
    ).filter(
        Order.movement_id == active_movement.id
    ).scalar()

    next_slip = (max_slip or 0) + 1
    
    new_order = Order(
        client_id=data['client_id'],
        order_type=data['order_type'],
        customer_name=data['customer_name'],
        phone=data.get('phone'),
        order_slip_id=next_slip,
        
        payment_method=data.get('payment_method'),
        discount=data.get('discount', 0),
        delivery_fee=data.get('delivery_fee', 0),
        change=data.get('change', 0),
        
        total=0,
        status=data['status'],
        
        movement_id=active_movement.id
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        'id': new_order.id,
        'message': 'Pedido criado com sucesso'
    }), 201

# Exclui um pedido específico e todos os order-items associados a ele a partir do ID
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

# Atualiza um pedido específico a partir do ID
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
    order.change = data.get('change', 0)
    
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

# Atualiza o status de um pedido específico a partir do ID
@routes.route('/orders/<int:id>/status', methods=['PUT'])
def update_order_status(id):
    
    #  Essa API é utilizada ao arrastar o card no board
    
    order = Order.query.get_or_404(id)

    data = request.json
    
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

# Atualiza o entregador de um pedido específico a partir do ID
@routes.route('/orders/<int:order_id>/delivery', methods=['PUT'])
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


# =========================
# API order items
# =========================

# Consulta todas as linhas cadastradas na base de dados
@routes.route('/order-items', methods=['GET'])
def get_order_items():

    items = OrderItem.query.all()

    return jsonify([
        item.to_dict()
        for item in items
    ])

# Cria novas linhas associando a um pedido específico a partir do ID
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

# Exclui uma linha específica a partir do ID da linha
@routes.route('/order-items/<int:id>', methods=['DELETE'])
def delete_order_item(id):

    item = OrderItem.query.get_or_404(id)

    db.session.delete(item)

    db.session.commit()

    return jsonify({
        'message': 'Item removido'
    })

