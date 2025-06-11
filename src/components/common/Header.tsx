import { useContext } from 'react';
import { ProductContext } from '../../context/ProductContext';

const Header = () => {
    const context = useContext(ProductContext);
  if (!context) {
    throw new Error('Header must be used within a ProductProvider');
  }
  const { allProducts } = context;

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold" aria-label="E-Commerce Dashboard">
          E-Commerce Dashboard
        </h1>
        <span aria-label={`Total products: ${allProducts.length}`}>
          Total Products: {allProducts.length}
        </span>
      </div>
    </header>
  )
}

export default Header