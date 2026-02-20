# MongoDB Setup Guide

## Quick Start

### 1. Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended for MVP)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier
3. Create a cluster (takes 3-5 minutes)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

**Option B: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

### 2. Configure Environment

Create `.env.local` in the `osint-board` directory:

```env
# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/osint-board?retryWrites=true&w=majority

# OR for local MongoDB
MONGODB_URI=mongodb://localhost:27017/osint-board
```

### 3. Seed the Database

```bash
cd osint-board
npm run db:seed
```

### 4. Start the Application

```bash
npm run dev
```

## Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:seed": "tsx lib/seed.ts",
    "db:reset": "tsx lib/seed.ts"
  }
}
```

## MongoDB Connection Details

The connection utility (`lib/mongodb.ts`) handles:
- ✅ Connection caching (prevents multiple connections in dev)
- ✅ Automatic reconnection
- ✅ Error handling
- ✅ Hot reload support

## Mongoose Models

All models are defined in `lib/models.ts`:
- `BoardModel` - Investigation boards
- `ThoughtModel` - Thought nodes
- `EvidenceModel` - Evidence items
- `EvidenceLinkModel` - Links between thoughts and evidence
- `ConnectionModel` - Connections between thoughts
- `CommentModel` - Comments on thoughts
- `AIActionModel` - AI suggested actions
- `AIInsightModel` - AI insights

## Indexes

The following indexes are automatically created:
- Boards: `createdBy`, `status`
- Thoughts: `boardId`, `status`, `type`
- Evidence: `boardId`, `type`
- Evidence Links: `nodeId`, `relation`
- Connections: `boardId`, `sourceId`, `targetId`
- Activities: `boardId`, `timestamp`

## Troubleshooting

### Connection Issues

**Error: "MongooseServerSelectionError"**
- Check if MongoDB is running: `brew services list` (macOS)
- Verify connection string in `.env.local`
- For Atlas: Check IP whitelist (add 0.0.0.0/0 for testing)

**Error: "Authentication failed"**
- Verify username/password in connection string
- For Atlas: Check database user permissions

### Seed Issues

**Error: "Duplicate key error"**
- Run seed again (it clears data first)
- Or manually drop database: `mongosh osint-board --eval "db.dropDatabase()"`

## MongoDB Compass (GUI)

Download MongoDB Compass for a visual interface:
https://www.mongodb.com/products/compass

Connect using your MONGODB_URI to browse data visually.

## Next Steps

1. ✅ MongoDB installed and running
2. ✅ Environment variables configured
3. ✅ Database seeded
4. ⏳ Update API routes to use MongoDB (next task)
5. ⏳ Test all CRUD operations
