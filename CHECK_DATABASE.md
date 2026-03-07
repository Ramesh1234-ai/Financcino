# How to Check MongoDB Database

Your health check shows: ✅ **Database connected**

## Method 1: MongoDB Shell (Command Line)

### Step 1: Open a new terminal
```bash
cd c:\Users\DELL\Desktop\Kharcha-core
```

### Step 2: Connect to MongoDB
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/?...
Enterprise Server version: ...
>
```

### Step 3: Check databases
```bash
show dbs
```

You should see:
```
admin          40.00 KiB
config         12.00 KiB
kharcha-core   50.00 KiB
local          40.00 KiB
```

### Step 4: Use the Kharcha database
```bash
use kharcha-core
```

### Step 5: Check collections (tables)
```bash
show collections
```

You should see:
```
categories
expenses
users
budgets
analytics
transactions
```

### Step 6: Check data in collections
```bash
# View all users
db.users.find()

# View all expenses
db.expenses.find()

# View all categories
db.categories.find()

# Count records
db.expenses.countDocuments()
```

### Step 7: Exit MongoDB
```bash
exit
```

---

## Method 2: MongoDB Compass (GUI - Easier!)

### Step 1: Download & Install
Go to: https://www.mongodb.com/products/tools/compass
Download the installer for Windows

### Step 2: Install & Open
Follow the installation wizard

### Step 3: Connect
- Default connection: `mongodb://localhost:27017`
- Click "Connect"

### Step 4: Browse
- Left sidebar shows databases
- Click "kharcha-core" to expand
- Click collections to see data
- Beautiful GUI to view, edit, delete records

---

## Method 3: Use API Endpoints (Through Frontend)

Once your frontend is running, you can:

```bash
# Get all expenses (requires login token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/expenses

# Get all categories
curl http://localhost:3000/api/categories

# Get analytics
curl http://localhost:3000/api/analytics
```

---

## Common MongoDB Commands

| Command | What it does |
|---------|-------------|
| `show dbs` | List all databases |
| `use DATABASE_NAME` | Switch to a database |
| `show collections` | List all collections (tables) |
| `db.COLLECTION.find()` | Show all documents |
| `db.COLLECTION.findOne()` | Show first document |
| `db.COLLECTION.countDocuments()` | Count total documents |
| `db.COLLECTION.deleteMany({})` | Delete all documents |
| `exit` | Exit MongoDB shell |

---

## Check if MongoDB is Running

### Windows:

```bash
# Check if MongoDB service is running
Get-Service MongoDB
# Should show: Running

# Or restart MongoDB
Restart-Service MongoDB
```

### Mac/Linux:

```bash
# Check if running
ps aux | grep mongod

# Start if not running
mongod --dbpath /path/to/data
```

---

## Database Structure (What Data Gets Stored)

When you use the app:

```
kharcha-core (Database)
├── users (Collection)
│   └── { id, email, fullName, password, profilePicture }
├── expenses (Collection)
│   └── { userId, categoryId, description, amount, date, ... }
├── categories (Collection)
│   └── { userId, name, color, icon }
├── budgets (Collection)
│   └── { userId, categoryId, budgetLimit, period, ... }
├── analytics (Collection)
│   └── { userId, totalSpent, monthlyTrend, ... }
└── transactions (Collection)
    └── { userId, type, amount, status, ... }
```

---

## Next Steps

### ✅ If to see data in database:
1. Sign in to the app at `http://localhost:5173`
2. Create some expenses/budgets
3. Come back and check the database
4. You should see new records appearing

### View Data Flow:
```
Frontend (Create Expense)
    ↓
API Call (POST /api/expenses)
    ↓
Backend Controller (Save to MongoDB)
    ↓
MongoDB Database (Stores data)
    ↓
Query Database (mongosh or Compass)
    ↓
See your data!
```

---

## Troubleshooting

### MongoDB won't connect?

```bash
# Check if MongoDB is installed
mongosh --version

# If command not found, install:
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Start MongoDB service
mongod
```

### No data in database yet?

This is normal! The database is empty until you:
1. Create a user (sign up)
2. Add expenses
3. Create budgets

Just use the app, and data will appear in the database.

---

## Quick Test: Create & Verify Data

1. **Sign in** to `http://localhost:5173`
2. **Click "Add Expense"**
3. **Fill in:**
   - Description: "Coffee"
   - Amount: 5.50
   - Category: "Food & Dining"
   - Date: Today
4. **Click Submit**
5. **Open MongoDB shell:**
   ```bash
   mongosh
   use kharcha-core
   db.expenses.find()
   ```
6. **You should see your expense!**
   ```json
   {
     "_id": ObjectId(...),
     "userId": "...",
     "description": "Coffee",
     "amount": 5.5,
     "categoryId": "...",
     "date": ISODate(...)
   }
   ```

That's it! Your database is working! 🎉
