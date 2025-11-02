# Contributing to Scientific Protocol Builder

Thank you for your interest in contributing to the Scientific Protocol Builder! This document provides guidelines and instructions for contributing to this project.

## 🎯 Project Overview

The Scientific Protocol Builder is a comprehensive Progressive Web Application (PWA) designed for collaborative scientific protocol development. It features:

- **Real-time Collaboration** (Phase 2, Week 9)
- **Instrument Management** (Phase 2, Week 10)  
- **Protocol Analysis Engine** (Phase 2, Week 11)
- **Mobile PWA with Offline Support** (Phase 2, Week 12)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 13.x or higher
- **Git** 2.x or higher

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/scientific-protocol-builder.git
   cd scientific-protocol-builder
   ```

2. **Install Dependencies**
   ```bash
   # Backend dependencies
   cd scientific-protocol-builder/backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit with your local configuration
   nano backend/.env
   nano frontend/.env
   ```

4. **Database Setup**
   ```bash
   # Follow database setup instructions
   cd ../database
   ./setup.sh
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```
scientific-protocol-builder/
├── frontend/                 # React + TypeScript PWA
│   ├── src/components/      # UI Components
│   ├── src/services/        # API Services
│   ├── src/hooks/          # React Hooks
│   └── public/             # PWA Assets
├── backend/                 # Node.js + Express API
│   ├── src/routes/         # API Routes
│   ├── src/services/       # Business Logic
│   ├── src/models/         # Database Models
│   └── src/socket/         # WebSocket Handlers
├── database/               # Database Scripts
└── docs/                   # Documentation
```

## 🎨 Code Style Guidelines

### Frontend (React/TypeScript)

- **Framework**: React 18 with TypeScript
- **Styling**: Material-UI (MUI) components
- **State Management**: Redux Toolkit
- **API Client**: Axios with custom service layer
- **Code Formatting**: Prettier with ESLint

```typescript
// Component example
interface MyComponentProps {
  title: string;
  onSave?: (data: any) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onSave 
}) => {
  const [data, setData] = useState<any>(null);
  
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
      {/* Component content */}
    </Box>
  );
};
```

### Backend (Node.js/Express)

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Sequelize/Mongoose
- **Authentication**: JWT with bcrypt
- **API Style**: RESTful with OpenAPI documentation
- **WebSocket**: Socket.IO for real-time features

```javascript
// Service example
class ProtocolService {
  async createProtocol(data) {
    try {
      // Validation
      if (!data.name) {
        throw new Error('Protocol name is required');
      }
      
      // Business logic
      const protocol = await Protocol.create(data);
      return protocol;
    } catch (error) {
      logger.error('Protocol creation failed:', error);
      throw error;
    }
  }
}
```

### Database

- **Primary**: PostgreSQL for relational data
- **Cache**: Redis for session storage
- **Migrations**: Sequelize migrations for schema changes
- **Naming**: snake_case for database fields, camelCase for JavaScript

## 🧪 Testing Guidelines

### Frontend Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- ComponentName.test.tsx
```

### Backend Testing
```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run specific test suite
npm test -- --grep "Protocol Service"
```

### Test Structure
- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user workflows
- **PWA Tests**: Test offline functionality and service workers

## 📚 Feature Development Process

### 1. Planning Phase
- Review existing architecture and design patterns
- Check integration points with existing weeks (9-12)
- Create feature specification document
- Identify any breaking changes

### 2. Implementation Phase
- Create feature branch: `feature/your-feature-name`
- Implement backend services and API endpoints
- Implement frontend components and integration
- Add comprehensive tests
- Update documentation

### 3. Integration Phase
- Test with existing collaboration features
- Verify mobile PWA compatibility
- Test offline functionality
- Validate real-time synchronization

### 4. Review Phase
- Self-review code for quality and standards
- Run full test suite
- Test in different environments
- Submit pull request with detailed description

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] PWA functionality is preserved
- [ ] Mobile responsiveness is maintained
- [ ] Collaboration features work correctly

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] PWA functionality verified

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainer reviews code quality
3. **Testing Review**: Functionality and integration testing
4. **Documentation Review**: Ensure docs are complete
5. **Approval**: Approved changes get merged

## 🐛 Bug Reporting

### Before Reporting
- Search existing issues for duplicates
- Test in latest version
- Try to reproduce consistently
- Check if it affects PWA/mobile functionality

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment:**
- OS: [e.g. iOS, Android, Windows]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]
- Device: [e.g. iPhone X, Desktop]

**Additional context**
Any other context about the problem
```

## 🚀 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions considered

**Additional context**
Screenshots, mockups, or examples

**Integration Considerations**
- Impact on collaboration features
- Mobile/PWA compatibility
- Offline functionality requirements
```

## 🏗️ Architecture Guidelines

### Frontend Architecture
- **Component Organization**: Feature-based folder structure
- **State Management**: Global state in Redux, local state in hooks
- **API Integration**: Service layer with error handling
- **PWA Integration**: Service worker and offline storage
- **Mobile Optimization**: Responsive design with touch support

### Backend Architecture
- **Service Layer**: Business logic separated from routes
- **Database Layer**: Models with proper relationships
- **WebSocket Integration**: Real-time features with Socket.IO
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Error Handling**: Centralized error handling and logging

### Integration Points
- **Week 9 Collaboration**: WebSocket events and operational transformation
- **Week 10 Instruments**: Real-time status and control integration
- **Week 11 Analysis**: Protocol analysis service integration
- **Week 12 PWA**: Offline storage and mobile optimization

## 📖 Documentation Standards

### Code Documentation
- **Functions**: JSDoc comments for all public functions
- **Components**: PropTypes or TypeScript interfaces
- **APIs**: OpenAPI/Swagger documentation
- **Services**: Service method documentation

### README Updates
- Keep installation instructions current
- Update feature lists for new capabilities
- Maintain accurate dependency lists
- Include troubleshooting sections

## 🔒 Security Guidelines

### Frontend Security
- Sanitize user inputs
- Validate API responses
- Secure localStorage usage
- Implement proper authentication flows

### Backend Security
- Input validation and sanitization
- SQL injection prevention
- Rate limiting on APIs
- Secure JWT implementation
- Environment variable protection

### PWA Security
- Secure service worker implementation
- Safe offline storage practices
- Secure WebSocket connections
- Content Security Policy headers

## 🌟 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes for significant contributions

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Documentation**: Check docs/ folder for detailed guides
- **Code Comments**: Inline documentation for complex logic

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to the Scientific Protocol Builder! Your efforts help make scientific research more collaborative and efficient. 🧬✨