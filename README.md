# 🛍️ Shopify App Starter - Full-Stack Template

A modern, full-stack Shopify app starter built with **Next.js (App Router)**, **Shopify App Bridge React**, and **Polaris UI** with support for custom backends. This template provides everything you need to build production-ready Shopify apps with a seamless embedded admin experience.

## 🌟 Overview

This starter template is perfect for developers who want to build sophisticated Shopify apps with:

- **Modern Frontend**: Next.js 14 with App Router for optimal performance and developer experience
- **Embedded Admin Experience**: Seamless integration with Shopify Admin using App Bridge React
- **Beautiful UI**: Polaris components for consistent, accessible interfaces
- **Backend Flexibility**: Support for any backend (FastAPI, Express.js, NestJS, etc.)
- **Full Control**: Custom authentication, database management, and API endpoints

### When to Use This Template

- ✅ Building complex Shopify apps with custom business logic
- ✅ Need a custom backend for data processing, third-party integrations, or advanced features
- ✅ Want full control over authentication, database, and API design
- ✅ Require real-time features, custom webhooks, or advanced data management
- ✅ Building multi-tenant applications or apps with complex user management

## ✨ Features

### 🔧 Core Features

- **🚀 Next.js App Router** - Modern React with server components and optimized routing
- **🏪 Shopify App Bridge Integration** - Seamless embedded app experience
- **🎨 Polaris UI Components** - Beautiful, accessible, and consistent interfaces
- **🔐 OAuth Flow** - Secure authentication with Shopify stores
- **📡 Webhook Support** - Real-time event handling for store updates
- **🔄 Session Management** - Robust session storage with custom backend integration

### 🛠️ Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Framework**: Shopify Polaris
- **State Management**: TanStack Query (React Query)
- **GraphQL**: Apollo Client with code generation
- **Database**: Prisma ORM + MongoDB/Mongoose support
- **Authentication**: Shopify OAuth 2.0
- **Deployment Ready**: Vercel-optimized with custom backend support

### 🔜 Coming Soon

- **💳 Billing Integration** - Shopify billing API support
- **📊 Analytics Dashboard** - Built-in app performance tracking
- **🔒 Advanced Security** - Enhanced security features and best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Shopify CLI (`npm install -g @shopify/cli`)
- A Shopify Partner account and development store
- (Optional) ngrok or cloudflared for local tunneling

### By using Shopify CLI

```bash
pnpx @shopify/create-app@latest --template https://github.com/muhammadahmad1857/shopify-next-app-starter.git
```

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd efficient-outsource-app

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the `web/` directory:

```bash
cd web
# Create .env.local and copy the variables from the Environment Variables section below
touch .env.local
```

