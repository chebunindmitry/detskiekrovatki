
import React from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  onSelect: (category: Category) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelect }) => {
  return (
    <div className="max-w-xs md:max-w-sm bg-[#242d37] p-3 rounded-2xl self-start flex flex-col items-stretch space-y-2">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => onSelect(category)}
          className="bg-gray-800 text-blue-400 font-semibold w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
