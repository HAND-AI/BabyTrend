from flask import Blueprint, request, jsonify, current_app
from database import db
from models.upload import UploadRecord
from utils.jwt import token_required
from services.validator import Validator
from services.file_parser import FileParser
from services.price_matcher import PriceMatcher
import os
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/upload/packing-list', methods=['POST'])
@token_required
def upload_packing_list():
    """Upload and process packing list"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Validate file
        validation_result = Validator.validate_file_upload(file)
        if not validation_result['valid']:
            return jsonify({'error': validation_result['error']}), 400
        
        # Save file temporarily
        filename = validation_result['filename']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{filename}"
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)
        
        try:
            # Parse packing list
            parse_result = FileParser.parse_packing_list(file_path)
            
            if not parse_result['success']:
                return jsonify({
                    'error': 'Failed to parse file',
                    'details': parse_result.get('error', 'Unknown parsing error')
                }), 400
            
            # Validate against price list
            validation_result = PriceMatcher.validate_items(parse_result['items'])
            
            # Create upload record
            upload_record = UploadRecord(
                user_id=request.current_user['user_id'],
                filename=filename,
                status=validation_result['status']
            )
            upload_record.set_items(validation_result['items'])
            
            db.session.add(upload_record)
            db.session.commit()
            
            # Clean up temporary file
            os.remove(file_path)
            
            return jsonify({
                'message': 'File uploaded and processed successfully',
                'upload_id': upload_record.id,
                'status': validation_result['status'],
                'summary': validation_result['summary']
            }), 200
            
        except Exception as e:
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@user_bp.route('/uploads', methods=['GET'])
@token_required
def get_user_uploads():
    """Get user's upload history"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status_filter = request.args.get('status')
        
        query = UploadRecord.query.filter_by(user_id=request.current_user['user_id'])
        
        # Apply status filter if provided
        if status_filter:
            query = query.filter(UploadRecord.status == status_filter)
        
        # Order by upload time (newest first)
        query = query.order_by(UploadRecord.upload_time.desc())
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        uploads = [upload.to_dict() for upload in pagination.items]
        
        return jsonify({
            'uploads': uploads,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve uploads: {str(e)}'}), 500

@user_bp.route('/upload/<int:upload_id>', methods=['GET'])
@token_required
def get_upload_details():
    """Get detailed information about a specific upload"""
    try:
        upload_id = request.view_args['upload_id']
        
        upload = UploadRecord.query.filter_by(
            id=upload_id,
            user_id=request.current_user['user_id']
        ).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        upload_data = upload.to_dict()
        
        # Add validation summary if items exist
        if upload_data['items']:
            summary = PriceMatcher.get_validation_summary(upload_data['items'])
            upload_data['validation_summary'] = summary
        
        return jsonify(upload_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve upload details: {str(e)}'}), 500 