# Configuração do Flask e do Database

import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:123@localhost/la-bambina')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'a46f39472535e0ff0a418368d876ef1855e845643072ae8b')
    print(os.urandom(24).hex())
