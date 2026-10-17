from datetime import datetime, timezone
from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(200))
    
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    
    current_stock = db.Column(db.Integer, default=0, nullable=False)
    min_stock_alert = db.Column(db.Integer, default=10, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    expiration_date = db.Column(db.Date, nullable=True)
    supplier = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    movements = db.relationship('StockMovement', backref='product', lazy=True)

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.String(10), nullable=False) # 'IN' / 'OUT'
    quantity = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))