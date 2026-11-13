# Billing Tables Summary

Tổng hợp các table components cho billing system với đầy đủ tính năng production-ready.

## 📋 Table Components

### 1. ServiceCategoryTable

**File:** `service-category.table.tsx`

**Features:**

- ✅ Hiển thị danh sách service categories
- ✅ Optimistic updates (Creating/Updating states)
- ✅ Permission-based actions (RBAC)
- ✅ Delete confirmation dialog
- ✅ Status badges (Active/Inactive)
- ✅ Loading skeletons
- ✅ Error handling
- ✅ Empty state

**Columns:**

- Index
- Name (with description)
- Code (monospace badge)
- Sort Order
- Status (Active/Inactive badge)
- Actions (Edit, Delete)

**Props:**

```typescript
interface ServiceCategoryTableProps {
  categories: ServiceCategory[];
  isLoading: boolean;
  isError: boolean;
}
```

### 2. ServiceItemTable

**File:** `service-item.table.tsx`

**Features:**

- ✅ Hiển thị danh sách service items
- ✅ Optimistic updates
- ✅ Permission-based actions
- ✅ Delete confirmation dialog
- ✅ Pricing type badges (Fixed/Quantity/Included)
- ✅ Category display
- ✅ Currency formatting
- ✅ Loading skeletons
- ✅ Error handling
- ✅ Empty state

**Columns:**

- Index
- Name (with description)
- Code (monospace badge)
- Category
- Default Price (formatted)
- Pricing Type (color-coded badge)
- Status (Active/Inactive badge)
- Actions (View, Edit, Delete)

**Props:**

```typescript
interface ServiceItemTableProps {
  items: ServiceItem[];
  isLoading: boolean;
  isError: boolean;
}
```

### 3. PlanTable (Existing)

**File:** `plan.table.tsx`

Đã có sẵn với đầy đủ tính năng.

### 4. InvoiceTable (Existing)

**File:** `invoice.table.tsx`

Đã có sẵn với đầy đủ tính năng.

### 5. SubscriptionTable (Existing)

**File:** `subscription.table.tsx`

Đã có sẵn với đầy đủ tính năng.

### 6. BillingRecordTable (Existing)

**File:** `billing-record.table.tsx`

Đã có sẵn với đầy đủ tính năng.

## 📄 Pages

### 1. Service Categories Page

**Path:** `/admin/packages/categories`
**File:** `src/app/(admin)/admin/packages/categories/page.tsx`

**Features:**

- ✅ Pagination
- ✅ Page size selection (10, 20, 50, 100)
- ✅ Refresh button
- ✅ Show/Hide inactive toggle
- ✅ Create button
- ✅ Responsive layout

**State Management:**

```typescript
- refreshKey: number
- currentPage: number
- pageSize: number
- showInactive: boolean
```

### 2. Service Items Page

**Path:** `/admin/packages/item`
**File:** `src/app/(admin)/admin/packages/item/page.tsx`

**Features:**

- ✅ Pagination
- ✅ Page size selection
- ✅ Refresh button
- ✅ Show/Hide inactive toggle
- ✅ Create button
- ✅ Responsive layout

**State Management:**

```typescript
- refreshKey: number
- currentPage: number
- pageSize: number
- showInactive: boolean
```

## 🎨 UI/UX Features

### Optimistic Updates

Tất cả tables đều hỗ trợ optimistic updates:

```typescript
// Creating state
isPending: true
- Opacity 60%
- Blue background
- "Creating..." badge
- Pointer events disabled

// Updating state
isUpdating: true
- Opacity 70%
- Yellow background
- "Updating..." badge
- Pointer events disabled
```

### Status Badges

Color-coded badges cho các trạng thái:

```typescript
// Active/Inactive
Active: bg-green-100 text-green-700
Inactive: bg-red-100 text-red-700

// Pricing Types
Fixed: bg-blue-100 text-blue-700
Quantity: bg-purple-100 text-purple-700
Included: bg-green-100 text-green-700
```

### Loading States

- Skeleton loaders cho từng row
- Smooth transitions
- Consistent height

### Error States

- Custom error component
- Retry functionality
- User-friendly messages

### Empty States

- Custom null component
- Helpful messages
- Call-to-action

## 🔐 Permission System

Tất cả actions đều được kiểm soát bởi RBAC:

```typescript
const { can } = usePermissionContext();

// Read permission
{can('billing', 'read') && <ViewButton />}

// Update permission
{can('billing', 'update') && <EditButton />}

// Delete permission
{can('billing', 'delete') && <DeleteButton />}
```

## 🎯 Best Practices

### 1. Type Safety

```typescript
// Strongly typed props
interface TableProps {
  items: ServiceItem[];
  isLoading: boolean;
  isError: boolean;
}
```

### 2. Confirmation Dialogs

```typescript
// Always confirm destructive actions
<QuestionDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  question="Delete Item?"
  description="This action cannot be undone."
  onConfirm={handleDeleteConfirm}
/>
```

### 3. Responsive Design

```typescript
// Mobile-first approach
<div className="md:flex col flex-col-2 bg-white md:flex-row">
  {/* Content */}
</div>
```

### 4. Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

### 5. Performance

- Memoized callbacks
- Optimistic updates
- Efficient re-renders
- Lazy loading

## 📱 Responsive Breakpoints

```css
/* Mobile */
< 768px: Stack layout, full width

/* Tablet */
768px - 1024px: Flex layout, adjusted spacing

/* Desktop */
> 1024px: Full flex layout, optimal spacing
```

## 🚀 Usage Examples

### Basic Usage

```typescript
import { ServiceCategoryTable } from '@/components/tables/billing';
import { ServiceCategoryList } from '@/libs/responses/billing';

function CategoriesPage() {
  const { categories, isLoading, isError } = ServiceCategoryList(
    page,
    filters,
    refreshKey
  );

  return (
    <ServiceCategoryTable
      categories={categories}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
```

### With Filters

```typescript
const filters = {
  page_size: 20,
  active_only: 'true',
  search: 'design',
};

const { items, isLoading, isError, pagination } = ServiceItemList(
  currentPage,
  filters,
  refreshKey
);
```

### With Pagination

```typescript
<CustomPagination
  currentPage={currentPage}
  totalPage={pagination.total_pages}
  onPageChange={handlePageChange}
/>
```

## 🔄 State Flow

```
User Action
    ↓
Optimistic Update (UI immediately reflects change)
    ↓
API Call
    ↓
Success → Replace temp data with real data
    ↓
Error → Rollback to previous state
    ↓
Invalidate Cache (after 1s)
```

## 📊 Data Flow

```
Page Component
    ↓
Response Lib (ServiceCategoryList)
    ↓
React Query Hook (useServiceCategories)
    ↓
API Handler (handleAPI)
    ↓
Backend API
```

## 🎨 Styling Conventions

### Colors

```typescript
// Primary
text-primary-600, bg-primary-800

// Status
bg-green-100 text-green-700  // Success
bg-red-100 text-red-700      // Error
bg-blue-100 text-blue-700    // Info
bg-yellow-100 text-yellow-700 // Warning

// Neutral
bg-gray-100 text-gray-700    // Default
```

### Spacing

```typescript
// Consistent spacing
(gap - 2, gap - 4, gap - 6);
(p - 2, p - 4, p - 6);
(mb - 2, mb - 4, mb - 6);
```

### Typography

```typescript
// Headings
font-bold text-primary-600

// Body
text-sm, text-xs

// Code
font-mono text-xs
```

## 🧪 Testing Checklist

- [ ] Table renders correctly with data
- [ ] Loading state shows skeletons
- [ ] Error state shows error message
- [ ] Empty state shows null message
- [ ] Pagination works correctly
- [ ] Page size change works
- [ ] Refresh button works
- [ ] Filter toggle works
- [ ] Create button navigates correctly
- [ ] Edit button navigates correctly
- [ ] Delete button shows confirmation
- [ ] Delete confirmation works
- [ ] Optimistic updates work
- [ ] Permission checks work
- [ ] Responsive layout works
- [ ] Accessibility features work

## 📝 Notes

1. **Optimistic Updates**: Tất cả mutations đều sử dụng optimistic updates để cải thiện UX
2. **Permission System**: Tất cả actions đều được kiểm soát bởi RBAC
3. **Error Handling**: Có error boundaries và fallback UI
4. **Loading States**: Skeleton loaders cho smooth UX
5. **Responsive**: Mobile-first design với breakpoints rõ ràng
6. **Type Safety**: Full TypeScript support
7. **Accessibility**: WCAG compliant (cần manual testing)
8. **Performance**: Optimized với React Query caching

## 🔮 Future Enhancements

- [ ] Bulk actions (select multiple, bulk delete)
- [ ] Advanced filters (date range, multi-select)
- [ ] Export functionality (CSV, PDF)
- [ ] Column sorting
- [ ] Column visibility toggle
- [ ] Search functionality
- [ ] Drag & drop reordering
- [ ] Inline editing
- [ ] Real-time updates (WebSocket)
- [ ] Keyboard shortcuts
