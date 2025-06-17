from database import db
from datetime import datetime

class DutyRate(db.Model):
    __tablename__ = 'duty_rates'
    
    item_code = db.Column(db.String(100), primary_key=True)
    rate = db.Column(db.Float, nullable=False)  # Tax rate as percentage
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert duty rate item to dictionary"""
        return {
            'item_code': self.item_code,
            'rate': self.rate,
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def get_rate(cls, item_code):
        """Get duty rate for specific item code"""
        item = cls.query.filter_by(item_code=item_code).first()
        return item.rate if item else None
    
    @classmethod
    def update_rates(cls, rate_data):
        """Bulk update rates from uploaded data"""
        updated_count = 0
        for item_code, rate in rate_data.items():
            existing = cls.query.filter_by(item_code=item_code).first()
            if existing:
                existing.rate = rate
                existing.updated_at = datetime.utcnow()
            else:
                new_item = cls(item_code=item_code, rate=rate)
                db.session.add(new_item)
            updated_count += 1
        
        db.session.commit()
        return updated_count 