import React from 'react';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = React.memo(({ product }: ProductCardProps) => {
  const { name, price, category, stock, description, image } = product;
  const isInStock = stock > 0;
  const truncatedDescription = description.length > 100 ? `${description.slice(0, 100)}...` : description;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
      <img
        src={image || '/images/shopping-cart.jpg'}
        alt={name}
        className="w-full h-48 object-cover rounded-md mb-4"
        onError={(e) => ((e.target as HTMLImageElement).src = '/images/shopping-cart.jpg')}
        loading="lazy"
      />
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-gray-600">${price.toFixed(2)}</p>
      <p className="text-gray-500">{category}</p>
      <p className={isInStock ? 'text-green-500' : 'text-red-500'}>
        {isInStock ? `In Stock (${stock})` : 'Out of Stock'}
      </p>
      <p className="text-gray-500 text-sm mt-2">{truncatedDescription}</p>
    </div>
  );
});

export default ProductCard;