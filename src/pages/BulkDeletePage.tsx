import { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductContext } from '../context/ProductContext';
import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const BulkDeletePage = () => {
    const context = useContext(ProductContext);
  if (!context) {
    throw new Error('BulkDeletePage must be used within a ProductProvider');
  }
  //const { allProducts, deleteProduct } = context;
  const { allProducts, bulkDelete } = context;
  const navigate = useNavigate();

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCheckboxChange = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const handleDeleteBulk = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);


const confirmDelete = useCallback(() => {
    console.log('Confirming bulk delete for IDs:', selectedProducts);
    bulkDelete(selectedProducts);
    toast.success(`${selectedProducts.length} product(s) deleted successfully!`);
    setSelectedProducts([]);
    setIsConfirmOpen(false);
    console.log('Bulk delete completed, cleared selectedProducts');
  }, [selectedProducts, bulkDelete]);

  const cancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Delete Products</h2>
        <Button
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-700 text-white"
          aria-label="Back to Dashboard"
        >
          Back
        </Button>
      </div>
      {allProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available.</p>
        </div>
      ) : (
        <>
          {selectedProducts.length > 0 && (
            <Button
              onClick={handleDeleteBulk}
              className="bg-red-600 hover:bg-red-700 text-white"
              aria-label={`Delete ${selectedProducts.length} selected products`}
            >
              Delete Bulk ({selectedProducts.length})
            </Button>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allProducts.map((product: Product) => (
              <div key={product.id} className="relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleCheckboxChange(product.id)}
                  className="absolute top-2 right-2 z-10"
                  aria-label={`Select ${product.name} for bulk deletion`}
                />
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {selectedProducts.length} Product(s)?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProducts.length} selected product(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelDelete} aria-label="Cancel bulk deletion">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} aria-label="Confirm bulk deletion">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BulkDeletePage