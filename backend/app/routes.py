from flask import Blueprint, request, jsonify
from app import db
from app.models import Category, Product, StockMovement

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/categories', methods=['GET', 'POST'])
def handle_categories():
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify([{
            'id': c.id,
            'name': c.name,
            'description': c.description
        } for c in categories]), 200
        
    if request.method == 'POST':
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'error': 'El nombre de la categoría es obligatorio'}), 400
            
        new_category = Category(
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_category)
        db.session.commit()
        return jsonify({'message': 'Categoría creada con éxito', 'id': new_category.id}), 201

@api_bp.route('/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'sku': p.sku,
            'name': p.name,
            'category_id': p.category_id,
            'current_stock': p.current_stock,
            'min_stock_alert': p.min_stock_alert,
            'unit_price': float(p.unit_price)
        } for p in products]), 200
        
    if request.method == 'POST':
        data = request.json
        required_fields = ['sku', 'name', 'category_id', 'unit_price']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos obligatorios (sku, name, category_id, unit_price)'}), 400
            
        new_product = Product(
            sku=data['sku'],
            name=data['name'],
            description=data.get('description', ''),
            category_id=data['category_id'],
            current_stock=data.get('current_stock', 0),
            min_stock_alert=data.get('min_stock_alert', 10),
            unit_price=data['unit_price'],
            supplier=data.get('supplier', '')
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Producto creado con éxito', 'id': new_product.id}), 201

@api_bp.route('/movements', methods=['POST'])
def create_movement():
    data = request.json
    required_fields = ['product_id', 'movement_type', 'quantity']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos obligatorios (product_id, movement_type, quantity)'}), 400
        
    product_id = data['product_id']
    movement_type = data['movement_type'].upper() # 'IN' o 'OUT'
    quantity = int(data['quantity'])
    
    if movement_type not in ['IN', 'OUT']:
        return jsonify({'error': 'El tipo de movimiento debe ser "IN" (entrada) o "OUT" (salida)'}), 400
        
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Producto no encontrado'}), 404
        
    # Actualizar stock actual según el movimiento
    if movement_type == 'IN':
        product.current_stock += quantity
    elif movement_type == 'OUT':
        if product.current_stock < quantity:
            return jsonify({'error': 'Stock insuficiente para realizar esta salida'}), 400
        product.current_stock -= quantity
        
    # Registrar el movimiento
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

@api_bp.route('/movements', methods=['GET'])
def get_movements():
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).all()
    return jsonify([{
        'id': m.id,
        'product_id': m.product_id,
        'product_name': m.product.name,
        'movement_type': m.movement_type,
        'quantity': m.quantity,
        'notes': m.notes,
        'created_at': m.created_at.isoformat()
    } for m in movements]), 200
