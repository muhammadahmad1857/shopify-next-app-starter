# Adding New Pages

This guide explains how to add new pages to your Shopify app with proper navigation.

## Overview

Adding a new page involves two main steps:

1. **Create the page component** using Next.js App Router
2. **Add navigation link** to the Shopify sidebar menu

## Step 1: Create a New Page Route

### Using Next.js App Router

Create a new page by adding a `page.tsx` file in the `app/` directory:

```bash
# Example: Creating a new page at /products
mkdir web/app/products
touch web/app/products/page.tsx
```

### Basic Page Structure

```tsx
// web/app/products/page.tsx
import {
  Page,
  Card,
  Layout,
  TextContainer,
  DisplayText,
} from "@shopify/polaris";

export default function ProductsPage() {
  return (
    <Page
      title="Products"
      breadcrumbs={[{ content: "Home", url: "/" }]}
      primaryAction={{ content: "Add Product", url: "/products/new" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <TextContainer>
                <DisplayText size="large">Products Management</DisplayText>
                <p>Manage your store's products from this page.</p>
              </TextContainer>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### Advanced Example with Data Fetching

```tsx
// web/app/orders/page.tsx
"use client";

import { Page, Card, Layout, DataTable } from "@shopify/polaris";
import { useGraphQL } from "@/app/hooks/useGraphQL";
import { useState, useEffect } from "react";

const GET_ORDERS = `
  query getOrders($first: Int!) {
    orders(first: $first) {
      edges {
        node {
          id
          name
          totalPrice
          createdAt
        }
      }
    }
  }
`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const { request } = useGraphQL();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await request(GET_ORDERS, { first: 10 });
        setOrders(data.orders.edges.map((edge) => edge.node));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [request]);

  const rows = orders.map((order) => [
    order.name,
    order.totalPrice,
    new Date(order.createdAt).toLocaleDateString(),
  ]);

  return (
    <Page title="Orders" breadcrumbs={[{ content: "Home", url: "/" }]}>
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["Order", "Total", "Date"]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

## Step 2: Add Navigation to Sidebar

### Update Providers Configuration

Edit the `web/app/providers/providers.tsx` file to add your new page to the navigation:

```tsx
// web/app/providers/providers.tsx
"use client";

import { AppProvider, Link } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import { NavMenu } from "@shopify/app-bridge-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={translations}>
      <NavMenu>
        <Link url="/">Home</Link>
        <Link url="/products">Products</Link>
        <Link url="/orders">Orders</Link>
        <Link url="/settings">Settings</Link>
        <Link url="/new">New Page</Link>
      </NavMenu>
      <TanstackProvider>
        <SessionProvider>{children}</SessionProvider>
      </TanstackProvider>
    </AppProvider>
  );
}
```

### Navigation Best Practices

1. **Logical Order**: Arrange navigation items in a logical flow
2. **Clear Labels**: Use descriptive names for navigation items
3. **Consistent URLs**: Use kebab-case for URLs (`/product-settings` not `/productSettings`)
4. **Home Link**: Always include a link back to the home page

## Step 3: Advanced Page Features

### Nested Routes

Create nested routes for detailed pages:

```bash
# Create nested structure
mkdir -p web/app/products/[id]
touch web/app/products/[id]/page.tsx
```

```tsx
// web/app/products/[id]/page.tsx
interface ProductDetailProps {
  params: { id: string };
}

export default function ProductDetail({ params }: ProductDetailProps) {
  return (
    <Page
      title={`Product ${params.id}`}
      breadcrumbs={[
        { content: "Home", url: "/" },
        { content: "Products", url: "/products" },
      ]}
    >
      {/* Product detail content */}
    </Page>
  );
}
```

### Loading States

Add loading states for better UX:

```tsx
// web/app/products/loading.tsx
import { Page, Card, Layout, SkeletonPage } from "@shopify/polaris";

export default function Loading() {
  return (
    <SkeletonPage primaryAction title="Products">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <SkeletonBodyText lines={3} />
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
```

### Error Handling

Add error boundaries:

```tsx
// web/app/products/error.tsx
"use client";

import { Page, Card, Layout, Banner } from "@shopify/polaris";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Page title="Error" breadcrumbs={[{ content: "Home", url: "/" }]}>
      <Layout>
        <Layout.Section>
          <Banner status="critical" title="Something went wrong">
            <p>{error.message}</p>
            <button onClick={reset}>Try again</button>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

## Step 4: Testing Your New Page

1. **Start the development server**:

   ```bash
   pnpm dev
   ```

2. **Navigate to your new page** using the sidebar navigation

3. **Verify the URL** matches your expected route

4. **Test responsiveness** and ensure it works on different screen sizes

## Common Patterns

### Modal Pages

For overlay-style pages, use the `@modal` parallel route pattern:

```bash
mkdir -p web/app/@modal/products/new
touch web/app/@modal/products/new/page.tsx
```

### API Integration

Most pages will need to fetch data from Shopify's GraphQL API:

```tsx
import { useGraphQL } from "@/app/hooks/useGraphQL";
import { useQuery } from "@tanstack/react-query";

function MyPage() {
  const { request } = useGraphQL();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => request(GET_PRODUCTS_QUERY, { first: 10 }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    // Your page content
  );
}
```

## Troubleshooting

### Navigation Not Showing

- Ensure you've added the `<Link>` in the `NavMenu` component
- Check that the URL matches exactly
- Restart the development server

### Page Not Found

- Verify the file is named `page.tsx`
- Check the folder structure matches the URL
- Ensure the component is properly exported as default

### Styling Issues

- Import Polaris components correctly
- Use Polaris design tokens for consistency
- Check that global styles aren't conflicting

---

**Next Steps**: Learn how to [register webhooks](./webhooks.md) to handle real-time events from Shopify.
