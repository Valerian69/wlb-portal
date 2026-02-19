# WLB Portal - Whistleblower Reporting System

[![Test Status](https://img.shields.io/badge/tests-151%20total-blue)]()
[![Test Pass Rate](https://img.shields.io/badge/pass%20rate-96%25-green)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)]()
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)]()

A secure, anonymous whistleblower reporting platform with **Role-Based Access Control (RBAC)**, **AES-256 encryption**, and **strictly isolated chat rooms**.

## 🚀 Features

### For Reporters
- ✅ **Anonymous Submission** - Multi-step form with no identity tracking
- ✅ **Secure Access** - Ticket ID + 6-digit PIN authentication
- ✅ **Status Tracking** - Visual progress tracker through investigation lifecycle
- ✅ **Encrypted Communication** - AES-256 encrypted chat with admins

### For External Admins
- ✅ **Dual-Chat Interface** - Bridge between reporters and internal teams
- ✅ **Report Management** - Full CRUD with status workflow
- ✅ **Message Relay** - Forward information between isolated chat rooms

### For Internal Admins
- ✅ **Validated Reports Only** - Access controlled by workflow status
- ✅ **Single Chat Channel** - Communicate with external admin team
- ✅ **Staff Management** - Company admins can manage internal team

### For Super Admins
- ✅ **Company Management** - Create/manage organizations
- ✅ **User Management** - Global user oversight
- ✅ **Audit Logs** - Comprehensive activity tracking

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| **Encryption** | AES-256-CBC for all sensitive data |
| **Authentication** | JWT + Bcrypt (12 salt rounds) |
| **PIN Security** | Hashed 6-digit PINs with lockout |
| **File Security** | EXIF metadata scrubbing |
| **Room Isolation** | Strict chat room access control |
| **Audit Trail** | All actions logged |

## 🏗️ Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS v4, Shadcn UI
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Testing:** Jest, React Testing Library, TestSprite MCP
- **Security:** crypto-js (AES-256), bcryptjs, jsonwebtoken

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd wlb-portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wlb_portal"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"

# File Storage (optional, for production)
S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# TestSprite (AI-powered)
npm run test:sprite
npm run test:sprite:all
```

**Test Coverage:** 151 tests across 7 suites (96% pass rate)

## 📁 Project Structure

```
wlb-portal/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin dashboards
│   │   └── portal/         # Reporter portal
│   ├── __tests__/          # Test files
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── lib/
│   │   ├── server/         # Backend utilities
│   │   └── api-client.ts   # API utility layer
│   └── types/              # TypeScript types
├── jest.config.js          # Jest configuration
├── testsprite.config.json  # TestSprite config
└── package.json
```

## 🔐 User Roles

| Role | Access |
|------|--------|
| **SUPER_ADMIN** | Global management |
| **COMPANY_ADMIN** | Organization management |
| **EXTERNAL_ADMIN** | Report management, message bridge |
| **INTERNAL_ADMIN** | Validated reports only |
| **REPORTER** | Anonymous submissions |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/admin` - Admin login
- `POST /api/auth/reporter` - Reporter login (Ticket ID + PIN)

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - List reports (RBAC filtered)

### Messages
- `GET /api/messages?roomId=` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/relay` - Relay between rooms

### Management
- `GET/POST /api/users` - User management
- `GET/POST /api/clients` - Company management
- `POST /api/upload` - File upload with EXIF scrubbing

## 🎯 Demo Credentials

```
Super Admin:     super@admin.com / demo123
Company Admin:   company@admin.com / demo123 (org: acme-corp)
External Admin:  admin@external.com / demo123
Internal Admin:  admin@internal.com / demo123 (org: acme-corp)
```

## 📖 Documentation

- [TESTSPRITE_GUIDE.md](./TESTSPRITE_GUIDE.md) - Testing guide
- [QWEN.md](./QWEN.md) - Complete project documentation

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Database Migration

```bash
npx prisma migrate deploy
```

### Environment Setup

Ensure these are set in production:
- `DATABASE_URL` - Production database
- `JWT_SECRET` - Secure random string (32+ chars)
- `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript strict mode
- Use ESLint for code quality
- Document API changes

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@wlbportal.com

---

Built with ❤️ using Next.js, TypeScript, and Prisma
