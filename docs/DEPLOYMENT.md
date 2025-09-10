# Acelo Deployment Guide

This guide covers deployment strategies for Acelo across different environments and platforms.

## Overview

Acelo is deployed as a static React application with Supabase handling the backend services. The recommended deployment platform is Vercel, with Supabase managing the database, authentication, and Edge Functions.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │    Supabase     │    │     OpenAI      │
│                 │    │                 │    │                 │
│  - Static App   │───▶│  - Database     │◀───│  - AI Models    │
│  - Edge Cache   │    │  - Auth         │    │  - Completions  │
│  - Global CDN   │    │  - Storage      │    │  - Embeddings   │
│                 │    │  - Edge Funcs   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Configuration

### Environment Variables

#### Production (.env.production)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Application Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0-beta.1
VITE_APP_URL=https://acelo.ai

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

#### Staging (.env.staging)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key

# Application Configuration
VITE_APP_ENV=staging
VITE_APP_VERSION=1.0.0-beta.1
VITE_APP_URL=https://staging.acelo.ai
```

#### Local Development (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key

# Application Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0-beta.1
VITE_APP_URL=http://localhost:5173
```

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Supabase project configured

### Automatic Deployment (Recommended)

1. **Connect Repository**
   - Import project from GitHub to Vercel
   - Select the repository: `highlandhodl/revops-hub`

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "devCommand": "npm run dev"
   }
   ```

3. **Environment Variables**
   Add in Vercel Dashboard → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_ENV=production`

4. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for all PR branches

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy with environment
vercel --env VITE_APP_ENV=production
```

### Deployment Configuration (vercel.json)

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-project.supabase.co/rest/v1/$1",
      "headers": {
        "Cache-Control": "s-maxage=0"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Supabase Deployment

### Database Setup

1. **Create Supabase Project**
   ```bash
   # Using Supabase CLI
   supabase projects create acelo
   ```

2. **Run Migrations**
   ```bash
   # Apply database migrations
   supabase db push

   # Or reset and apply all migrations
   supabase db reset
   ```

3. **Configure RLS Policies**
   All tables should have Row Level Security enabled:
   ```sql
   -- Enable RLS on all user tables
   ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
   ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
   ```

### Edge Functions Deployment

1. **Deploy All Functions**
   ```bash
   # Deploy all functions
   supabase functions deploy

   # Deploy specific function
   supabase functions deploy ai-chat
   ```

2. **Set Function Secrets**
   ```bash
   # Set OpenAI API key
   supabase secrets set OPENAI_API_KEY=your_openai_api_key

   # Set other required secrets
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Test Functions**
   ```bash
   # Test function locally
   supabase functions serve

   # Test deployed function
   curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
     -H "Authorization: Bearer $ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "Hello"}]}'
   ```

## Alternative Deployment Options

### Netlify

1. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     VITE_SUPABASE_URL = "your_supabase_url"
     VITE_SUPABASE_ANON_KEY = "your_anon_key"
   ```

### AWS S3 + CloudFront

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages (404 → /index.html)

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t acelo .
docker run -p 80:80 acelo
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Observability

### Application Monitoring

1. **Vercel Analytics**
   - Automatic performance monitoring
   - Web vitals tracking
   - Error tracking

2. **Supabase Monitoring**
   - Database performance metrics
   - API usage statistics
   - Function execution logs

### Error Tracking

```typescript
// Configure error tracking
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    // Send error to monitoring service
    console.error('Application error:', event.error);
  });
}
```

### Health Checks

```typescript
// Health check endpoint simulation
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id')
      .limit(1);
    
    return { status: 'healthy', database: !error };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## Performance Optimization

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### Caching Strategies

1. **Static Assets**: Long-term caching (1 year)
2. **HTML**: No caching or short-term
3. **API Responses**: TanStack Query handles caching

### CDN Configuration

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Security Considerations

### HTTPS Only
- Force HTTPS redirects
- HSTS headers
- Secure cookie settings

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://*.supabase.co https://api.openai.com;">
```

### Environment Security
- Never commit sensitive environment variables
- Use secrets management for production
- Rotate API keys regularly

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment variables
   echo $VITE_SUPABASE_URL
   
   # Check build output
   npm run build -- --debug
   ```

3. **Supabase Connection Issues**
   - Verify project URL and API keys
   - Check RLS policies
   - Review network connectivity

### Debugging Production Issues

1. **Vercel Function Logs**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Supabase Logs**
   - Check function logs in Supabase dashboard
   - Review database logs
   - Monitor API usage

3. **Client-Side Debugging**
   - Browser developer tools
   - Network tab for API calls
   - Console for JavaScript errors

## Rollback Strategy

### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Database Rollback
```bash
# Rollback migration
supabase db reset --db-url [connection-string]

# Restore from backup
# (Use Supabase dashboard for point-in-time recovery)
```

## Support & Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Review security vulnerabilities
- Monitor performance metrics
- Backup database regularly
- Update documentation

### Emergency Procedures
1. Identify the issue scope
2. Rollback if necessary
3. Fix the root cause
4. Deploy hotfix
5. Post-mortem analysis

For deployment support, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Issues](https://github.com/acelo/revops-hub/issues)