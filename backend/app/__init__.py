from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # 1. Importar flask-cors

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    
    # 2. Habilitar CORS para toda la aplicación
    CORS(app)

    with app.app_context():
        from app.models import Category, Supplier, Product, StockMovement
        db.create_all()
        from app.routes import seed_initial_data, api_bp
        seed_initial_data()
        app.register_blueprint(api_bp)

    return app