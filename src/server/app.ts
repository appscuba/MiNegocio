import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export interface AuthRequest extends Request {
  user?: any;
}

const app = express();
const SECRET_KEY = process.env.JWT_SECRET || 'profitmaster_secret_key_2026';
const DB_FILE = path.resolve(process.cwd(), 'db.json');

app.use(express.json());

// --- In-Memory Database (Internal DB) ---
interface DB {
  users: any[];
  inventory: any[];
  sales: any[];
}

const initialDB: DB = {
  users: [
    {
      id: 'admin-1',
      email: 'appscuba@gmail.com',
      password: bcrypt.hashSync('Asd9310*', 10),
      name: 'Admin Global',
      role: 'admin'
    }
  ],
  inventory: [],
  sales: []
};

// Global in-memory store for serverless environments
let memoryDB: DB = initialDB;

// Load from file if possible (local dev)
try {
  if (fs.existsSync(DB_FILE)) {
    const fileData = fs.readFileSync(DB_FILE, 'utf-8');
    memoryDB = JSON.parse(fileData);
    console.log('Loaded DB from file');
  }
} catch (e) {
  console.warn('Could not read from DB file, using initial memory state:', e);
}

const readDB = (): DB => memoryDB;

const writeDB = (data: DB) => {
  memoryDB = data;
  // Attempt to persist to file (only works in local dev or writable environments)
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Silently fail on Vercel/Read-only filesystems
    // The data remains in memoryDB for the current instance lifetime
  }
};

// --- Middleware ---
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET_KEY);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  const db = readDB();
  
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    password: bcrypt.hashSync(password, 10),
    name,
    role: 'seller' // Default role
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({ message: 'User created' });
});

// --- Inventory Routes ---
app.get('/api/inventory', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  res.json(db.inventory);
});

app.post('/api/inventory', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user.role === 'seller') return res.status(403).json({ message: 'Forbidden' });
  
  const db = readDB();
  const newProduct = { ...req.body, id: Date.now().toString() };
  db.inventory.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/inventory/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user.role === 'seller') return res.status(403).json({ message: 'Forbidden' });
  
  const db = readDB();
  const index = db.inventory.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Not found' });
  
  db.inventory[index] = { ...db.inventory[index], ...req.body };
  writeDB(db);
  res.json(db.inventory[index]);
});

app.delete('/api/inventory/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  const db = readDB();
  db.inventory = db.inventory.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.sendStatus(204);
});

// --- Sales Routes ---
app.get('/api/sales', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = readDB();
  res.json(db.sales);
});

app.post('/api/sales', authenticateToken, (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const db = readDB();
  const productIndex = db.inventory.findIndex(p => p.id === productId);
  
  if (productIndex === -1 || db.inventory[productIndex].currentStock <= 0) {
    return res.status(400).json({ message: 'Invalid product or out of stock' });
  }

  const product = db.inventory[productIndex];
  const sale = {
    id: Date.now().toString(),
    productId,
    productName: product.name,
    quantity: 1,
    profit: product.unitProfit,
    totalSale: product.salePrice,
    timestamp: Date.now(),
    sellerId: req.user.id
  };

  db.sales.push(sale);
  product.currentStock -= 1;
  product.unitsSold += 1;
  product.totalProfit = product.unitsSold * product.unitProfit;
  
  writeDB(db);
  res.status(201).json(sale);
});

export default app;
