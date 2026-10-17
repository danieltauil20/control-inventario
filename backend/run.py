from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crea las tablas en SQLite localmente
    app.run(debug=True, port=5000)