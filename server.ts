import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: any;
}

const app = express();
const PORT = 3000;
const SECRET_KEY = 'profitmaster_secret_key_2026';
const DB_FILE = './db.json';

app.use(express.json());

// --- Database Initialization ---
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

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
}

const readDB = (): DB => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data: DB) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

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

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
