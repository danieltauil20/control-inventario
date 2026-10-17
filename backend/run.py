from app import create_app, db
from app.routes import seed_initial_data  # Importante: importar la función

app = create_app()

with app.app_context():
    db.create_all()         # Crea las tablas si no existen
    seed_initial_data()     # <--- Esto es lo que llena las categorías y productos

if __name__ == '__main__':
    app.run(debug=True, port=5000)