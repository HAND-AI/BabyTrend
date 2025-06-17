from models.price import PriceList
from typing import List, Dict, Any

class PriceMatcher:
    """Service class for matching and validating prices"""
    
    @staticmethod
    def validate_items(items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate packing list items against price list"""
        validated_items = []
        has_errors = False
        validation_summary = {
            'total_items': len(items),
            'valid_items': 0,
            'invalid_items': 0,
            'validation_errors': []
        }
        
        for item in items:
            validated_item = item.copy()
            price_validation_errors = []
            
            # Skip items that already have parsing errors
            if item.get('validation_errors'):
                validated_item['price_match_status'] = 'error'
                validated_item['price_validation_errors'] = ['Item has parsing errors']
                has_errors = True
                validation_summary['invalid_items'] += 1
            else:
                # Get expected price from database
                expected_price = PriceList.get_price(item['item_code'])
                
                if expected_price is None:
                    price_validation_errors.append('Item code not found in price list')
                    validated_item['price_match_status'] = 'not_found'
                    has_errors = True
                else:
                    # Compare prices (allow small floating point differences)
                    price_difference = abs(item['price'] - expected_price)
                    tolerance = 0.01  # 1 cent tolerance
                    
                    if price_difference <= tolerance:
                        validated_item['price_match_status'] = 'match'
                        validation_summary['valid_items'] += 1
                    else:
                        price_validation_errors.append(
                            f'Price mismatch: Expected {expected_price:.2f}, got {item["price"]:.2f}'
                        )
                        validated_item['price_match_status'] = 'mismatch'
                        has_errors = True
                        validation_summary['invalid_items'] += 1
                
                validated_item['expected_price'] = expected_price
                validated_item['price_validation_errors'] = price_validation_errors
                
                if price_validation_errors:
                    validation_summary['validation_errors'].extend(
                        [f"Row {item['row']}: {error}" for error in price_validation_errors]
                    )
            
            validated_items.append(validated_item)
        
        # Determine overall status
        if not has_errors and validation_summary['valid_items'] > 0:
            overall_status = 'success'
        else:
            overall_status = 'pending'
        
        return {
            'status': overall_status,
            'items': validated_items,
            'summary': validation_summary,
            'requires_review': has_errors
        }
    
    @staticmethod
    def get_validation_summary(validated_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary of validation results"""
        summary = {
            'total_items': len(validated_items),
            'successful_matches': 0,
            'price_mismatches': 0,
            'items_not_found': 0,
            'parsing_errors': 0,
            'details': []
        }
        
        for item in validated_items:
            status = item.get('price_match_status', 'error')
            
            if status == 'match':
                summary['successful_matches'] += 1
            elif status == 'mismatch':
                summary['price_mismatches'] += 1
                summary['details'].append({
                    'row': item['row'],
                    'item_code': item['item_code'],
                    'issue': 'Price mismatch',
                    'expected': item.get('expected_price'),
                    'actual': item['price']
                })
            elif status == 'not_found':
                summary['items_not_found'] += 1
                summary['details'].append({
                    'row': item['row'],
                    'item_code': item['item_code'],
                    'issue': 'Item not found in price list'
                })
            else:  # error
                summary['parsing_errors'] += 1
                summary['details'].append({
                    'row': item['row'],
                    'item_code': item.get('item_code', 'N/A'),
                    'issue': 'Parsing error',
                    'errors': item.get('validation_errors', [])
                })
        
        return summary 