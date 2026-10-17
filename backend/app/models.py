from app import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    products = db.relationship('Product', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50), nullable=True, default='')  # Marca (ej. 3M, Kerr)
    image_url = db.Column(db.String(255), nullable=True, default='') # Foto de referencia
    description = db.Column(db.Text, nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    unit_price = db.Column(db.Float, nullable=False, default=0.0)
    current_stock = db.Column(db.Integer, nullable=False, default=0)
    min_stock_alert = db.Column(db.Integer, nullable=False, default=5)
    supplier = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'brand': self.brand,
            'image_url': self.image_url,
            'description': self.description,
            'category_id': self.category_id,
            'unit_price': float(self.unit_price),
            'current_stock': self.current_stock,
            'min_stock_alert': self.min_stock_alert,
            'supplier': self.supplier
        }

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.String(10), nullable=False)  # 'IN' o 'OUT'
    quantity = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    product = db.relationship('Product', backref=db.backref('movements', lazy=True))