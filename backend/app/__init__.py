from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()
    
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    @app.route("/")
    def index():
        return {"message": "API de Inventario Dental funcionando correctamente 🦷🚀"}

    # Registrar las rutas de la API
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    return app