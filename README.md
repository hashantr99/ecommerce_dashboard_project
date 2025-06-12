
# E-Commerce Product Dashboard

A modern, responsive web application for managing e-commerce products, built with React, TypeScript, Vite, and Tailwind CSS. The dashboard allows users to add, edit, delete, search, and filter products, with local storage persistence and a dedicated bulk delete feature.

For a detailed overview of the architectural decisions, code structure, and key components of the E-Commerce Product Dashboard visit ARCHITECTURE.md

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Features

### Product Management
- **Add Product**: Create new products using a form with real-time validation for name (3–50 characters), price (positive, up to 2 decimals), category, stock (non-negative integer), description (< 200 characters), and optional image URL.
- **Edit Product**: Update existing products via a form pre-populated with product data. Canceling in edit mode clears the form.
- **Delete Product**: Delete individual products via a three-dot dropdown menu with a confirmation dialog. Includes an undo option via a toast notification (5 seconds).
- **Product List**: Displays products in a paginated grid (9 products per page) with cards showing name, price, category, stock, description, and image (defaults to `public/images/shopping-cart.jpg` if no image URL).

### Search and Filter
- **Search**: Filter products by name or description using a search term.
- **Category Filter**: Filter by product category (Electronics, Clothing, Books, Home, Sports, Other).
- **Price Range**: Filter by minimum and maximum price.
- **Stock Status**: Filter by stock status (In Stock, Out of Stock, Low Stock <5).
- **Combined Filters**: Apply multiple filters simultaneously, with a "Clear Filters" button and active filter display.
- **No Results**: Shows a "No products found" message when filters yield no results.

### Bulk Delete
- **Dedicated Page**: Access via a "Bulk Delete" button on the dashboard, navigating to `/bulk-delete`.
- **Checkboxes**: Select products for deletion using checkboxes on product cards.
- **Delete Bulk Button**: Appears when one or more products are selected, showing the count (e.g., "Delete Bulk (2)").
- **Confirmation Dialog**: Confirms deletion with a Shadcn UI dialog ("Are you sure you want to delete X product(s)? This action cannot be undone").
- **No Undo**: Bulk deletion is permanent, with a success toast notification.
- **Back Button**: Returns to the dashboard.

### Persistence
- **Local Storage**: Products are stored in `localStorage` using a custom `useLocalStorage` hook, ensuring data persists across sessions.

### Testing
- **Comprehensive Tests**: Includes tests for `ProductForm` covering rendering, real-time validation, submission, edit mode, form clearing, and error scenarios.
- **Jest and React Testing Library**: Uses `@testing-library/react` for DOM testing and `ts-jest` for TypeScript support.
- **Mocked Dependencies**: Mocks `localStorage`, `react-toastify`, and `ProductContext` for isolated testing.

### UI and UX
- **Responsive Design**: Built with Tailwind CSS for a mobile-friendly, modern interface.
- **Accessible**: Includes ARIA attributes (e.g., `aria-required`, `aria-invalid`, `aria-label`) for form inputs, buttons, and dialogs.
- **Toast Notifications**: Uses `react-toastify` for success messages (add, edit, delete, bulk delete).
- **Shadcn UI**: Leverages Shadcn’s Dialog component for delete and bulk delete confirmations.
- **Three-Dot Dropdown**: Provides edit/delete actions per product with an outside click handler to close the menu.

## Prerequisites

- **Node.js**: Version 18 or higher (recommended).
- **npm**: Version 8 or higher (comes with Node.js).
- **Git**: For cloning the repository.
- **Browser**: Modern browser (e.g., Chrome, Firefox) for development and testing.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hashantr99/ecommerce_dashboard_project.git
   cd ecommerce_dashboard_project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Shadcn UI** (if not already initialized):
   - Initialize Shadcn UI:
     ```bash
     npx shadcn-ui@latest init
     ```
     - Select TypeScript (`Yes`).
     - Choose Tailwind CSS as the CSS framework.
     - Use `src/components/ui/` for components.
   - Add the Dialog component:
     ```bash
     npx shadcn-ui@latest add dialog
     ```

4. **Add Default Image**:
   - Place a default product image (e.g., `default-product.jpg`) in `public/images/`.
   - Ensure the path matches `/images/default-product.jpg` as used in `ProductCard.tsx`.

5. **Verify Configuration**:
   - Ensure `tailwind.config.js` includes Shadcn paths:
     ```javascript
     content: [
       './index.html',
       './src/**/*.{js,ts,jsx,tsx}',
       './src/components/ui/**/*.{js,ts,jsx,tsx}',
     ]
     ```
   - Confirm `index.css` imports `react-toastify`, `tailwind` CSS:
     ```css
     @import "tailwindcss";
     @import 'react-toastify/dist/ReactToastify.css';
     @import "tw-animate-css";
     ```

## Running the Application

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:5173` in your browser.

2. **Build for Production**:
   ```bash
   npm run build
   ```
   - Preview the production build:
     ```bash
     npm run preview
     ```


## Project Structure

```
ecommerce-dashboard/
├── public/
│   ├── images/
│   │   ├── default-product.jpg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Header.tsx
│   │   ├── forms/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── __tests__/
│   │   │   │   ├── ProductForm.test.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   ├── dashboard/
│   │   │   ├── ProductDisplay.tsx
│   ├── context/
│   │   ├── ProductContext.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── BulkDeletePage.tsx
│   ├── types/
│   │   ├── index.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── setupTests.ts
├── jest.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── README.md
```

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request.
