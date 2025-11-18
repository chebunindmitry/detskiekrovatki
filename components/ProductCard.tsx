
import React from 'react';
import { Product, Sticker } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  allStickers?: Sticker[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, allStickers }) => {
    const isOutOfStock = product.stock === 0;

    return (
        <div 
            onClick={() => onClick(product)}
            className="bg-white dark:bg-[#242d37] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 flex flex-col cursor-pointer hover:border-blue-500 transition-all transform hover:-translate-y-1"
        >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                <img className="w-full h-full object-cover" src={product.image} alt={product.name} />
                
                {/* Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-2 py-1 bg-red-500 rounded">Нет в наличии</span>
                    </div>
                )}

                {/* Stickers Container */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                     {/* Default SALE badge if specialPrice exists */}
                    {product.specialPrice && (
                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
                            SALE
                        </div>
                    )}
                    
                    {product.isBundle && (
                        <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">
                            КОМПЛЕКТ
                        </div>
                    )}
                    
                    {/* Custom Stickers */}
                    {product.stickerIds && allStickers && product.stickerIds.map(sid => {
                        const sticker = allStickers.find(s => s.id === sid);
                        if (!sticker) return null;
                        return (
                            <div 
                                key={sid}
                                className="text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase"
                                style={{ backgroundColor: sticker.bgColor, color: sticker.textColor }}
                            >
                                {sticker.name}
                            </div>
                        );
                    })}
                </div>

            </div>
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-gray-900 dark:text-white font-medium text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                <div className="mt-auto pt-2 flex items-center justify-between">
                    {product.specialPrice ? (
                        <div className="flex flex-col items-start">
                            <span className="text-red-500 dark:text-red-400 font-bold leading-none">{product.specialPrice.toLocaleString('ru-RU')} ₽</span>
                            <span className="text-gray-500 text-xs line-through">{product.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{product.price.toLocaleString('ru-RU')} ₽</span>
                    )}
                    
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