Copy the environment variables from the [Environment Variables](#environment-variables) section below and update the development URLs (HOST, NEXT_PUBLIC_HOST) with your local tunnel URLs.

### 3. Start Development

```bash
# Start the Shopify app development server
pnpm dev

# Or use Docker for full-stack development
pnpm docker-dev
```

The development server will:

- Start your Next.js frontend
- Set up ngrok tunneling (if configured)
- Register your app with Shopify
- Open your development store

### 4. Install the App

1. The CLI will provide a URL to install your app
2. Open the URL in your browser
3. Select your development store
4. Install and test your app

## 🔧 Environment Variables

Create a `.env.local` file in the `web/` directory with these variables:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=f4e7391b3c3383aa50fec5da47a0ec3f
SHOPIFY_API_SECRET=1290eb7f1281c416ea94cd9fbbc2638e
SHOPIFY_APP_URL=https://shopify-chat-agent.vercel.app

# Shopify API Scopes (comprehensive read/write permissions)
SCOPES="SCOPES YOU NEED.."

# Backend URLs
NEXT_PUBLIC_BASE_URL=YOUR BACKEND URL

```

## 📁 Folder Structure Explained

```
efficient-outsource-app/
├── web/                          # Next.js frontend application
│   ├── app/                      # Next.js App Router directory
│   │   ├── api/                  # API routes
│   │   │   ├── webhooks/         # Shopify webhook handlers
│   │   │   └── hello/            # Example API endpoint
│   │   ├── providers/            # React context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layout.tsx            # Root layout with App Bridge setup
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   ├── lib/                      # Utility functions and configurations
│   │   ├── shopify/              # Shopify-specific utilities
│   │   │   ├── initialize-context.ts  # Shopify API setup
│   │   │   ├── register-webhooks.ts   # Webhook registration
│   │   │   ├── verify.ts         # Request verification
│   │   │   └── gdpr.ts           # GDPR compliance handlers
│   │   ├── db/                   # Database utilities
│   │   │   ├── session-storage.ts     # Custom session management
│   │   │   └── app-installations.ts   # App installation tracking
│   │   └── gql/                  # GraphQL generated code
│   ├── middleware.ts             # Next.js middleware for security
│   ├── types/                    # TypeScript type definitions
│   └── public/                   # Static assets
├── backend/                      # Your custom backend (not included)
│   ├── src/                      # Backend source code
│   ├── routes/                   # API route handlers
│   └── models/                   # Database models
├── shopify.app.toml             # Shopify app configuration
└── package.json                 # Root package.json with scripts
```

## 🔄 Backend Integration

This template is designed to work with any backend technology. The frontend communicates with your backend through:

### Session Storage Integration

The `lib/db/session-storage.ts` file handles Shopify session management by communicating with your backend:

```typescript
// Example backend endpoints your custom backend should implement:
POST   /sessions          # Store session
GET    /sessions/:id      # Load session
DELETE /sessions/:id      # Delete session
DELETE /sessions          # Bulk delete sessions
GET    /sessions/shop/:shop # Find sessions by shop
```

### API Communication

- **HTTP Client**: Uses Axios for backend communication
- **Error Handling**: Robust error handling with retries
- **Security**: All requests include proper authentication headers
- **Timeout Management**: Configurable request timeouts

### Backend Examples

#### Express.js Backend

```javascript
app.post("/sessions", (req, res) => {
  // Store Shopify session in your database
});

app.get("/sessions/:id", (req, res) => {
  // Retrieve session by ID
});
```

#### FastAPI Backend

```python
@app.post("/sessions")
async def store_session(session: ShopifySession):
    # Store session in your database
    pass

@app.get("/sessions/{session_id}")
async def load_session(session_id: str):
    # Load session from database
    pass
```

## 🏠 Local Development

### Running Frontend & Backend Together

1. **Start your custom backend** (on port 8000 or update `NEXT_PUBLIC_BASE_URL`)
2. **Start the Shopify app**:
   ```bash
   pnpm dev
   ```

### Tunnel Setup (Required for Shopify)

Shopify requires HTTPS URLs. The Shopify CLI automatically sets up ngrok, but you can also use:

#### Option 1: ngrok (Recommended)

```bash
# Install ngrok
npm install -g ngrok

# In a separate terminal, tunnel your app
ngrok http 3000
```

#### Option 2: Cloudflared

```bash
# Install cloudflared
# Visit: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# Tunnel your app
cloudflared tunnel --url http://localhost:3000
```

### Updating App URLs

When your tunnel URL changes:

1. Update your `.env.local` file with the new URL
2. The Shopify CLI will automatically update your app configuration
3. Or manually update in [Shopify Partners Dashboard](https://partners.shopify.com/)

### Testing Webhooks Locally

1. Set up your webhook endpoints in `web/app/api/webhooks/route.ts`
2. Register webhooks in `web/lib/shopify/register-webhooks.ts`
3. Test using the Shopify CLI or manually trigger from your development store

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy**:
   ```bash
   pnpm build
   ```

### Backend Deployment Options

#### Render

```bash
# Create render.yaml in your backend directory
services:
  - type: web
    name: shopify-app-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly init
fly deploy
```

### Environment Variables for Production

Update these in your production environment:

- `HOST` - Your production domain
- `NEXT_PUBLIC_HOST` - Your production domain
- `NEXT_PUBLIC_BASE_URL` - Your backend API URL
- `DATABASE_URL` - Production database connection
- Update Shopify app URLs in Partners Dashboard

## 📚 Learn More

### Shopify Documentation

- [Shopify App Development](https://shopify.dev/docs/apps)
- [App Bridge React](https://shopify.dev/docs/api/app-bridge-library/react)
- [Polaris Design System](https://polaris.shopify.com/)
- [Shopify GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)
- [Webhooks Guide](https://shopify.dev/docs/apps/webhooks)
- [OAuth Flow](https://shopify.dev/docs/apps/auth/oauth)

### Technical Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Apollo Client](https://www.apollographql.com/docs/react/)

## 🎯 Common Use Cases

- **Inventory Management Apps** - Sync inventory across multiple channels
- **Marketing Automation** - Email campaigns, abandoned cart recovery
- **Product Importing** - Bulk import from suppliers or other platforms
- **Analytics & Reporting** - Custom dashboards and business intelligence
- **Customer Support** - Ticket management and customer communication
- **Pricing Optimization** - Dynamic pricing based on market conditions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits & Inspiration

This template was inspired by and builds upon the excellent work from:

- [ozzyonfire/shopify-next-app](https://github.com/ozzyonfire/shopify-next-app) - Original Next.js Shopify app template
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) - Official Shopify development tools
- [Next.js](https://nextjs.org/) - The React framework for production

## 💬 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs or request features in [GitHub Issues](../../issues)
- **Shopify Community**: [Shopify Partners Slack](https://shopifypartners.slack.com/)

---

**Happy building! 🚀** If you build something awesome with this template, we'd love to hear about it!
