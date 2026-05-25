# Configuração inicial do Flask

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@localhost/la-bambina'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'a46f39472535e0ff0a418368d876ef1855e845643072ae8b'
    db.init_app(app)

    with app.app_context():
        from . import routes  # Importa rotas
        db.create_all()  # Cria tabelas no banco
    return app