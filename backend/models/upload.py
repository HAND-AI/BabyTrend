from database import db
from datetime import datetime
import json

class UploadRecord(db.Model):
    __tablename__ = 'upload_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum('success', 'pending', 'approved', 'rejected', name='upload_status'), 
                      default='pending', nullable=False)
    items = db.Column(db.Text)  # JSON string of parsed items
    review_comment = db.Column(db.Text)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    reviewed_at = db.Column(db.DateTime)
    
    def set_items(self, items_data):
        """Set items as JSON string"""
        self.items = json.dumps(items_data) if items_data else None
    
    def get_items(self):
        """Get items as Python object"""
        return json.loads(self.items) if self.items else []
    
    def to_dict(self):
        """Convert upload record to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'upload_time': self.upload_time.isoformat(),
            'status': self.status,
            'items': self.get_items(),
            'review_comment': self.review_comment,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None
        } 