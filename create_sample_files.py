import pandas as pd
import os

# 创建示例文件夹
if not os.path.exists('sample_files'):
    os.makedirs('sample_files')

# 价格列表数据
price_data = {
    'Item Code': ['A001', 'A002', 'A003', 'B001', 'B002'],
    'Description': [
        'Product A - Standard',
        'Product A - Premium',
        'Product A - Deluxe',
        'Product B - Basic',
        'Product B - Premium'
    ],
    'Unit Price (USD)': [100.50, 150.75, 200.25, 80.00, 120.00],
    'Effective Date': ['2024-01-01', '2024-01-01', '2024-01-01', '2024-01-01', '2024-01-01'],
    'Category': ['Category A', 'Category A', 'Category A', 'Category B', 'Category B']
}

# 创建价格列表 Excel 文件
df_price = pd.DataFrame(price_data)
df_price.to_excel('sample_files/price_list_template.xlsx', index=False, sheet_name='Price List')

# 关税率数据
duty_data = {
    'HS Code': ['8471.30.00', '8471.41.00', '8471.49.00', '8471.50.00', '8471.60.00'],
    'Description': [
        'Portable computers',
        'Processing units',
        'System units',
        'Processing units',
        'Input/output units'
    ],
    'Duty Rate (%)': [0.00, 5.00, 7.50, 10.00, 2.50],
    'VAT Rate (%)': [13.00, 13.00, 13.00, 13.00, 13.00],
    'Notes': [
        'Duty free for educational use',
        'Standard rate applies',
        'Special rate for assembled units',
        'Higher rate for standalone units',
        'Reduced rate for peripherals'
    ]
}

# 创建关税率 Excel 文件
df_duty = pd.DataFrame(duty_data)
df_duty.to_excel('sample_files/duty_rates_template.xlsx', index=False, sheet_name='Duty Rates')

# 装箱单数据 - 简化版本，确保符合file_parser.py的要求
packing_list_data = {
    'Item Code': ['A001', 'A002', 'B001', 'A003', 'B002'],
    'Description': [
        'Product A - Standard',
        'Product A - Premium',
        'Product B - Basic',
        'Product A - Deluxe',
        'Product B - Premium'
    ],
    'Quantity': [100, 50, 75, 25, 40],
    'Unit Price': [100.50, 150.75, 80.00, 200.25, 120.00],  # 确保与价格列表匹配
}

# 创建装箱单 Excel 文件
df_packing = pd.DataFrame(packing_list_data)

# 创建一个 Excel writer 对象
with pd.ExcelWriter('sample_files/packing_list_template.xlsx', engine='openpyxl') as writer:
    # 写入主数据
    df_packing.to_excel(writer, index=False, sheet_name='Packing List')
    
    # 获取工作表对象
    worksheet = writer.sheets['Packing List']
    
    # 设置列宽
    for column in worksheet.columns:
        max_length = 0
        column = [cell for cell in column]
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = (max_length + 2)
        worksheet.column_dimensions[column[0].column_letter].width = adjusted_width

print("示例文件已创建在 'sample_files' 文件夹中：")
print("1. price_list_template.xlsx")
print("2. duty_rates_template.xlsx")
print("3. packing_list_template.xlsx") 