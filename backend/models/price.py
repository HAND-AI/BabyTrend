from database import db
from datetime import datetime

class PriceList(db.Model):
    __tablename__ = 'price_list'
    
    item_code = db.Column(db.String(100), primary_key=True)
    unit_price = db.Column(db.Float, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert price list item to dictionary"""
        return {
            'item_code': self.item_code,
            'unit_price': self.unit_price,
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def get_price(cls, item_code):
        """Get price for specific item code"""
        item = cls.query.filter_by(item_code=item_code).first()
        return item.unit_price if item else None
    
    @classmethod
    def update_prices(cls, price_data):
        """Bulk update prices from uploaded data"""
        updated_count = 0
        for item_code, unit_price in price_data.items():
            existing = cls.query.filter_by(item_code=item_code).first()
            if existing:
                existing.unit_price = unit_price
                existing.updated_at = datetime.utcnow()
            else:
                new_item = cls(item_code=item_code, unit_price=unit_price)
                db.session.add(new_item)
            updated_count += 1
        
        db.session.commit()
        return updated_count 