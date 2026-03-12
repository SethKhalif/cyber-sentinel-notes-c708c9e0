import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.post('/api/auth/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ user: data.user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy for CVE analysis
app.post('/api/analyze/cve', async (req: Request, res: Response) => {
  try {
    const { cveId } = req.body;

    if (!cveId) {
      return res.status(400).json({ error: 'CVE ID required' });
    }

    // Call Supabase function
    const { data, error } = await supabase.functions.invoke('analyze-cve', {
      body: { cveId }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('CVE analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy for threat analysis
app.post('/api/analyze/threat', async (req: Request, res: Response) => {
  try {
    const { threatData } = req.body;

    if (!threatData) {
      return res.status(400).json({ error: 'Threat data required' });
    }

    const { data, error } = await supabase.functions.invoke('analyze-threat', {
      body: { threatData }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Threat analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy for resource scanning
app.post('/api/analyze/resource', async (req: Request, res: Response) => {
  try {
    const { resource } = req.body;

    if (!resource) {
      return res.status(400).json({ error: 'Resource data required' });
    }

    const { data, error } = await supabase.functions.invoke('analyze-resource', {
      body: { resource }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Resource analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscription endpoints
app.post('/api/subscription/check', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: { userId }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/subscription/checkout', async (req: Request, res: Response) => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Plan ID and User ID required' });
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { planId, userId }
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`📝 API Documentation: http://localhost:${port}/api`);
});

export default app;
