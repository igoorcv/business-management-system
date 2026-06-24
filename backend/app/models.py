# =========================
# CRIAÇÃO DA ESTRUTURA DO BANCO DE DADOS
# =========================

from . import db
from datetime import datetime, timedelta


# Table movements
class Movement(db.Model):
    __tablename__ = 'movements'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    opened_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    closed_at = db.Column(
        db.DateTime
    )

    status = db.Column(
        db.String(20),
        nullable=False,
        default='OPEN'
    )
    
    orders = db.relationship(
        'Order',
        backref='movement',
        lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "opened_at": self.opened_at.isoformat() if self.opened_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "status": self.status
        }

# Table clients 
class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    address = db.Column(
        db.String(200)
    )

    complement = db.Column(
        db.String(100)
    )

    neighborhood = db.Column(
        db.String(100)
    )
    
    delivery_fee = db.Column(
        db.Float,
        default=0
    )
    
    is_active = db.Column(
        db.Boolean, 
        default=True
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "address": self.address,
            "complement": self.complement,
            "neighborhood": self.neighborhood,
            "delivery_fee": self.delivery_fee,
            "is_active": self.is_active
        }    

# Table products
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)

    code = db.Column(
        db.String(10),
        nullable=True
    )
    
    name = db.Column(
        db.String(100),
        nullable=False
    )

    category = db.Column(
        db.String(50),
        nullable=False
    )

    price = db.Column(
        db.Float,
        nullable=False
    )
    
    is_active = db.Column(
        db.Boolean, 
        default=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "code": self.code,
            "is_active": self.is_active
        }

# Table orders
class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)

    order_type = db.Column(
        db.String(20),
        default='balcao'
    )
    
    order_slip_id = db.Column(
        db.Integer,
        nullable=False
    )
    
    client_id = db.Column(
        db.Integer,
        db.ForeignKey('clients.id'),
        nullable=True
    )
    
    movement_id = db.Column(
        db.Integer,
        db.ForeignKey('movements.id'),
        nullable=False
    )
    
    client = db.relationship(
        'Client',
        backref='orders'
    )
    
    customer_name = db.Column(
        db.String(100),
        nullable=False
    )
    
    phone = db.Column(
        db.String(20),
        nullable=True
    )

    total = db.Column(
        db.Float,
        default=0
    )

    status = db.Column(
        db.String(50),
        default='pending'
    )
    
    payment_method = db.Column(
        db.String(100),
        nullable=True
    )

    discount = db.Column(
        db.Float,
        default=0
    )

    delivery_fee = db.Column(
        db.Float,
        default=0
    )
    
    change = db.Column(
        db.Float,
        default=0
    )
    
    delivery_person = db.Column(
        db.String(100),
        nullable=True
    )
    
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() - timedelta(hours=3)
    )
    
    finalized_at = db.Column(
        db.DateTime,
        nullable=True
    )
    
    items = db.relationship(
        'OrderItem',
        backref='order',
        lazy=True
    )

    def calculate_total(self):

        subtotal = 0

        for item in self.items:

            subtotal += item.product.price * item.quantity

        self.total = (
            subtotal
            - float(self.discount or 0)
            + float(self.delivery_fee or 0)
        )

    def to_dict(self):

        return {
            'id': self.id,
            'customer_name': (
                self.client.name
                if self.client
                else self.customer_name
            ),
            'phone': (
                self.client.phone
                if self.client
                else self.phone
            ),
            'client_id': self.client_id,
            'order_slip_id': self.order_slip_id,
            'order_type': self.order_type,
            'payment_method': self.payment_method,
            'discount': self.discount,
            'delivery_fee': self.delivery_fee,
            'change': self.change,
            'total_price': self.total,
            'status': self.status,
            'items': [
                item.to_dict()
                for item in self.items
            ],
            "delivery_person": self.delivery_person,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'finalized_at': (
                self.finalized_at.isoformat()
                if self.finalized_at
                else None
            ),
            
        }

# Table order-items
class OrderItem(db.Model):

    __tablename__ = 'order_items'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    order_id = db.Column(
        db.Integer,
        db.ForeignKey('orders.id'),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey('products.id'),
        nullable=False
    )

    quantity = db.Column(
        db.Float,
        nullable=False,
        default=1
    )
    
    observation = db.Column(
        db.Text,
        nullable=True
    )

    product = db.relationship(
        'Product',
        backref='order_items'
    )

    def to_dict(self):

        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else '',
            'product_price': self.product.price if self.product else '',
            'quantity': self.quantity,
            'observation': self.observation
        }