# Criação da estrutura do Database

from . import db
from datetime import datetime, timedelta
 
class Client(db.Model):
    __tablename__ = 'clients'

    id = db.Column(db.Integer, primary_key=True)

    nome = db.Column(
        db.String(100),
        nullable=False
    )

    telefone = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    endereco = db.Column(
        db.String(200)
    )

    complemento = db.Column(
        db.String(100)
    )

    bairro = db.Column(
        db.String(100)
    )

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)

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

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price
        }

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)

    order_type = db.Column(
        db.String(20),
        default='balcao'
    )
    
    client_id = db.Column(
        db.Integer,
        db.ForeignKey('clients.id'),
        nullable=True
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
    
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() - timedelta(hours=3)
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
                self.client.nome
                if self.client
                else self.customer_name
            ),
            'phone': (
                self.client.telefone
                if self.client
                else self.phone
            ),
            'client_id': self.client_id,
            'order_type': self.order_type,
            'payment_method': self.payment_method,
            'discount': self.discount,
            'delivery_fee': self.delivery_fee,
            'total_price': self.total,
            'status': self.status,
            'items': [
                item.to_dict()
                for item in self.items
            ],
            'created_at': (
                self.created_at.strftime('%d/%m/%Y %H:%M:%S')
                if self.created_at
                else None
            )
        }
 
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