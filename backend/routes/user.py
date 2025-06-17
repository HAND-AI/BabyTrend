from flask import Blueprint, request, jsonify, current_app, send_file
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
        
        # Save file
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
                status = 'failed'
            else:
                # Validate against price list
                validation_result = PriceMatcher.validate_items(parse_result['items'])
                status = validation_result['status']
            
            # Create upload record
            upload_record = UploadRecord(
                user_id=request.current_user['user_id'],
                filename=filename,
                file_path=file_path,
                status=status
            )
            
            if parse_result['success']:
                upload_record.set_items(validation_result['items'])
            
            db.session.add(upload_record)
            db.session.commit()
            
            return jsonify({
                'message': 'File uploaded and processed successfully',
                'upload_id': upload_record.id,
                'status': status,
                'summary': validation_result.get('summary') if parse_result['success'] else {'error': parse_result.get('error', 'Unknown parsing error')}
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
def get_upload_details(upload_id):
    """Get detailed information about a specific upload"""
    try:
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

@user_bp.route('/upload/<int:upload_id>/file', methods=['GET'])
@token_required
def download_original_file(upload_id):
    """Download the original uploaded file"""
    try:
        upload = UploadRecord.query.filter_by(
            id=upload_id,
            user_id=request.current_user['user_id']
        ).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
            
        if not upload.file_path or not os.path.exists(upload.file_path):
            return jsonify({'error': 'Original file not found'}), 404
            
        return send_file(upload.file_path, as_attachment=True, download_name=upload.filename)
        
    except Exception as e:
        return jsonify({'error': f'Failed to download file: {str(e)}'}), 500

@user_bp.route('/upload/<int:upload_id>', methods=['DELETE'])
@token_required
def delete_upload(upload_id):
    """Delete an upload record and its associated file"""
    try:
        upload = UploadRecord.query.filter_by(
            id=upload_id,
            user_id=request.current_user['user_id']
        ).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
            
        if upload.status == 'success':
            return jsonify({'error': 'Cannot delete successful uploads'}), 400
            
        # Delete associated file if it exists
        upload.delete_file()
        
        # Delete record from database
        db.session.delete(upload)
        db.session.commit()
        
        return jsonify({'message': 'Upload deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete upload: {str(e)}'}), 500

@user_bp.route('/upload/<int:upload_id>/items/<int:item_index>', methods=['PUT'])
@token_required
def update_upload_item(upload_id, item_index):
    """Update a specific item in an upload record"""
    try:
        upload = UploadRecord.query.filter_by(
            id=upload_id,
            user_id=request.current_user['user_id']
        ).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
            
        if upload.status == 'success':
            return jsonify({'error': 'Cannot modify successful uploads'}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate update data
        validation_result = Validator.validate_item_update(data)
        if not validation_result['valid']:
            return jsonify({'error': validation_result['error']}), 400
            
        # Update the item
        if not upload.update_item(item_index, data):
            return jsonify({'error': 'Item index out of range'}), 400
            
        # Revalidate items
        items = upload.get_items()
        validation_result = PriceMatcher.validate_items(items)
        upload.status = validation_result['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item updated successfully',
            'status': upload.status,
            'validation_summary': validation_result['summary']
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update item: {str(e)}'}), 500 