import { createContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Product, ProductContextType, Filters } from '../types';

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductState {
  products: Product[];
  filters: Filters;
  loading: boolean;
  deletedProduct: Product | null;
}

type ProductAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'UNDO_DELETE'; payload: Product }
  | { type: 'SET_FILTERS'; payload: Filters }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'BULK_DELETE'; payload: string[] }; // Added for bulk deletion

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        deletedProduct: state.products.find((p) => p.id === action.payload) || null,
      };
    // case 'UNDO_DELETE':
    //   return {
    //     ...state,
    //     products: [...state.products, action.payload].sort((a, b) => a.id.localeCompare(b.id)),
    //     deletedProduct: null,
    //   };
    case 'UNDO_DELETE':
      // Prevent duplicates by checking if product ID already exists
      if (state.products.some((p) => p.id === action.payload.id)) {
        console.log(`Undo skipped: Product ID ${action.payload.id} already exists`);
        return state;
      }
      return {
        ...state,
        products: [...state.products, action.payload].sort((a, b) => a.id.localeCompare(b.id)),
        deletedProduct: null,
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'BULK_DELETE':
      return {
        ...state,
        products: state.products.filter((p) => !action.payload.includes(p.id)),
        deletedProduct: null, // No undo for bulk delete
      };
    default:
      return state;
  }
};

interface ProductProviderProps {
  children: ReactNode;
}

function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    filters: {},
    loading: true,
    deletedProduct: null,
  });

  useEffect(() => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  }, [products]);

  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
    setProducts([...products, product]);
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    setProducts(products.map((p) => (p.id === product.id ? product : p)));
  };

  const deleteProduct = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    setProducts(products.filter((p) => p.id !== id));
  };

  // const undoDelete = (product: Product) => {
  //   dispatch({ type: 'UNDO_DELETE', payload: product });
  //   setProducts([...products, product].sort((a, b) => a.id.localeCompare(b.id)));
  // };
  const undoDelete = (product: Product) => {
    console.log(`undoDelete called for product ID: ${product.id}`);
    dispatch({ type: 'UNDO_DELETE', payload: product });
    setProducts(products.filter((p) => p.id !== product.id).concat(product).sort((a, b) => a.id.localeCompare(b.id)));
  };

  const bulkDelete = (ids: string[]) => {
    console.log(`bulkDelete called for IDs: ${ids}`);
    dispatch({ type: 'BULK_DELETE', payload: ids });
    setProducts(products.filter((p) => !ids.includes(p.id)));
  };

  const setFilters = (filters: Filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const filteredProducts = useMemo(() => {
    let result = state.products;
    if (state.filters.searchTerm) {
      const term = state.filters.searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }
    if (state.filters.category) {
      result = result.filter((p) => p.category === state.filters.category);
    }
    // if (state.filters.minPrice) {
    //   result = result.filter((p) => p.price >= state.filters.minPrice);
    // }
    // if (state.filters.maxPrice) {
    //   result = result.filter((p) => p.price <= state.filters.maxPrice);
    // }
    // if (state.filters.minPrice != null && typeof state.filters.minPrice === 'number') {
    //   result = result.filter((p) => p.price >= state.filters.minPrice);
    // }
    // if (state.filters.maxPrice != null && typeof state.filters.maxPrice === 'number') {
    //   result = result.filter((p) => p.price <= state.filters.maxPrice);
    // }
    if (state.filters.minPrice !== null && state.filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= state.filters.minPrice!);
    }
    if (state.filters.maxPrice !== null && state.filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= state.filters.maxPrice!);
    }
    if (state.filters.stockStatus) {
      if (state.filters.stockStatus === 'In Stock') {
        result = result.filter((p) => p.stock > 0);
      } else if (state.filters.stockStatus === 'Out of Stock') {
        result = result.filter((p) => p.stock === 0);
      } else if (state.filters.stockStatus === 'Low Stock') {
        result = result.filter((p) => p.stock > 0 && p.stock < 5);
      }
    }
    return result;
  }, [state.products, state.filters]);

  return (
    <ProductContext.Provider
      value={{
        products: filteredProducts,
        allProducts: state.products,
        loading: state.loading,
        addProduct,
        updateProduct,
        deleteProduct,
        undoDelete,
        setFilters,
        filters: state.filters, // filters added
        bulkDelete,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export default ProductProvider;