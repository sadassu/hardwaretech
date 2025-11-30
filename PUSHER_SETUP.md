# Pusher Setup Guide para sa Real-time Updates

## Bakit Pusher?

Ang Vercel ay hindi sumusuporta sa persistent WebSocket connections dahil serverless functions ang gamit nito. Ang Pusher ay isang third-party service na nagbibigay ng WebSocket functionality na compatible sa serverless deployments.

## Quick Start (Para sa Development)

**IMPORTANTE:** Para ma-enable ang real-time updates, kailangan mo munang gumawa ng Pusher account at i-configure ang environment variables.

### Step 1: Gumawa ng Pusher Account

1. Pumunta sa https://pusher.com
2. Click "Sign Up" (free account)
3. Pagkatapos mag-login, click "Create app" o "Channels app"
4. Piliin ang cluster na malapit sa iyo (e.g., **ap1** para sa Asia Pacific)
5. Click "Create app"

### Step 2: Kunin ang Pusher Credentials

Pagkatapos gumawa ng app, makikita mo sa dashboard:
- **App ID** (halimbawa: `1234567`)
- **Key** (halimbawa: `abc123def456`)
- **Secret** (halimbawa: `secret789xyz`)
- **Cluster** (halimbawa: `ap1`, `us2`, `eu`)

**Note:** Ang **Key** ay public at safe na i-share sa frontend. Ang **Secret** ay dapat na private lang at nasa backend lang.

### 3. Backend Environment Variables

Idagdag sa `.env` file ng backend:

```env
PUSHER_APP_ID=your_app_id_here
PUSHER_KEY=your_key_here
PUSHER_SECRET=your_secret_here
PUSHER_CLUSTER=ap1
```

**Para sa Vercel:**
1. Pumunta sa Vercel Dashboard
2. Piliin ang backend project
3. Pumunta sa Settings > Environment Variables
4. Idagdag ang lahat ng Pusher credentials

### 4. Frontend Environment Variables

**Para sa Development:**

1. Gumawa ng `.env` file sa `frontend/` directory (kung wala pa)
2. Idagdag ang Pusher credentials:

```env
VITE_PUSHER_KEY=your_key_here
VITE_PUSHER_CLUSTER=ap1
```

**Halimbawa:**
```env
VITE_PUSHER_KEY=abc123def456
VITE_PUSHER_CLUSTER=ap1
```

**Note:** Tingnan ang `frontend/.env.example` para sa template.

**Pagkatapos mag-dagdag ng `.env` file:**
1. I-restart ang Vite dev server (`npm run dev`)
2. Dapat makita mo sa console: "✅ Pusher connected"

**Para sa Vercel:**
1. Pumunta sa Vercel Dashboard
2. Piliin ang frontend project
3. Pumunta sa Settings > Environment Variables
4. Idagdag ang Pusher key at cluster

### 5. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 6. Test ang Setup

1. I-restart ang backend server
2. I-restart ang frontend dev server
3. Check ang console logs - dapat makita mo:
   - Backend: "✅ Pusher initialized for real-time updates"
   - Frontend: "✅ Pusher connected" at "✅ Subscribed to channel: hardware-tech-*"

## Pusher Channels

Ang system ay gumagamit ng mga channels para sa iba't ibang topics:

- `hardware-tech-general` - General updates
- `hardware-tech-reservations` - Reservation updates
- `hardware-tech-sales` - Sales updates
- `hardware-tech-supply` - Supply history updates
- `hardware-tech-inventory` - Product/variant updates
- `hardware-tech-dashboard` - Dashboard updates
- `hardware-tech-categories` - Category updates
- `hardware-tech-users` - User updates

## Free Tier Limits

Ang Pusher free tier ay may:
- 200,000 messages per day
- 100 concurrent connections
- 20 channels

Para sa karamihan ng applications, sapat na ito. Kung kailangan ng mas marami, may paid plans na available.

## Troubleshooting

### Hindi nagco-connect ang Pusher

1. Check kung naka-set ang environment variables
2. Verify ang Pusher credentials sa Pusher dashboard
3. Check ang browser console para sa errors
4. Verify na tama ang cluster (ap1, us2, eu, etc.)

### Hindi nag-u-update ang real-time data

1. Check kung naka-subscribe sa tamang channels
2. Verify na naka-trigger ang `emitGlobalUpdate` sa backend
3. Check ang Pusher dashboard para sa message activity

## Migration Notes

- Ang Socket.IO ay na-replace na ng Pusher
- Hindi na kailangan ng `http.createServer` sa backend
- Ang frontend ay gumagamit na ng `pusher-js` instead ng `socket.io-client`
- Parehong functionality pa rin - real-time updates para sa lahat ng operations

