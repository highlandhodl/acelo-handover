# Acelo - AI-Powered Revenue Operations Platform

[![BETA Release](https://img.shields.io/badge/release-v1.0.0--beta.1-blue?style=flat-square)](https://github.com/acelo/revops-hub/releases)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

> **🎯 BETA RELEASE** - Feature-complete with enhanced automation and workflow capabilities

Acelo is an AI-powered revenue operations platform that combines intelligent prompts, automated workflows, centralised asset management, and AI coaching to accelerate sales and marketing processes. Built with modern React architecture and comprehensive testing infrastructure for rapid, reliable development.

---

## ✨ **Key Features (Beta Release)**

### 🧠 **Prompt Library**
- Curated collection of high-performing AI prompts
- Context-aware prompt workflows with multi-stage execution
- Real-time token counting and cost estimation
- Custom prompt creation and management

### 🧩 **Context Hub**
- Reusable context library for consistent AI interactions
- Organisational knowledge base with 10 predefined categories
- Context management and organisation
- Smart context integration with prompts

### 📁 **Asset Hub**
- Secure file storage using Supabase Storage
- Document upload and management
- File organisation and search capabilities
- Integration with popular file formats

### 🎓 **Coach Hub**
- AI-powered coaching system
- Specialised coaches for different business functions
- Voice-enabled coaching interactions
- Performance tracking and recommendations

### ⚙️ **Automation Hub**
- Advanced automation execution with real-time monitoring
- Enhanced automation creation modal with intelligent context and prompt selection
- Comprehensive automation run history and analytics
- Webhook-based automation system with failure recovery
- Integration with external APIs and services

---

## 🛠️ **Technology Stack**

Acelo is built with a modern, scalable technology stack optimised for performance and developer experience.

| Category | Technology | Purpose |
|----------|------------|----------|
| **Frontend** | React 18 + TypeScript | Type-safe UI development |
| **Build Tool** | Vite | Fast development and builds |
| **UI Components** | shadcn/ui + Tailwind CSS | Modern, accessible components |
| **State Management** | TanStack Query + React Hooks | Server and client state |
| **Backend** | Supabase | Database, Auth, Storage, Edge Functions |
| **Database** | PostgreSQL | Relational data with RLS |
| **AI Integration** | OpenAI API | GPT-powered intelligence |
| **Routing** | React Router DOM | Client-side navigation |
| **Testing** | Vitest + React Testing Library | Comprehensive testing suite |

-----

## 🚦 **Getting Started**

### **Prerequisites**

- Node.js v18+
- npm or yarn
- Supabase account
- OpenAI API key

### **Quick Setup**

```bash
# 1. Clone the repository
git clone https://github.com/acelo/revops-hub.git
cd revops-hub

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env file with your Supabase credentials

# 4. Set up your Supabase project
# - Create a new project at https://supabase.com
# - Run the provided SQL migrations in your database
# - Set up Row Level Security (RLS) policies
# - Add your OpenAI API key as a Supabase secret

# 5. Start the development server
npm run dev
```

🌐 The application will be available at `http://localhost:5173`

### **Database Setup**

1. Create a new Supabase project
2. Run the database migrations (see `supabase/migrations/` folder)
3. Enable Row Level Security on all tables
4. Create the necessary RLS policies for user data protection

### **OpenAI Integration**

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com)
2. Add it as a secret in your Supabase project dashboard
3. Deploy the Edge Functions for secure API access

## 📚 **Documentation**

Comprehensive documentation is available to help you understand and contribute to Acelo:

- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[API Documentation](./docs/API.md)** - Complete API reference and endpoints
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Development workflow and guidelines
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Development standards and conventions
- **[Testing Guide](./docs/TESTING.md)** - Comprehensive testing documentation
- **[Changelog](./docs/CHANGELOG.md)** - Version history and release notes

### **Examples & References**

- **[Code Examples](./docs/examples/)** - Implementation patterns and examples
- **[Research Notes](./docs/research/)** - Technical research and decisions

## 🧪 **Development**

### **Development Standards**

Acelo follows strict development standards to ensure code quality and maintainability:

- **Flat Folder Structure**: Group files by function, not by feature
- **Relative Imports Only**: No absolute or aliased paths
- **Separation of Concerns**: Business logic in hooks, UI logic in components
- **Security First**: Row Level Security (RLS) on all database tables
- **Comprehensive Testing**: 85% minimum test coverage

### **Quality Assurance**

Before submitting code, ensure it passes all quality checks:

```bash
# Run linting
npm run lint

# Type checking
npm run typecheck

# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Build for production
npm run build
```

### **Project Structure**

```
src/
├── components/          # UI components organised by feature
├── hooks/              # Custom React hooks for business logic
├── pages/              # Page components
├── context/            # React context providers
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── test/               # Test utilities and mocks

docs/
├── examples/           # Code examples and patterns
├── research/           # Technical research notes
├── ARCHITECTURE.md     # System architecture
├── API.md             # API documentation
├── CONTRIBUTING.md    # Contribution guidelines
├── DEPLOYMENT.md      # Deployment instructions
├── DEVELOPMENT.md     # Development standards
├── TESTING.md         # Testing guidelines
└── CHANGELOG.md       # Version history
```

## 🚀 **Deployment**

Acelo is optimised for deployment on Vercel with Supabase backend:

1. **Production**: Automatic deployment from `main` branch
2. **Staging**: Preview deployments for all pull requests
3. **Database**: Supabase managed PostgreSQL with migrations
4. **Functions**: Edge Functions deployed via Supabase CLI

See the [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 **Contributing**

We welcome contributions! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) to get started.

### **Development Workflow**
1. Follow the development standards outlined in [Development Guide](./docs/DEVELOPMENT.md)
2. Write tests for all new functionality
3. Ensure documentation is updated
4. Follow the code review process

### **Code Standards**
- TypeScript strict mode
- ESLint + Prettier formatting
- 85% test coverage minimum
- Comprehensive JSDoc comments

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](docs/LICENSE.md) file for details.

## 🙋‍♂️ **Support**

- **Issues**: [GitHub Issues](https://github.com/acelo/revops-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/acelo/revops-hub/discussions)
- **Documentation**: [Documentation Directory](./docs/)
- **Contact**: For additional support and information, reach out to [stuart@acelo.ai](mailto:stuart@acelo.ai)

---

**Built with ❤️ using modern React architecture and best practices**
