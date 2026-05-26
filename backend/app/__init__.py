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
    app.config['SECRET_KEY'] = 'sua_secret_key'

    db.init_app(app)

    from .routes import routes          # Importa rotas
    app.register_blueprint(routes)      # Comando pro Flask usar as rotas definidas no arquivo routes.py

    # CARREGA TODOS OS MODELOS
    from .models import Product

    # CRIA TABELAS NO DB
    with app.app_context():
        db.create_all()                 # Cria tabelas no banco

    return app