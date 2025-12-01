# Railway Deployment Guide - WebSocket Real-time Updates

This guide will help you deploy the Hardware Tech system with WebSocket real-time updates on Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- MongoDB database (MongoDB Atlas recommended)
- Git repository with your code

## Step 1: Deploy Backend to Railway

### 1.1 Create New Project

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or use Railway CLI)
4. Connect your repository

### 1.2 Configure Backend Service

1. Railway will auto-detect your `backend` folder
2. Set the **Root Directory** to `backend` in service settings
3. Set the **Start Command** to: `npm start`

### 1.3 Environment Variables

Add these environment variables in Railway:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5001
NODE_ENV=production

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Hardware Tech" <your-email@gmail.com>

# Rate Limiting (Upstash Redis - Optional)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 1.4 Railway-Specific Settings

1. **Port**: Railway automatically sets `PORT` environment variable - your code already uses this
2. **WebSocket Support**: Railway supports WebSockets natively - no additional configuration needed
3. **Health Checks**: Railway will automatically check your service health

### 1.5 Generate Domain

1. Click on your service
2. Go to "Settings" → "Networking"
3. Click "Generate Domain" to get your Railway URL (e.g., `your-app.up.railway.app`)

## Step 2: Deploy Frontend to Railway (or Vercel)

### Option A: Deploy Frontend to Railway

1. Create a new service in the same project
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to: `npm run build`
4. Set **Start Command** to: `npm run preview` (or use a static file server)

### Option B: Deploy Frontend to Vercel (Recommended)

Vercel is optimized for frontend deployments:

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Vercel will auto-detect Vite and configure it

### 2.1 Frontend Environment Variables

Add to your frontend deployment:

```env
VITE_REACT_APP_BACKEND_BASEURL=https://your-backend-railway-url.up.railway.app
```

**Important**: Use `https://` (not `http://`) for production!

## Step 3: WebSocket Configuration

### 3.1 Backend WebSocket Endpoint

Your WebSocket server is automatically available at:
```
wss://your-backend-railway-url.up.railway.app/ws
```

The frontend will automatically convert the backend URL:
- `https://` → `wss://` (secure WebSocket)
- `http://` → `ws://` (non-secure WebSocket)

### 3.2 Verify WebSocket Connection

1. Open your deployed frontend
2. Open browser DevTools → Console
3. You should see: `✅ WebSocket connected`
4. Check Network tab → WS filter → You should see a WebSocket connection

## Step 4: Testing Real-time Updates

1. Open your app in two browser windows
2. In Window 1: Create a reservation or make a sale
3. In Window 2: You should see the update appear automatically (no refresh needed)

## Troubleshooting

### WebSocket Connection Fails

1. **Check CORS settings**: Ensure `CLIENT_URL` in backend matches your frontend URL
2. **Check Railway logs**: `railway logs` or view in Railway dashboard
3. **Verify WebSocket URL**: Check browser console for the WebSocket URL being used
4. **Check firewall/proxy**: Railway should handle this automatically, but verify

### WebSocket Disconnects Frequently

1. **Check Railway service limits**: Free tier has connection limits
2. **Check browser console**: Look for error messages
3. **Verify ping/pong**: The server sends pings every 30 seconds to keep connections alive

### Real-time Updates Not Working

1. **Check WebSocket connection**: Verify it's connected in browser DevTools
2. **Check backend logs**: Look for WebSocket broadcast messages
3. **Verify channels**: Ensure clients are subscribed to the correct channels
4. **Check network**: Ensure no firewall is blocking WebSocket connections

## Railway-Specific Features

### Automatic HTTPS

Railway automatically provides HTTPS for your services, which means:
- WebSocket connections use `wss://` (secure)
- No SSL certificate configuration needed

### Health Checks

Railway automatically monitors your service. The WebSocket server includes:
- Connection tracking
- Automatic cleanup of dead connections
- Ping/pong heartbeat mechanism

### Scaling

Railway supports horizontal scaling:
- Multiple instances will share WebSocket connections
- Consider using Redis pub/sub for multi-instance WebSocket broadcasting (future enhancement)

## Monitoring

### View Logs

```bash
# Using Railway CLI
railway logs

# Or view in Railway Dashboard
# Go to your service → Logs tab
```

### Connection Stats

The WebSocket server logs connection information:
- Client connections/disconnections
- Channel subscriptions
- Broadcast statistics (in development mode)

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed (Railway or Vercel)
- [ ] Environment variables configured
- [ ] WebSocket connection verified in browser
- [ ] Real-time updates tested
- [ ] CORS configured correctly
- [ ] HTTPS/WSS working (Railway provides this automatically)
- [ ] Database connection working
- [ ] Email service configured (optional)

## Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check browser console for WebSocket errors
3. Verify all environment variables are set
4. Ensure `CLIENT_URL` matches your frontend domain exactly

## Notes

- Railway supports WebSockets natively - no special configuration needed
- The WebSocket server uses the same HTTP server, so it shares the same port
- Railway automatically handles load balancing and SSL termination
- WebSocket connections persist across Railway deployments (with reconnection logic)

