from database import db
from datetime import datetime
import json
import os

class UploadRecord(db.Model):
    __tablename__ = 'upload_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512))  # Path to stored original file
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.Enum('success', 'pending', 'approved', 'rejected', 'failed', name='upload_status'), 
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
    
    def delete_file(self):
        """Delete the associated file if it exists"""
        if self.file_path and os.path.exists(self.file_path):
            os.remove(self.file_path)
            self.file_path = None
    
    def update_item(self, item_index, updated_data):
        """Update a specific item in the items list"""
        items = self.get_items()
        if 0 <= item_index < len(items):
            items[item_index].update(updated_data)
            self.set_items(items)
            return True
        return False
    
    def to_dict(self):
        """Convert upload record to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'has_original_file': bool(self.file_path),
            'upload_time': self.upload_time.isoformat(),
            'status': self.status,
            'items': self.get_items(),
            'review_comment': self.review_comment,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None
        } 