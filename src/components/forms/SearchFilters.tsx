import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { debounce } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import type { Filters } from '../../types';

const validStockStatuses = ['In Stock', 'Out of Stock', 'Low Stock', ''] as const;

function SearchFilters() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('SearchFilters must be used within a ProductProvider');
  }
  const { setFilters, filters } = context;

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [stockStatus, setStockStatus] = useState<'' | 'In Stock' | 'Out of Stock' | 'Low Stock'>(
    (validStockStatuses.includes(searchParams.get('stockStatus') as any)
      ? searchParams.get('stockStatus')
      : '') as '' | 'In Stock' | 'Out of Stock' | 'Low Stock'
  );

  // Debounce filter updates to prevent rapid state changes
  const debouncedSetFilters = useCallback(
    debounce((newFilters: Filters) => {
      setFilters(newFilters);
    }, 300),
    [setFilters]
  );

  const handleFilterChange = useCallback(() => {
    const newFilters: Filters = {
      searchTerm,
      category: category === 'All' ? '' : category,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      stockStatus,
    };
    debouncedSetFilters(newFilters);
    // Update URL params directly, but avoid triggering re-renders
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (category !== 'All') params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (stockStatus) params.stockStatus = stockStatus;
    // Use a single update to prevent throttling
    setSearchParams(params, { replace: true }); // Use replace to avoid history stack growth
  }, [searchTerm, category, minPrice, maxPrice, stockStatus, debouncedSetFilters, setSearchParams]);

  // Debounce search term updates separately
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const newFilters: Filters = {
        ...filters,
        searchTerm: value,
      };
      debouncedSetFilters(newFilters);
      const params: Record<string, string> = {
        ...(value && { search: value }),
        ...(category !== 'All' && { category }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(stockStatus && { stockStatus }),
      };
      setSearchParams(params, { replace: true });
    }, 300),
    [filters, category, minPrice, maxPrice, stockStatus, debouncedSetFilters, setSearchParams]
  );

  // Sync state with URL params only on mount or when params change
  useEffect(() => {
    const newSearchTerm = searchParams.get('search') || '';
    const newCategory = searchParams.get('category') || 'All';
    const newMinPrice = searchParams.get('minPrice') || '';
    const newMaxPrice = searchParams.get('maxPrice') || '';
    const newStockStatus = validStockStatuses.includes(searchParams.get('stockStatus') as any)
      ? (searchParams.get('stockStatus') as '' | 'In Stock' | 'Out of Stock' | 'Low Stock')
      : '';

    // Only update state if values differ to prevent loops
    if (newSearchTerm !== searchTerm) setSearchTerm(newSearchTerm);
    if (newCategory !== category) setCategory(newCategory);
    if (newMinPrice !== minPrice) setMinPrice(newMinPrice);
    if (newMaxPrice !== maxPrice) setMaxPrice(newMaxPrice);
    if (newStockStatus !== stockStatus) setStockStatus(newStockStatus);
  }, [searchParams]); // Depend only on searchParams

  // Trigger filter updates when state changes
  useEffect(() => {
    handleFilterChange();
  }, [searchTerm, category, minPrice, maxPrice, stockStatus]); // Depend on state, not handleFilterChange

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setStockStatus('');
    setSearchParams({}, { replace: true });
    debouncedSetFilters({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4" aria-label="Search and Filters">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="search">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onBlur={() => debouncedSearch(searchTerm)} // Update on blur to reduce updates
            placeholder="Search by name or description"
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="minPrice">
            Min Price
          </label>
          <input
            type="number"
            id="minPrice"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="maxPrice">
            Max Price
          </label>
          <input
            type="number"
            id="maxPrice"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="stockStatus">
            Stock Status
          </label>
          <select
            id="stockStatus"
            value={stockStatus}
            onChange={(e) =>
              setStockStatus(
                e.target.value as '' | 'In Stock' | 'Out of Stock' | 'Low Stock'
              )
            }
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="">All</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Low Stock">Low Stock (&lt;5)</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleClearFilters}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
          Clear Filters
        </button>
        <div className="mt-2 text-sm text-gray-600">
          Active Filters: {searchTerm && `Search: ${searchTerm}, `}
          {category !== 'All' && `Category: ${category}, `}
          {minPrice && `Min Price: ${minPrice}, `}
          {maxPrice && `Max Price: ${maxPrice}, `}
          {stockStatus && `Stock: ${stockStatus}`}
        </div>
      </div>
    </div>
  );
}

export default SearchFilters;