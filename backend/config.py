# Configuração do Flask e do Database

import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    #SECRET_KEY = os.getenv('SECRET_KEY', 'mysecretkey')
    SECRET_KEY = os.getenv('123', 'mysecretkey')
