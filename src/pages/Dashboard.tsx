import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ProductForm from '../components/forms/ProductForm';
import SearchFilters from '../components/forms/SearchFilters';
import ProductDisplay from '../components/dashboard/ProductDisplay';
//import ProductActions from '../components/product/ProductActions';
//import ProductCard from '../components/product/ProductCard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ToastContainer, toast } from 'react-toastify';
import type { Product } from '../types';
import { Button } from '../components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();
  //const { allProducts, deleteProduct } = useContext(ProductContext)!;
  const { deleteProduct } = useContext(ProductContext)!;
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // const handleEdit = (product: Product) => {
  //   setProductToEdit(product);
  // };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      selectedProducts.forEach((id) => deleteProduct(id));
      toast.success('Products deleted!');
      setSelectedProducts([]);
    }
  };

  const handleBulkDeleteNavigate = () => {
    navigate('/bulk-delete');
  };

  return (
    <ErrorBoundary>
      <ToastContainer/>
      <div className="space-y-6">
        <ProductForm productToEdit={productToEdit} onCancel={() => setProductToEdit(null)} />
        <SearchFilters />
        <div className="flex justify-end">
          <Button
            onClick={handleBulkDeleteNavigate}
            className="bg-red-600 hover:bg-red-700 text-white"
            aria-label="Navigate to Bulk Delete Page"
          >
            Bulk Delete
          </Button>
        </div>
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md"
            aria-label={`Delete ${selectedProducts.length} selected products`}
          >
            Delete Selected ({selectedProducts.length})
          </button>
        )}
        <ProductDisplay setProductToEdit={setProductToEdit} />
        {/*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProducts.map((product: Product) => (
            <div key={product.id} className="relative">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() =>
                  setSelectedProducts((prev) =>
                    prev.includes(product.id)
                      ? prev.filter((id) => id !== product.id)
                      : [...prev, product.id]
                  )
                }
                className="absolute top-2 right-2"
                aria-label={`Select ${product.name} for bulk actions`}
              />
              <ProductCard product={product} />
              <button
                onClick={() => handleEdit(product)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md mt-2"
                aria-label={`Edit ${product.name}`}
              >
                Edit
              </button>
              <ProductActions product={product} />
            </div>
          ))}
        </div>*/}
      </div>
    </ErrorBoundary>
  )
}

export default Dashboard