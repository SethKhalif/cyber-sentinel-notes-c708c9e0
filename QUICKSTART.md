# Quick Start Guide - Cyber Sentinel

## 🚀 Local Development (5 minutes)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd cyber-sentinel-notes
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Install & Run
```bash
# Install frontend + backend dependencies
npm install
npm run server:install

# In Terminal 1: Frontend (port 5173)
npm run dev

# In Terminal 2: Backend (port 3001)
npm run server:dev
```

**Access the app**: http://localhost:5173

---

## 🐳 Docker Development

### Run with Docker Compose
```bash
# Create .env file with your credentials
cp .env.example .env

# Start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
# - Redis: localhost:6379
```

### Build Individual Services
```bash
# Frontend only
docker build -t cyber-sentinel-frontend .

# Backend only
docker build -t cyber-sentinel-backend ./server

# Run containers
docker run -p 5173:5173 cyber-sentinel-frontend
docker run -p 3001:3001 cyber-sentinel-backend
```

---

## ☁️ Deploy to Lovable (Recommended)

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Lovable"
git push origin main
```

### 2. Create Lovable Project
- Go to [lovable.dev](https://lovable.dev)
- Connect your GitHub repository
- Lovable automatically deploys on every push!

### 3. Configure Environment
In Lovable Settings → Environment Variables, add:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_URL=https://your-api.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY=your_key
```

---

## 🔧 Available Commands

### Frontend Scripts
```bash
npm run dev         # Start dev server (port 5173)
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run vitest
npm run test:watch  # Watch mode tests
```

### Backend Scripts
```bash
npm run server:dev    # Start backend dev server
npm run server:build  # Build backend
npm run server:start  # Run production build
npm run build:full    # Build frontend + backend
npm run dev:full      # Run both servers
```

### Docker Scripts
```bash
docker-compose up --build     # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker build -t app .         # Build image
docker run -p 5173:5173 app   # Run image
```

---

## 📚 Project Structure

```
cyber-sentinel-notes/
├── src/                      # React frontend
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── contexts/           # React contexts
│   ├── lib/                # Utilities
│   └── App.tsx            # Main app
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.ts       # Main server
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Middleware
│   └── package.json
├── supabase/              # Supabase functions & migrations
├── public/                # Static assets
├── index.html             # HTML entry point
├── vite.config.ts         # Frontend config
├── tailwind.config.ts     # Tailwind CSS config
├── docker-compose.yml     # Docker services
├── Dockerfile             # Frontend container
└── DEPLOYMENT.md          # Detailed deployment guide
```

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Backend (server/.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_key
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI |
| **State Management** | React Query, Context API |
| **Routing** | React Router v6 |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Hosting** | Lovable.dev |
| **Containerization** | Docker, Docker Compose |

---

## 📖 Learn More

- [Lovable Docs](https://docs.lovable.dev)
- [Full Deployment Guide](./DEPLOYMENT.md)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js Guide](https://expressjs.com)
- [Supabase Docs](https://supabase.com/docs)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues or questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review GitHub Issues
- Contact the team

---

**Last Updated**: March 2026  
**Version**: 1.0.0
