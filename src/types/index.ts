export interface Product {
    id: string;
    name: string;
    price: number;
    category: 'Electronics' | 'Clothing' | 'Books' | 'Home' | 'Sports' | 'Other';
    stock: number;
    description: string;
    image?: string;
  }
  
  export interface Filters {
    searchTerm?: string;
    category?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    stockStatus?: 'In Stock' | 'Out of Stock' | 'Low Stock' | '';
  }
  

  export interface ProductContextType {
    products: Product[];
    allProducts: Product[];
    loading: boolean;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    undoDelete: (product: Product) => void;
    setFilters: (filters: Filters) => void;
    filters: Filters; // Added to context type
    bulkDelete: (ids: string[]) => void; // Added for bulk deletion
  }