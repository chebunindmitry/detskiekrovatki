from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import List, Optional, Dict
import json
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Загружаем переменные окружения
load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")

# --- Модели базы данных (SQLite) ---


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    parent_id: Optional[int] = Field(default=None)
    image: Optional[str] = None
    show_image: bool = True
    sort_order: int = 0
    status: bool = True


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int
    name: str
    price: float
    special_price: Optional[float] = None
    image: str
    images_json: str = "[]"  # Храним список как JSON строку
    sku: str
    stock: int
    status: bool = True
    description: Optional[str] = None
    attributes_json: str = "[]"

    # Для простоты храним сложные структуры как JSON строки в SQLite
    variant_labels_json: str = "[]"
    variant_values_json: str = "[]"
    sticker_ids_json: str = "[]"
    is_bundle: bool = False
    bundle_items_json: str = "[]"


# --- Настройки БД ---
sqlite_file_name = "store.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# --- Приложение FastAPI ---
app = FastAPI()

# Разрешаем запросы с вашего фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Эндпоинты ---


@app.get("/api/db")
def get_full_database():
    """Возвращает полную структуру данных, совместимую с текущим React приложением"""
    with Session(engine) as session:
        categories = session.exec(select(Category)).all()
        products = session.exec(select(Product)).all()

        # Преобразуем данные Python моделей в формат JSON для React
        products_formatted = []
        for p in products:
            p_dict = p.model_dump()
            # Десериализация JSON полей обратно в массивы
            p_dict["images"] = json.loads(p.images_json)
            p_dict["attributes"] = json.loads(p.attributes_json)
            p_dict["variantLabels"] = json.loads(p.variant_labels_json)
            p_dict["variantValues"] = json.loads(p.variant_values_json)
            p_dict["stickerIds"] = json.loads(p.sticker_ids_json)
            p_dict["bundleItems"] = json.loads(p.bundle_items_json)
            # CamelCase конвертация ключей для JS
            p_dict["categoryId"] = p_dict.pop("category_id")
            p_dict["specialPrice"] = p_dict.pop("special_price")
            p_dict["isBundle"] = p_dict.pop("is_bundle")

            products_formatted.append(p_dict)

        categories_formatted = []
        for c in categories:
            c_dict = c.model_dump()
            c_dict["parentId"] = c_dict.pop("parent_id")
            c_dict["showImage"] = c_dict.pop("show_image")
            c_dict["sortOrder"] = c_dict.pop("sort_order")
            categories_formatted.append(c_dict)

        # Статические настройки (можно тоже вынести в БД)
        return {
            "_generatedAt": 1715600000,
            "settings": {
                "name": "Детские Кроватки.рф (SQLite)",
                "description": "Работает на Python FastAPI + SQLite",
                "logoUrl": "https://детскиекроватки.рф/image/catalog/logoyellowupdate.png",
                "managerContact": "https://t.me/+79959060223",
                "showSku": True,
                "realPhotosEnabled": False,
                "realPhotos": [],
                "showProductsFromSubcategories": True,
            },
            "stats": {"favoritesCount": 0, "consultationsCount": 0},
            "stickers": [
                {
                    "id": "sale",
                    "name": "Акция",
                    "bgColor": "#ef4444",
                    "textColor": "#ffffff",
                },
                {
                    "id": "new",
                    "name": "Новинка",
                    "bgColor": "#22c55e",
                    "textColor": "#ffffff",
                },
            ],
            "products": products_formatted,
            "categories": categories_formatted,
        }


# --- CRUD операции для товаров ---


@app.post("/products/", response_model=Product)
def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: int, product_update: Product, session: Session = Depends(get_session)
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Обновляем поля
    for key, value in product_update.dict(exclude_unset=True).items():
        setattr(product, key, value)

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.delete("/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(product)
    session.commit()
    return {"message": "Product deleted successfully"}


# Получить все товары
@app.get("/products/", response_model=List[Product])
def get_all_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products


# --- Инициализация демо-данными (если база пуста) ---
def seed_data():
    with Session(engine) as session:
        if not session.exec(select(Category)).first():
            # Пример добавления категории
            cat1 = Category(id=1, name="Кроватки", sort_order=1, show_image=True)
            session.add(cat1)

            # Пример добавления товара
            prod1 = Product(
                category_id=1,
                name="Кроватка Python",
                price=5000,
                sku="PY-001",
                stock=10,
                image="https://picsum.photos/200",
                images_json='["https://picsum.photos/200"]',
                attributes_json='[{"name": "Материал", "text": "Код"}]',
            )
            session.add(prod1)
            session.commit()


if __name__ == "__main__":
    create_db_and_tables()
    # seed_data()
    import uvicorn

    # Запуск сервера на порту 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
