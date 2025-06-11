import { useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ProductContext } from '../../context/ProductContext';
import ProductCard from '../../components/product/ProductCard';
import SkeletonCard from '../../components/product/SkeletonCard';
import type { Product } from '../../types';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

const PRODUCTS_PER_PAGE = 9;

interface ProductDisplayProps {
  setProductToEdit: (product: Product | null) => void;
}

function ProductDisplay({ setProductToEdit }: ProductDisplayProps) {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('ProductDisplay must be used within a ProductProvider');
  }
  const { products, loading, deleteProduct, undoDelete } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return products.slice(start, end);
  }, [products, currentPage]);

  const skeletonCards = Array(PRODUCTS_PER_PAGE).fill(0).map((_, index) => (
    <SkeletonCard key={index} />
  ));

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setOpenDropdownId(null);
      setProductToDelete(null);
    }
  }, [totalPages]);

  const toggleDropdown = useCallback((productId: string) => {
    setOpenDropdownId((prev) => (prev === productId ? null : productId));
    setProductToDelete(null);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setProductToEdit(product);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setProductToEdit]);

  const handleDeleteRequest = useCallback((product: Product) => {
    setProductToDelete(product);
    setOpenDropdownId(null);
  }, []);

  // const handleDeleteConfirm = useCallback(() => {
  //   if (!productToDelete) return;
  //   deleteProduct(productToDelete.id);
  //   // toast.success('Product deleted! Click to undo.', {
  //   //   onClick: () => undoDelete(productToDelete),
  //   //   autoClose: 5000,
  //   // });
  //   toast.info('Product deleted! Click to undo.', {
  //     onClick: () => undoDelete(productToDelete),
  //     autoClose: 5000,
  //   });
  //   setProductToDelete(null);
  // }, [productToDelete, deleteProduct, undoDelete]);


  const handleDeleteConfirm = useCallback(() => {
    if (!productToDelete) return;
    const toastId = toast.info('Product deleted! Click to undo.', {
      onClick: () => {
        console.log(`Undoing delete for product ID: ${productToDelete.id}`);
        undoDelete(productToDelete);
        toast.dismiss(toastId); // Dismiss toast after undo
      },
      autoClose: 5000,
    });
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
  }, [productToDelete, deleteProduct, undoDelete]);


  const handleDeleteCancel = useCallback(() => {
    setProductToDelete(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdown = dropdownRefs.current.get(openDropdownId);
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skeletonCards}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProducts.map((product: Product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => toggleDropdown(product.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Open menu for ${product.name}`}
                    aria-expanded={openDropdownId === product.id}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                  {openDropdownId === product.id && (
                    <div
                      ref={(el) => {
                        if (el) dropdownRefs.current.set(product.id, el);
                        else dropdownRefs.current.delete(product.id);
                      }}
                      className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                      <button
                        onClick={() => handleEdit(product)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        aria-label={`Edit ${product.name}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(product)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        aria-label={`Delete ${product.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Dialog open={!!productToDelete} onOpenChange={handleDeleteCancel}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete {productToDelete?.name}?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this product? <strong>This action can be undone via the notification {`(Click Toast message)`}.</strong>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={handleDeleteCancel}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
              aria-label="Previous page"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductDisplay;