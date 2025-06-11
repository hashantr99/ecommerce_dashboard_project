import { useState, useContext } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { toast } from 'react-toastify';
import type { Product } from '../../types';

interface ProductActionsProps {
  product: Product;
}

const ProductActions = ({ product }: ProductActionsProps) => {

  //const { deleteProduct, undoDelete } = useContext(ProductContext);
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('ProductActions must be used within a ProductProvider');
  }
  const { deleteProduct, undoDelete } = context;

  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleDelete = () => {
    deleteProduct(product.id);
    toast.success('Product deleted! Click to undo.', {
      onClick: () => undoDelete(product),
      autoClose: 5000,
    });
    setShowConfirm(false);
  };

  return (
    <div className="mt-4 flex space-x-2">
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-600 text-white px-3 py-1 rounded-md"
        aria-label={`Delete ${product.name}`}
      >
        Delete
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Are you sure you want to delete {product.name}?</p>
            <div className="mt-4 flex space-x-4">
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md">
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductActions