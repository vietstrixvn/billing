# Billing Response Libraries

Response handler functions cho các billing endpoints. Các functions này wrap React Query hooks và cung cấp interface đơn giản hơn với default values.

## Service Categories

### ServiceCategoryList

Lấy danh sách service categories với pagination.

```typescript
const { categories, isLoading, isError, pagination } = ServiceCategoryList(
  currentPage,
  filters,
  refreshKey
);
```

**Parameters:**

- `currentPage: number` - Trang hiện tại
- `filters: Filters` - Bộ lọc (active_only, search, etc.)
- `refreshKey: number` - Key để force refresh

**Returns:**

- `categories: ServiceCategory[]` - Danh sách categories
- `isLoading: boolean` - Trạng thái loading
- `isError: boolean` - Trạng thái error
- `pagination: PaginationData` - Thông tin phân trang

### ServiceCategoryDetail

Lấy chi tiết một service category theo ID.

```typescript
const { category, isLoading, isError } = ServiceCategoryDetail(id, refreshKey);
```

### ServiceCategoryByCode

Lấy service category theo code.

```typescript
const { category, isLoading, isError } = ServiceCategoryByCode(
  code,
  refreshKey
);
```

## Service Items

### ServiceItemList

Lấy danh sách service items với pagination.

```typescript
const { items, isLoading, isError, pagination } = ServiceItemList(
  currentPage,
  filters,
  refreshKey
);
```

**Parameters:**

- `currentPage: number` - Trang hiện tại
- `filters: Filters` - Bộ lọc (category_id, active_only, etc.)
- `refreshKey: number` - Key để force refresh

**Returns:**

- `items: ServiceItem[]` - Danh sách items
- `isLoading: boolean` - Trạng thái loading
- `isError: boolean` - Trạng thái error
- `pagination: PaginationData` - Thông tin phân trang

### ServiceItemDetail

Lấy chi tiết một service item theo ID.

```typescript
const { item, isLoading, isError } = ServiceItemDetail(id, refreshKey);
```

### ServiceItemByCode

Lấy service item theo code.

```typescript
const { item, isLoading, isError } = ServiceItemByCode(code, refreshKey);
```

## Plan Included Items

### PlanIncludedItemList

Lấy danh sách items được bao gồm trong một plan.

```typescript
const { items, isLoading, isError } = PlanIncludedItemList(planId, refreshKey);
```

**Parameters:**

- `planId: string` - ID của plan
- `refreshKey: number` - Key để force refresh

**Returns:**

- `items: PlanIncludedItem[]` - Danh sách items trong plan
- `isLoading: boolean` - Trạng thái loading
- `isError: boolean` - Trạng thái error

### PlanIncludedItemDetail

Lấy chi tiết một plan included item theo ID.

```typescript
const { item, isLoading, isError } = PlanIncludedItemDetail(id, refreshKey);
```

## Invoice Items

### InvoiceItemList

Lấy danh sách items trong một invoice.

```typescript
const { items, isLoading, isError } = InvoiceItemList(invoiceId, refreshKey);
```

**Parameters:**

- `invoiceId: string` - ID của invoice
- `refreshKey: number` - Key để force refresh

**Returns:**

- `items: InvoiceItem[]` - Danh sách items trong invoice
- `isLoading: boolean` - Trạng thái loading
- `isError: boolean` - Trạng thái error

### InvoiceItemDetail

Lấy chi tiết một invoice item theo ID.

```typescript
const { item, isLoading, isError } = InvoiceItemDetail(id, refreshKey);
```

## Usage Examples

### Hiển thị danh sách Service Categories

```typescript
import { ServiceCategoryList } from '@/libs/responses';

function ServiceCategoriesPage() {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const { categories, isLoading, pagination } = ServiceCategoryList(
    page,
    { active_only: true },
    refreshKey
  );

  if (isLoading) return <Loading />;

  return (
    <div>
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Hiển thị chi tiết Service Item

```typescript
import { ServiceItemDetail } from '@/libs/responses';

function ServiceItemDetailPage({ itemId }: { itemId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { item, isLoading, isError } = ServiceItemDetail(itemId, refreshKey);

  if (isLoading) return <Loading />;
  if (isError || !item) return <Error />;

  return (
    <div>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p>Price: {item.default_price} {item.currency}</p>
      <p>Type: {item.pricing_type}</p>
    </div>
  );
}
```

### Hiển thị items trong Plan

```typescript
import { PlanIncludedItemList } from '@/libs/responses';

function PlanItemsSection({ planId }: { planId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { items, isLoading } = PlanIncludedItemList(planId, refreshKey);

  if (isLoading) return <Loading />;

  return (
    <div>
      <h2>Included Services</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.service_item?.name} - {item.service_item?.pricing_type}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Lọc Service Items theo Category

```typescript
import { ServiceItemList } from '@/libs/responses';

function CategoryServiceItems({ categoryId }: { categoryId: string }) {
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const { items, isLoading, pagination } = ServiceItemList(
    page,
    {
      category_id: categoryId,
      active_only: true
    },
    refreshKey
  );

  if (isLoading) return <Loading />;

  return (
    <div>
      <h2>Services in this Category</h2>
      {items.map(item => (
        <ServiceCard key={item.id} item={item} />
      ))}
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
```

## Notes

- Tất cả functions đều trả về default values khi data chưa load
- `refreshKey` có thể được increment để force refresh data
- Pagination default values được cung cấp để tránh null/undefined errors
- Các functions này wrap React Query hooks nên vẫn có cache và auto-refetch
