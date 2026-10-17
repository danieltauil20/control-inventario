from flask import Blueprint, request, jsonify
from app import db
from app.models import Category, Product, StockMovement

api_bp = Blueprint('api', __name__, url_prefix='/api')

# ==========================================
# 1. RUTAS DE CATEGORÍAS
# ==========================================
@api_bp.route('/categories', methods=['GET', 'POST'])
def handle_categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([c.to_dict() for c in categories]), 200
        
    if request.method == 'POST':
        data = request.json
        if not data or not data.get('name'):
            return jsonify({'error': 'El nombre de la categoría es obligatorio'}), 400
            
        try:
            new_category = Category(
                name=data['name'],
                description=data.get('description', '')
            )
            db.session.add(new_category)
            db.session.commit()
            return jsonify({'message': 'Categoría creada con éxito', 'category': new_category.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error en la base de datos al crear la categoría', 'details': str(e)}), 500


# ==========================================
# 2. RUTAS DE PRODUCTOS
# ==========================================
@api_bp.route('/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products]), 200
        
    if request.method == 'POST':
        data = request.json
        required_fields = ['sku', 'name', 'category_id', 'unit_price']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos obligatorios (sku, name, category_id, unit_price)'}), 400
            
        sku = data['sku'].strip()
        if Product.query.filter_by(sku=sku).first():
            return jsonify({'error': f'Ya existe un producto con el SKU "{sku}"'}), 400

        category_id = data['category_id']
        if not Category.query.get(category_id):
            return jsonify({'error': f'La categoría con ID {category_id} no existe'}), 404

        try:
            new_product = Product(
                sku=sku,
                name=data['name'],
                brand=data.get('brand', ''),
                image_url=data.get('image_url', ''),
                description=data.get('description', ''),
                category_id=category_id,
                current_stock=int(data.get('current_stock', 0)),
                min_stock_alert=int(data.get('min_stock_alert', 10)),
                unit_price=float(data['unit_price']),
                supplier=data.get('supplier', '')
            )
            db.session.add(new_product)
            db.session.commit()
            return jsonify({'message': 'Producto creado con éxito', 'product': new_product.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error en la base de datos al crear el producto', 'details': str(e)}), 500


# ==========================================
# 3. RUTAS DE MOVIMIENTOS DE STOCK
# ==========================================
@api_bp.route('/movements', methods=['GET', 'POST'])
def handle_movements():
    if request.method == 'GET':
        movements = StockMovement.query.order_by(StockMovement.created_at.desc()).all()
        return jsonify([{
            'id': m.id,
            'product_id': m.product_id,
            'product_name': m.product.name if m.product else 'Desconocido',
            'movement_type': m.movement_type,
            'quantity': m.quantity,
            'notes': m.notes,
            'created_at': m.created_at.isoformat() if m.created_at else None
        } for m in movements]), 200

    if request.method == 'POST':
        data = request.json
        required_fields = ['product_id', 'movement_type', 'quantity']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos obligatorios (product_id, movement_type, quantity)'}), 400
            
        product_id = data['product_id']
        movement_type = data['movement_type'].upper() # 'IN' o 'OUT'
        
        try:
            quantity = int(data['quantity'])
        except ValueError:
            return jsonify({'error': 'La cantidad debe ser un número entero'}), 400

        if quantity <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a cero'}), 400
        
        if movement_type not in ['IN', 'OUT']:
            return jsonify({'error': 'El tipo de movimiento debe ser "IN" (entrada) o "OUT" (salida)'}), 400
            
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Validar stock en salidas
        if movement_type == 'OUT' and product.current_stock < quantity:
            return jsonify({'error': f'Stock insuficiente. Stock actual: {product.current_stock}'}), 400
            
        try:
            if movement_type == 'IN':
                product.current_stock += quantity
            elif movement_type == 'OUT':
                product.current_stock -= quantity
                
            new_movement = StockMovement(
                product_id=product_id,
                movement_type=movement_type,
                quantity=quantity,
                notes=data.get('notes', '')
            )
            
            db.session.add(new_movement)
            db.session.commit()
            
            return jsonify({
                'message': 'Movimiento registrado con éxito',
                'new_stock': product.current_stock
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Error al procesar el movimiento de stock', 'details': str(e)}), 500


# ==========================================
# 4. FUNCIÓN SEEDER AUTOMÁTICA
# ==========================================
def seed_initial_data():
    """Inserta categorías y productos iniciales si la base de datos está vacía."""
    if Category.query.first() is not None:
        return

    print("🌱 Sembrando categorías y productos iniciales...")

    cat_descartables = Category(name="Materiales Descartables", description="Guantes, mascarillas, baberos")
    cat_restauracion = Category(name="Restauración y Adhesión", description="Resinas, adhesivos")
    cat_anestesia = Category(name="Anestesia y Agujas", description="Cartuchos y agujas dentales")
    
    db.session.add_all([cat_descartables, cat_restauracion, cat_anestesia])
    db.session.commit()

    productos_iniciales = [
        Product(
            sku="DESC-001", 
            name="Guantes de Nitrilo (Caja x100)", 
            brand="Medicaline",
            image_url="",
            description="Talla M, azul, sin polvo", 
            category_id=cat_descartables.id, 
            unit_price=9.50, 
            current_stock=40, 
            min_stock_alert=10
        ),
        Product(
            sku="REST-001", 
            name="Resina Filtek Z250 A2", 
            brand="3M ESPE",
            image_url="",
            description="Jeringa de 4g para restauraciones universales", 
            category_id=cat_restauracion.id, 
            unit_price=32.00, 
            current_stock=12, 
            min_stock_alert=3
        ),
        Product(
            sku="ANES-001", 
            name="Articaína 4% con Epinefrina 1:100.000", 
            brand="Inibsa",
            image_url="",
            description="Caja con 100 cartuchos de vidrio", 
            category_id=cat_anestesia.id, 
            unit_price=45.00, 
            current_stock=8, 
            min_stock_alert=2
        )
    ]

    db.session.add_all(productos_iniciales)
    db.session.commit()
    print("✅ ¡Datos iniciales cargados correctamente!")