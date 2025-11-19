import json
from sqlmodel import Session, select
from main import engine, Category, Product
import os

def migrate_data():
    # Читаем данные из db.json
    db_path = os.path.join('..', 'db.json')
    with open(db_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    with Session(engine) as session:
        # Очищаем существующие данные
        session.exec(Category.__table__.delete())
        session.exec(Product.__table__.delete())
        
        # Мигрируем категории
        for cat_data in data.get('categories', []):
            category = Category(
                id=cat_data['id'],
                name=cat_data['name'],
                image=cat_data.get('image'),
                show_image=cat_data.get('showImage', True),
                sort_order=cat_data.get('sortOrder', 0),
                status=cat_data.get('status', True)
            )
            session.add(category)
        
        # Мигрируем товары
        for prod_data in data.get('products', []):
            product = Product(
                id=prod_data['id'],
                category_id=prod_data['categoryId'],
                name=prod_data['name'],
                price=prod_data['price'],
                special_price=prod_data.get('specialPrice'),
                image=prod_data['image'],
                images_json=json.dumps(prod_data.get('images', [])),
                sku=prod_data['sku'],
                stock=prod_data['stock'],
                status=prod_data.get('status', True),
                description=prod_data.get('description'),
                attributes_json=json.dumps(prod_data.get('attributes', [])),
                variant_labels_json=json.dumps(prod_data.get('variantLabels', [])),
                variant_values_json=json.dumps(prod_data.get('variantValues', [])),
                sticker_ids_json=json.dumps(prod_data.get('stickerIds', [])),
                is_bundle=prod_data.get('isBundle', False),
                bundle_items_json=json.dumps(prod_data.get('bundleItems', []))
            )
            session.add(product)
        
        session.commit()
        print(f"Мигрировано: {len(data['categories'])} категорий, {len(data['products'])} товаров")

if __name__ == "__main__":
    migrate_data()
