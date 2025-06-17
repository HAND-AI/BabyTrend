import os
from werkzeug.utils import secure_filename
from typing import List, Optional

class Validator:
    """General validation service"""
    
    ALLOWED_EXCEL_EXTENSIONS = {'xlsx', 'xls'}
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB
    
    @staticmethod
    def validate_file_upload(file) -> dict:
        """Validate uploaded file"""
        if not file:
            return {'valid': False, 'error': 'No file provided'}
        
        if file.filename == '':
            return {'valid': False, 'error': 'No file selected'}
        
        # Check file extension
        if not Validator._allowed_file(file.filename):
            return {
                'valid': False, 
                'error': f'Invalid file type. Allowed: {", ".join(Validator.ALLOWED_EXCEL_EXTENSIONS)}'
            }
        
        # Check file size (if available)
        if hasattr(file, 'content_length') and file.content_length:
            if file.content_length > Validator.MAX_FILE_SIZE:
                return {
                    'valid': False, 
                    'error': f'File too large. Maximum size: {Validator.MAX_FILE_SIZE / (1024*1024):.1f}MB'
                }
        
        return {'valid': True, 'filename': secure_filename(file.filename)}
    
    @staticmethod
    def validate_username(username: str) -> dict:
        """Validate username"""
        if not username:
            return {'valid': False, 'error': 'Username is required'}
        
        if len(username) < 3:
            return {'valid': False, 'error': 'Username must be at least 3 characters long'}
        
        if len(username) > 50:
            return {'valid': False, 'error': 'Username must be less than 50 characters'}
        
        # Check for invalid characters
        if not username.replace('_', '').replace('-', '').isalnum():
            return {'valid': False, 'error': 'Username can only contain letters, numbers, hyphens, and underscores'}
        
        return {'valid': True}
    
    @staticmethod
    def validate_password(password: str) -> dict:
        """Validate password strength"""
        if not password:
            return {'valid': False, 'error': 'Password is required'}
        
        if len(password) < 6:
            return {'valid': False, 'error': 'Password must be at least 6 characters long'}
        
        if len(password) > 128:
            return {'valid': False, 'error': 'Password must be less than 128 characters'}
        
        return {'valid': True}
    
    @staticmethod
    def validate_review_data(data: dict) -> dict:
        """Validate admin review data"""
        if 'action' not in data:
            return {'valid': False, 'error': 'Action is required'}
        
        if data['action'] not in ['approve', 'reject']:
            return {'valid': False, 'error': 'Action must be either "approve" or "reject"'}
        
        if data['action'] == 'reject' and not data.get('comment'):
            return {'valid': False, 'error': 'Comment is required when rejecting'}
        
        comment = data.get('comment', '')
        if len(comment) > 500:
            return {'valid': False, 'error': 'Comment must be less than 500 characters'}
        
        return {'valid': True}
    
    @staticmethod
    def _allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in Validator.ALLOWED_EXCEL_EXTENSIONS
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe storage"""
        return secure_filename(filename) 