# Registering Webhooks

This guide explains how to register and handle webhooks in your Shopify app to receive real-time notifications about store events.

## Overview

Webhooks allow your app to receive HTTP notifications when specific events occur in a Shopify store. This app uses a centralized webhook API endpoint to handle all webhook events.

## How Webhooks Work in This App

1. **Webhook Registration**: Webhooks are registered when the app is installed or when you manually register them
2. **Event Handling**: All webhooks are received at `/api/webhooks` endpoint
3. **Processing**: The webhook handler routes events to specific callback functions
4. **Verification**: All webhooks are automatically verified for authenticity

## Step 1: Understanding the Current Setup

### Webhook API Endpoint

The main webhook handler is located at `web/app/api/webhooks/route.ts`:

```typescript
import shopify from "@/lib/shopify/initialize-context";
import { addHandlers } from "@/lib/shopify/register-webhooks";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const topic = headers().get("x-shopify-topic") as string;

  // Register handlers if not already registered
  const handlers = shopify.webhooks.getHandlers(topic);
  if (handlers.length === 0) {
    console.log(`No handlers found for topic: ${topic}`);
    addHandlers();
  }

  const rawBody = await req.text();

  await shopify.webhooks.process({
    rawBody,
    rawRequest: req,
  });

  console.log(`Webhook processed, returned status code 200`);
  return new Response(null, { status: 200 });
}
```

### Webhook Registration File

Webhook handlers are defined in `web/lib/shopify/register-webhooks.ts`:

```typescript
import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { setupGDPRWebHooks } from "./gdpr";
import shopify from "./initialize-context";
import { AppInstallations } from "../db/app-installations";

let webhooksInitialized = false;

export function addHandlers() {
  if (!webhooksInitialized) {
    setupGDPRWebHooks("/api/webhooks");

    // Add your webhook handlers here
    shopify.webhooks.addHandlers({
      ["APP_UNINSTALLED"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          console.log("Uninstalled app from shop: " + shop);
          await AppInstallations.delete(shop);
        },
      },
    });

    console.log("Added handlers");
    webhooksInitialized = true;
  }
}

export async function registerWebhooks(session: Session) {
  addHandlers();
  const responses = await shopify.webhooks.register({ session });
  console.log("Webhooks added", responses);
}
```

## Step 2: Adding New Webhook Handlers

### Basic Webhook Handler

To add a new webhook handler, modify the `addHandlers()` function in `register-webhooks.ts`:

```typescript
export function addHandlers() {
  if (!webhooksInitialized) {
    setupGDPRWebHooks("/api/webhooks");

    shopify.webhooks.addHandlers({
      // Existing handlers...
      ["APP_UNINSTALLED"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (_topic, shop, _body) => {
          console.log("Uninstalled app from shop: " + shop);
          await AppInstallations.delete(shop);
        },
      },

      // NEW: Product creation webhook
      ["PRODUCTS_CREATE"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body) => {
          console.log(`New product created in shop: ${shop}`);
          const product = JSON.parse(body);

          // Handle the new product
          await handleProductCreated(shop, product);
        },
      },

      // NEW: Order creation webhook
      ["ORDERS_CREATE"]: {
        deliveryMethod: DeliveryMethod.Http,
        callbackUrl: "/api/webhooks",
        callback: async (topic, shop, body) => {
          console.log(`New order created in shop: ${shop}`);
          const order = JSON.parse(body);

          // Handle the new order
          await handleOrderCreated(shop, order);
        },
      },
    });

    webhooksInitialized = true;
  }
}
```

### Advanced Webhook Handler with Error Handling

```typescript
["PRODUCTS_UPDATE"]: {
  deliveryMethod: DeliveryMethod.Http,
  callbackUrl: "/api/webhooks",
  callback: async (topic, shop, body) => {
    try {
      console.log(`Product updated in shop: ${shop}`);
      const product = JSON.parse(body);

      // Validate the product data
      if (!product.id || !product.title) {
        console.error("Invalid product data received");
        return;
      }

      // Send to your backend for processing
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/webhooks/product-updated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-Domain': shop,
        },
        body: JSON.stringify({
          product,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log(`Successfully processed product update for ${product.id}`);

    } catch (error) {
      console.error(`Error processing product update for shop ${shop}:`, error);

      // Optional: Send error to monitoring service
      // await notifyErrorService(error, { shop, topic, body });
    }
  },
},
```

## Step 3: Available Webhook Topics

Here are commonly used webhook topics you can register:

### Product Webhooks

```typescript
"PRODUCTS_CREATE"; // New product created
"PRODUCTS_UPDATE"; // Product updated
"PRODUCTS_DELETE"; // Product deleted
```

### Order Webhooks

