from flask import Blueprint, request, jsonify
from app import db
from app.models import Category, Product

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