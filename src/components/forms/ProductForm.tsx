import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { toast } from 'react-toastify';
import type { Product } from '../../types';

interface ProductFormProps {
  productToEdit?: Product | null;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  price: string;
  category: 'Electronics' | 'Clothing' | 'Books' | 'Home' | 'Sports' | 'Other';
  stock: string;
  description: string;
  image?: string;
}

function ProductForm({ productToEdit, onCancel }: ProductFormProps) {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('ProductForm must be used within a ProductProvider');
  }
  const { addProduct, updateProduct } = context;

  const initialState: FormData = {
    name: '',
    price: '',
    category: 'Electronics',
    stock: '',
    description: '',
    image: '',
  };

  const [formData, setFormData] = useState<FormData>(
    productToEdit
      ? {
          name: productToEdit.name,
          price: productToEdit.price.toString(),
          category: productToEdit.category,
          stock: productToEdit.stock.toString(),
          description: productToEdit.description,
          image: productToEdit.image || '',
        }
      : initialState
  );
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateField = useCallback((name: keyof FormData, value: string) => {
    const newErrors: Partial<FormData> = {};
    switch (name) {
      case 'name':
        if (!value || value.length < 3 || value.length > 50) {
          newErrors.name = 'Name must be 3-50 characters';
        }
        break;
      case 'price':
        if (!value || Number(value) <= 0 || !/^\d+(\.\d{1,2})?$/.test(value)) {
          newErrors.price = 'Price must be a positive number with up to 2 decimal places';
        }
        break;
      case 'stock':
        if (!value || Number(value) < 0 || !Number.isInteger(Number(value))) {
          newErrors.stock = 'Stock must be a non-negative integer';
        }
        break;
      case 'description':
        if (value.length > 200) {
          newErrors.description = 'Description must be under 200 characters';
        }
        break;
      case 'image':
        // if (value && !/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/i.test(value)) {
        //   newErrors.image = 'Invalid image URL';
        // }
        if (value && !/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/i.test(value) && !(/^https?:\/\/.+$/i.test(value) && /(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(value))) {
          newErrors.image = 'Invalid image URL';
        }
        break;
      default:
        break;
    }
    return newErrors;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name || formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be 3-50 characters';
    }
    if (!formData.price || Number(formData.price) <= 0 || !/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must be a positive number with up to 2 decimal places';
    }
    if (!formData.stock || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be under 200 characters';
    }
    // if (formData.image && !/^https?:\/\/.*\.(png|jpg|jpeg|gif)$/i.test(formData.image)) {
    //   newErrors.image = 'Invalid image URL';
    // }

    if (
      formData.image &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(formData.image) &&
      !(/^https?:\/\/.+$/i.test(formData.image) && /(jpg|jpeg|png|gif|webp|bmp|svg)/i.test(formData.image))
    ) {
      newErrors.image = 'Invalid image URL';
    }    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Validate the changed field in real-time
    const fieldErrors = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, ...fieldErrors, ...(fieldErrors[name as keyof FormData] ? {} : { [name]: undefined }) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Re-validate the field on blur
    const fieldErrors = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, ...fieldErrors, ...(fieldErrors[name as keyof FormData] ? {} : { [name]: undefined }) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const product: Product = {
      id: productToEdit ? productToEdit.id : Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      description: formData.description,
      image: formData.image || undefined,
    };
    if (productToEdit) {
      updateProduct(product);
      toast.success('Product updated successfully!');
    } else {
      addProduct(product);
      toast.success('Product added successfully!');
    }
    setFormData(initialState);
    if (onCancel) onCancel();
  };

  const handleReset = () => {
    setFormData(initialState);
    setErrors({});
    if (!productToEdit && onCancel) onCancel();
  };

  const handleCancel = () => {
    setFormData(initialState);
    setErrors({});
    if (onCancel) onCancel();
  };

  useEffect(() => {
    if (productToEdit) {
      const newFormData = {
        name: productToEdit.name,
        price: productToEdit.price.toString(),
        category: productToEdit.category,
        stock: productToEdit.stock.toString(),
        description: productToEdit.description,
        image: productToEdit.image || '',
      };
      setFormData(newFormData);
      // Validate initial data when editing
      const initialErrors: Partial<FormData> = {};
      Object.entries(newFormData).forEach(([key, value]) => {
        const fieldErrors = validateField(key as keyof FormData, value);
        Object.assign(initialErrors, fieldErrors);
      });
      setErrors(initialErrors);
    } else {
      setFormData(initialState);
      setErrors({});
    }
  }, [productToEdit, validateField]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4" aria-label="Product Form">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="name">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="text-red-500 text-sm" role="alert">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="price">
          Price ($)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          step="0.01"
          aria-required="true"
          aria-invalid={!!errors.price}
          aria-describedby={errors.price ? 'price-error' : undefined}
        />
        {errors.price && (
          <p id="price-error" className="text-red-500 text-sm" role="alert">
            {errors.price}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          aria-required="true"
        >
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
          <option value="Sports">Sports</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="stock">
          Stock Quantity
        </label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          aria-required="true"
          aria-invalid={!!errors.stock}
          aria-describedby={errors.stock ? 'stock-error' : undefined}
        />
        {errors.stock && (
          <p id="stock-error" className="text-red-500 text-sm" role="alert">
            {errors.stock}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">
          Description ({200 - formData.description.length} characters left)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-red-500 text-sm" role="alert">
            {errors.description}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="image">
          Image URL
        </label>
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-1 block w-full border rounded-md p-2 text-black"
          aria-invalid={!!errors.image}
          aria-describedby={errors.image ? 'image-error' : undefined}
        />
        {errors.image && (
          <p id="image-error" className="text-red-500 text-sm" role="alert">
            {errors.image}
          </p>
        )}
      </div>
      <div className="flex space-x-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
          {productToEdit ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={productToEdit ? handleCancel : handleReset}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
          {productToEdit ? 'Cancel' : 'Reset'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;