```typescript
"ORDERS_CREATE"; // New order placed
"ORDERS_UPDATE"; // Order updated
"ORDERS_PAID"; // Order payment completed
"ORDERS_CANCELLED"; // Order cancelled
"ORDERS_FULFILLED"; // Order fulfilled
```

### Customer Webhooks

```typescript
"CUSTOMERS_CREATE"; // New customer registered
"CUSTOMERS_UPDATE"; // Customer information updated
"CUSTOMERS_DELETE"; // Customer deleted
```

### Inventory Webhooks

```typescript
"INVENTORY_LEVELS_UPDATE"; // Inventory level changed
"INVENTORY_ITEMS_CREATE"; // New inventory item
"INVENTORY_ITEMS_UPDATE"; // Inventory item updated
```

### App Webhooks

```typescript
"APP_UNINSTALLED"; // App uninstalled (already included)
"APP_SUBSCRIPTIONS_UPDATE"; // Billing subscription changed
```

## Step 4: Handler Function Examples

### Product Handler Functions

```typescript
// Add these functions to your register-webhooks.ts file

async function handleProductCreated(shop: string, product: any) {
  try {
    // Log the event
    console.log(`Processing new product: ${product.title} (ID: ${product.id})`);

    // Send to your backend
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shop-Domain": shop,
      },
      body: JSON.stringify({
        shopDomain: shop,
        productId: product.id,
        title: product.title,
        price: product.variants[0]?.price || "0",
        createdAt: product.created_at,
      }),
    });

    // Optional: Trigger additional workflows
    // await triggerProductAnalysis(product);
    // await updateInventoryTracking(product);
  } catch (error) {
    console.error("Error handling product creation:", error);
  }
}

async function handleOrderCreated(shop: string, order: any) {
  try {
    console.log(`Processing new order: ${order.name} (ID: ${order.id})`);

    // Calculate order analytics
    const orderData = {
      shopDomain: shop,
      orderId: order.id,
      orderNumber: order.name,
      totalPrice: order.total_price,
      currency: order.currency,
      customerEmail: order.email,
      lineItems: order.line_items.map((item) => ({
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.created_at,
    };

    // Send to backend for processing
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shop-Domain": shop,
      },
      body: JSON.stringify(orderData),
    });

    // Optional: Send confirmation email
    // await sendOrderConfirmation(order.email, orderData);
  } catch (error) {
    console.error("Error handling order creation:", error);
  }
}
```

## Step 5: Testing Webhooks

### Local Development Testing

1. **Start your development server**:

   ```bash
   pnpm dev
   ```

2. **Use ngrok to expose your local server**:

   ```bash
   ngrok http 3000
   ```

3. **Update your app URL** in Shopify Partners Dashboard with the ngrok URL

4. **Trigger events** in your development store to test webhooks

### Manual Webhook Testing

You can manually test webhooks using curl:

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: your-shop.myshopify.com" \
  -d '{
    "id": 12345,
    "name": "#1001",
    "total_price": "29.99",
    "created_at": "2024-01-01T00:00:00Z"
  }'
```

### Webhook Verification

The Shopify SDK automatically handles webhook verification. However, you can add additional logging:

```typescript
export async function POST(req: Request) {
  const topic = headers().get("x-shopify-topic") as string;
  const shop = headers().get("x-shopify-shop-domain") as string;

  console.log(`Received webhook: ${topic} from shop: ${shop}`);

  // Process webhook...

  return new Response(null, { status: 200 });
}
```

## Step 6: Production Considerations

### Error Handling and Retries

```typescript
async function handleWebhookWithRetry(handler: Function, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await handler();
      return; // Success
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Final attempt failed, log and potentially notify
        console.error("All webhook retry attempts failed");
        // await notifyWebhookFailure(error);
      } else {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}
```

### Webhook Logging

```typescript
async function logWebhook(
  topic: string,
  shop: string,
  success: boolean,
  error?: any,
) {
  const logEntry = {
    topic,
    shop,
    success,
    timestamp: new Date().toISOString(),
    error: error?.message || null,
  };

  // Send to your logging service
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/webhook-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(logEntry),
  });
}
```

## Troubleshooting

### Webhooks Not Firing

1. Check that webhooks are registered: Look for "Webhooks added" in console
2. Verify app URLs are correct in Shopify Partners Dashboard
3. Ensure ngrok/tunnel is running for local development
4. Check webhook delivery attempts in Shopify Partners Dashboard

### Webhook Handler Errors

1. Add comprehensive error logging in your handlers
2. Verify JSON parsing of webhook body
3. Check network connectivity to your backend
4. Validate webhook payload structure

### Performance Issues

1. Keep webhook handlers lightweight and fast
2. Use background jobs for heavy processing
3. Implement proper error handling and timeouts
4. Monitor webhook processing times

---

**Next Steps**: Learn about [adding new pages](./adding-pages.md) to create custom admin interfaces for your webhook data.
