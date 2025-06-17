from flask import Blueprint, request, jsonify, current_app
from database import db
from models.upload import UploadRecord
from models.price import PriceList
from models.duty import DutyRate
from models.user import User
from utils.jwt import token_required, admin_required
from services.validator import Validator
from services.file_parser import FileParser
import os
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/upload/price-list', methods=['POST'])
@token_required
@admin_required
def upload_price_list():
    """Upload and update price list"""
    try:
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
        safe_filename = f"pricelist_{timestamp}_{filename}"
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)
        
        try:
            # Parse price list
            parse_result = FileParser.parse_price_list(file_path)
            
            if not parse_result['success']:
                return jsonify({
                    'error': 'Failed to parse price list',
                    'details': parse_result.get('error', 'Unknown parsing error')
                }), 400
            
            # Update prices in database
            updated_count = PriceList.update_prices(parse_result['price_data'])
            
            # Clean up temporary file
            os.remove(file_path)
            
            return jsonify({
                'message': 'Price list updated successfully',
                'updated_items': updated_count,
                'total_items': parse_result['total_items']
            }), 200
            
        except Exception as e:
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Price list upload failed: {str(e)}'}), 500

@admin_bp.route('/upload/duty-rate', methods=['POST'])
@token_required
@admin_required
def upload_duty_rate():
    """Upload and update duty rates"""
    try:
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
        safe_filename = f"dutyrate_{timestamp}_{filename}"
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, safe_filename)
        file.save(file_path)
        
        try:
            # Parse duty rates
            parse_result = FileParser.parse_duty_rates(file_path)
            
            if not parse_result['success']:
                return jsonify({
                    'error': 'Failed to parse duty rates',
                    'details': parse_result.get('error', 'Unknown parsing error')
                }), 400
            
            # Update rates in database
            updated_count = DutyRate.update_rates(parse_result['rate_data'])
            
            # Clean up temporary file
            os.remove(file_path)
            
            return jsonify({
                'message': 'Duty rates updated successfully',
                'updated_items': updated_count,
                'total_items': parse_result['total_items']
            }), 200
            
        except Exception as e:
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Duty rate upload failed: {str(e)}'}), 500

@admin_bp.route('/uploads', methods=['GET'])
@token_required
@admin_required
def get_all_uploads():
    """Get all upload records for admin review"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status')
        
        query = UploadRecord.query
        
        # Apply status filter (admin typically wants to see pending items)
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
        
        uploads = []
        for upload in pagination.items:
            upload_data = upload.to_dict()
            # Add user information
            user = User.query.get(upload.user_id)
            upload_data['username'] = user.username if user else 'Unknown'
            uploads.append(upload_data)
        
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

@admin_bp.route('/review/<int:upload_id>', methods=['POST'])
@token_required
@admin_required
def review_upload():
    """Approve or reject an upload"""
    try:
        upload_id = request.view_args['upload_id']
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate review data
        validation_result = Validator.validate_review_data(data)
        if not validation_result['valid']:
            return jsonify({'error': validation_result['error']}), 400
        
        # Find upload record
        upload = UploadRecord.query.get(upload_id)
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Check if upload is in pending status
        if upload.status not in ['pending']:
            return jsonify({'error': 'Upload is not in pending status'}), 400
        
        # Update status
        action = data['action']
        if action == 'approve':
            upload.status = 'approved'
        else:  # reject
            upload.status = 'rejected'
        
        upload.review_comment = data.get('comment', '')
        upload.reviewed_by = request.current_user['user_id']
        upload.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Upload {action}d successfully',
            'upload_id': upload_id,
            'status': upload.status
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Review failed: {str(e)}'}), 500

@admin_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        stats = {
            'total_uploads': UploadRecord.query.count(),
            'pending_uploads': UploadRecord.query.filter_by(status='pending').count(),
            'approved_uploads': UploadRecord.query.filter_by(status='approved').count(),
            'rejected_uploads': UploadRecord.query.filter_by(status='rejected').count(),
            'success_uploads': UploadRecord.query.filter_by(status='success').count(),
            'total_users': User.query.filter_by(is_admin=False).count(),
            'total_price_items': PriceList.query.count(),
            'total_duty_items': DutyRate.query.count()
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve stats: {str(e)}'}), 500 