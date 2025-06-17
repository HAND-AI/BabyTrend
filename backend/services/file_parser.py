import pandas as pd
from typing import List, Dict, Any
import os

class FileParser:
    """Service class for parsing Excel files"""
    
    @staticmethod
    def parse_packing_list(file_path: str) -> Dict[str, Any]:
        """Parse packing list Excel file and extract item information"""
        try:
            # Read Excel file
            df = pd.read_excel(file_path, engine='openpyxl')
            
            # Clean column names (remove extra spaces, convert to lowercase)
            df.columns = df.columns.str.strip().str.lower()
            
            # Try to find relevant columns (flexible column matching)
            item_code_col = FileParser._find_column(df.columns, ['item code', 'item_code', 'code', 'product code'])
            quantity_col = FileParser._find_column(df.columns, ['quantity', 'qty', 'amount'])
            price_col = FileParser._find_column(df.columns, ['price', 'unit price', 'unit_price', 'cost'])
            
            if not all([item_code_col, quantity_col, price_col]):
                return {
                    'success': False,
                    'error': 'Required columns not found. Expected: Item Code, Quantity, Price',
                    'items': []
                }
            
            items = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    item = {
                        'row': index + 1,
                        'item_code': str(row[item_code_col]).strip() if pd.notna(row[item_code_col]) else None,
                        'quantity': float(row[quantity_col]) if pd.notna(row[quantity_col]) else None,
                        'price': float(row[price_col]) if pd.notna(row[price_col]) else None,
                        'validation_errors': []
                    }
                    
                    # Validate required fields
                    if not item['item_code']:
                        item['validation_errors'].append('Missing item code')
                    if item['quantity'] is None or item['quantity'] <= 0:
                        item['validation_errors'].append('Invalid quantity')
                    if item['price'] is None or item['price'] <= 0:
                        item['validation_errors'].append('Invalid price')
                    
                    items.append(item)
                    
                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")
            
            return {
                'success': len(errors) == 0,
                'items': items,
                'errors': errors,
                'total_items': len(items)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to parse file: {str(e)}',
                'items': []
            }
    
    @staticmethod
    def parse_price_list(file_path: str) -> Dict[str, Any]:
        """Parse price list Excel file"""
        try:
            df = pd.read_excel(file_path, engine='openpyxl')
            df.columns = df.columns.str.strip().str.lower()
            
            item_code_col = FileParser._find_column(df.columns, ['item code', 'item_code', 'code'])
            price_col = FileParser._find_column(df.columns, ['price', 'unit price', 'unit_price'])
            
            if not all([item_code_col, price_col]):
                return {
                    'success': False,
                    'error': 'Required columns not found. Expected: Item Code, Price'
                }
            
            price_data = {}
            errors = []
            
            for index, row in df.iterrows():
                try:
                    item_code = str(row[item_code_col]).strip() if pd.notna(row[item_code_col]) else None
                    price = float(row[price_col]) if pd.notna(row[price_col]) else None
                    
                    if item_code and price is not None and price > 0:
                        price_data[item_code] = price
                    else:
                        errors.append(f"Row {index + 1}: Invalid item code or price")
                        
                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")
            
            return {
                'success': len(errors) == 0,
                'price_data': price_data,
                'errors': errors,
                'total_items': len(price_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to parse file: {str(e)}'
            }
    
    @staticmethod
    def parse_duty_rates(file_path: str) -> Dict[str, Any]:
        """Parse duty rates Excel file"""
        try:
            df = pd.read_excel(file_path, engine='openpyxl')
            df.columns = df.columns.str.strip().str.lower()
            
            item_code_col = FileParser._find_column(df.columns, ['item code', 'item_code', 'code'])
            rate_col = FileParser._find_column(df.columns, ['rate', 'duty rate', 'duty_rate', 'tax rate'])
            
            if not all([item_code_col, rate_col]):
                return {
                    'success': False,
                    'error': 'Required columns not found. Expected: Item Code, Rate'
                }
            
            rate_data = {}
            errors = []
            
            for index, row in df.iterrows():
                try:
                    item_code = str(row[item_code_col]).strip() if pd.notna(row[item_code_col]) else None
                    rate = float(row[rate_col]) if pd.notna(row[rate_col]) else None
                    
                    if item_code and rate is not None and rate >= 0:
                        rate_data[item_code] = rate
                    else:
                        errors.append(f"Row {index + 1}: Invalid item code or rate")
                        
                except Exception as e:
                    errors.append(f"Row {index + 1}: {str(e)}")
            
            return {
                'success': len(errors) == 0,
                'rate_data': rate_data,
                'errors': errors,
                'total_items': len(rate_data)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to parse file: {str(e)}'
            }
    
    @staticmethod
    def _find_column(columns, possible_names):
        """Find column by checking possible names"""
        for col in columns:
            for name in possible_names:
                if name in col:
                    return col
        return None 