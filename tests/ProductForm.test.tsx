import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
// import ProductForm from '../ProductForm';
// import { ProductContext } from '../../context/ProductContext';
// import { ProductContextType, Product } from '../../../types';
import ProductForm from '../src/components/forms/ProductForm';
import { ProductContext } from '../src/context/ProductContext';
import { ProductContextType, Product } from '../src/types';
import '@testing-library/jest-dom';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const mockContext: ProductContextType = {
  products: [],
  allProducts: [],
  loading: false,
  addProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  undoDelete: jest.fn(),
  setFilters: jest.fn(),
  filters: {},
  bulkDelete: jest.fn(),
};

const renderWithContext = (component: React.ReactElement, contextValue = mockContext) => {
  return render(
    <ProductContext.Provider value={contextValue}>
      {component}
    </ProductContext.Provider>
  );
};

describe('ProductForm', () => {
  const validProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    stock: 10,
    description: 'A test product description',
    image: 'https://example.com/image.jpg',
  };

  const invalidProductData = {
    name: 'a',
    price: '-1',
    stock: '-1',
    description: 'x'.repeat(201),
    image: 'invalid-url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should render form with all required fields', () => {
    renderWithContext(<ProductForm />);
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/price/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/stock quantity/i)).toHaveAttribute('aria-required', 'true');
  });

  it('should show validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    renderWithContext(<ProductForm />);
    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const imageInput = screen.getByLabelText(/image url/i);

    // Test real-time validation on change
    await user.type(nameInput, invalidProductData.name);
    expect(screen.getByText(/name must be 3-50 characters/i)).toBeInTheDocument();

    await user.type(priceInput, invalidProductData.price);
    expect(screen.getByText(/price must be a positive number/i)).toBeInTheDocument();

    await user.type(stockInput, invalidProductData.stock);
    expect(screen.getByText(/stock must be a non-negative integer/i)).toBeInTheDocument();

    await user.type(descriptionInput, invalidProductData.description);
    expect(screen.getByText(/description must be under 200 characters/i)).toBeInTheDocument();

    await user.type(imageInput, invalidProductData.image);
    await user.click(document.body); // Trigger blur
    expect(screen.getByText(/invalid image url/i)).toBeInTheDocument();

    // Test valid input clears errors
    await user.clear(nameInput);
    await user.type(nameInput, 'Valid Product');
    expect(screen.queryByText(/name must be 3-50 characters/i)).not.toBeInTheDocument();
  });

  it('should prevent submission with invalid data', async () => {
    const user = userEvent.setup();
    renderWithContext(<ProductForm />);
    const nameInput = screen.getByLabelText(/product name/i);
    const submitButton = screen.getByText(/add product/i);

    await user.type(nameInput, 'a');
    fireEvent.click(submitButton);

    expect(mockContext.addProduct).not.toHaveBeenCalled();
    expect(screen.getByText(/name must be 3-50 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/price must be a positive/i)).toBeInTheDocument();
    expect(screen.getByText(/stock must be a non-negative/i)).toBeInTheDocument();
  });

  it('should successfully add product with valid data', async () => {
    const user = userEvent.setup();
    renderWithContext(<ProductForm />);
    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const imageInput = screen.getByLabelText(/image url/i);
    const submitButton = screen.getByText(/add product/i);

    await user.type(nameInput, 'Test Product');
    await user.type(priceInput, '99.99');
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    await user.type(stockInput, '10');
    await user.type(descriptionInput, 'A test product description');
    await user.type(imageInput, 'https://example.com/image.jpg');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContext.addProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          price: 99.99,
          category: 'Electronics',
          stock: 10,
          description: 'A test product description',
          image: 'https://example.com/image.jpg',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Product added successfully!');
    });
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    renderWithContext(<ProductForm />);
    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const imageInput = screen.getByLabelText(/image url/i);
    const submitButton = screen.getByText(/add product/i);

    await user.type(nameInput, 'Test Product');
    await user.type(priceInput, '99.99');
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    await user.type(stockInput, '10');
    await user.type(descriptionInput, 'A test description');
    await user.type(imageInput, 'https://example.com/image.jpg');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(priceInput).toHaveValue('');
      expect(categorySelect).toHaveValue('Electronics');
      expect(stockInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
      expect(imageInput).toHaveValue('');
    });
  });

  it('should handle edit mode correctly', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderWithContext(<ProductForm productToEdit={validProduct} onCancel={onCancel} />);
    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const imageInput = screen.getByLabelText(/image url/i);
    const submitButton = screen.getByText(/update product/i);
    const cancelButton = screen.getByText(/cancel/i);

    // Verify pre-populated fields
    expect(nameInput).toHaveValue('Test Product');
    expect(priceInput).toHaveValue('99.99');
    expect(categorySelect).toHaveValue('Electronics');
    expect(stockInput).toHaveValue('10');
    expect(descriptionInput).toHaveValue('A test product description');
    expect(imageInput).toHaveValue('https://example.com/image.jpg');

    // Modify fields
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product');
    await user.clear(priceInput);
    await user.type(priceInput, '149.99');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContext.updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          name: 'Updated Product',
          price: 149.99,
          category: 'Electronics',
          stock: 10,
          description: 'A test product description',
          image: 'https://example.com/image.jpg',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Product updated successfully!');
      expect(onCancel).toHaveBeenCalled();
    });

    // Test cancel clears fields
    renderWithContext(<ProductForm productToEdit={validProduct} onCancel={onCancel} />);
    fireEvent.click(cancelButton);
    expect(nameInput).toHaveValue('');
    expect(priceInput).toHaveValue('');
    expect(categorySelect).toHaveValue('Electronics');
    expect(stockInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
    expect(imageInput).toHaveValue('');
    expect(onCancel).toHaveBeenCalled();
  });

  it('should handle invalid initial data in edit mode', async () => {
    const invalidProduct: Product = {
      id: '2',
      name: 'a',
      price: -1,
      category: 'Books',
      stock: -1,
      description: 'x'.repeat(201),
      image: 'invalid-url',
    };
    renderWithContext(<ProductForm productToEdit={invalidProduct} />);
    expect(screen.getByText(/name must be 3-50 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/price must be a positive/i)).toBeInTheDocument();
    expect(screen.getByText(/stock must be a non-negative/i)).toBeInTheDocument();
    expect(screen.getByText(/description must be under 200 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid image url/i)).toBeInTheDocument();
  });

  it('should handle empty form submission', async () => {
    renderWithContext(<ProductForm />);
    const submitButton = screen.getByText(/add product/i);
    fireEvent.click(submitButton);
    expect(mockContext.addProduct).not.toHaveBeenCalled();
    expect(screen.getByText(/name must be 3-50 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/price must be a positive/i)).toBeInTheDocument();
    expect(screen.getByText(/stock must be a non-negative/i)).toBeInTheDocument();
  });

  it('should handle localStorage mock correctly', async () => {
    const user = userEvent.setup();
    renderWithContext(<ProductForm />);
    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const stockInput = screen.getByLabelText(/stock quantity/i);
    const submitButton = screen.getByText(/add product/i);

    await user.type(nameInput, 'Test Product');
    await user.type(priceInput, '99.99');
    fireEvent.change(categorySelect, { target: { value: 'Electronics' } });
    await user.type(stockInput, '10');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockContext.addProduct).toHaveBeenCalled();
      expect(mockLocalStorage.getItem('products')).toBeTruthy();
    });
  });
});