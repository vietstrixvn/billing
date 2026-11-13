# Service Item Price Display Update

## Overview

Updated the Service Item table to display active prices from the new Item Prices system instead of the deprecated `default_price` field.

## Changes Made

### 1. **New Component: ServiceItemPriceCell**

Created a dedicated component to display active prices for service items.

**Features:**

- Fetches and displays both monthly and yearly active prices
- Shows tiered pricing information in a tooltip
- Handles loading states with skeleton
- Displays "No price set" when no prices are available
- Compact display with price/period format

**Display Format:**

```
$50,000 VND /mo
$500,000 VND /yr
[i] (tooltip for tiered pricing)
```

### 2. **Updated Table Columns**

**Removed:**

- `default_price` - Deprecated field
- `pricing_type` - No longer used (fixed/quantity/included)
- `currency` - Now part of price display

**Added:**

- `unit` - Display measurement unit (GB, users, etc.)
- `price` - Active price with ServiceItemPriceCell component
- `is_metered` - Whether the item is usage-based

### 3. **Column Structure**

```typescript
const ServiceItemColumns = [
  { key: 'index', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'category', label: 'Category' },
  { key: 'unit', label: 'Unit' }, // NEW
  { key: 'price', label: 'Active Price' }, // UPDATED
  { key: 'is_metered', label: 'Metered' }, // NEW
  { key: 'is_active', label: 'Status' },
  { key: 'action', label: 'Actions' },
];
```

### 4. **Removed Functions**

- `formatCurrency()` - Moved to utils and used in ServiceItemPriceCell
- `getPricingTypeBadge()` - No longer needed

## Benefits

### 1. **Real-time Pricing**

- Displays current active prices from the pricing system
- Automatically updates when prices change
- Shows effective prices based on date

### 2. **Tiered Pricing Support**

- Visual indicator (info icon) when tiered pricing exists
- Tooltip shows all price tiers with quantity ranges
- Example:
  ```
  1-10 units: $50,000 VND
  11-50 units: $45,000 VND
  51+ units: $40,000 VND
  ```

### 3. **Multiple Billing Cycles**

- Shows both monthly and yearly prices
- Compact display format
- Easy price comparison

### 4. **Better Data Model**

- Aligns with new API structure
- Separates pricing from service item definition
- Supports price history and effective dates

## Usage Example

```tsx
<ServiceItemPriceCell itemId="item_123" refreshKey={0} />
```

## API Integration

The component uses the `ActiveItemPrice` hook which calls:

```
GET /admin/service-items/:id/prices/active?billing_cycle=monthly
GET /admin/service-items/:id/prices/active?billing_cycle=yearly
```

## Migration Notes

### For Existing Data

1. Service items no longer have `default_price`, `currency`, or `pricing_type` fields
2. Prices are now managed separately through the Item Prices system
3. Each service item can have multiple prices (monthly, yearly) with different tiers

### For New Service Items

1. Create the service item first (without price)
2. Add prices separately using the Item Prices endpoints
3. Prices can be updated independently without affecting the service item

## Future Enhancements

1. **Price History View**
   - Show price changes over time
   - Display effective date ranges

2. **Bulk Price Updates**
   - Update multiple item prices at once
   - Apply percentage increases/decreases

3. **Price Comparison**
   - Compare prices across different items
   - Show price trends

4. **Custom Billing Cycles**
   - Support quarterly, semi-annual cycles
   - Custom period pricing

---

**Last Updated**: 2026-05-13
**Related Files**:

- `src/components/tables/billing/ServiceItemPriceCell.tsx`
- `src/components/tables/billing/service-item.table.tsx`
- `src/libs/responses/billing/itemPriceLib.ts`
- `src/hooks/billing/useItemPrice.ts`
