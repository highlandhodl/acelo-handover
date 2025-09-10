# Security Policy

## Supported Versions

We actively support the latest version of Acelo. Security updates are provided for:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Acelo team takes security seriously. If you discover a security vulnerability, please report it responsibly:

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities to:
- **Email**: [stuart@acelo.ai](mailto:stuart@acelo.ai)
- **Subject**: Security Vulnerability Report - Acelo

### What to Include

Please include the following information in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if available)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Detailed Assessment**: Within 72 hours
- **Fix Timeline**: Varies based on severity (1-30 days)

### Security Disclosure Process

1. **Report Received**: We acknowledge receipt of your vulnerability report
2. **Investigation**: Our team investigates and validates the issue
3. **Fix Development**: We develop and test a fix
4. **Coordinated Disclosure**: We coordinate the disclosure with you
5. **Public Release**: Security fix is released with proper attribution

## Security Best Practices

### For Developers

- Keep dependencies updated
- Follow secure coding practices
- Enable Row Level Security (RLS) on all database tables
- Never commit sensitive information (API keys, secrets)
- Use environment variables for configuration
- Implement proper input validation

### For Users

- Use strong, unique passwords
- Enable two-factor authentication when available
- Keep your browser updated
- Report suspicious activity immediately

## Security Features

Acelo implements several security measures:

### Database Security
- Row Level Security (RLS) policies on all user data
- Encrypted data at rest and in transit
- Regular security audits

### Authentication
- Supabase Auth with JWT tokens
- Secure session management
- Password strength requirements

### Infrastructure Security
- HTTPS-only communication
- Secure headers implementation
- Regular dependency updates
- Automated security scanning

## Security Contact

For all security-related inquiries and reports:

**Stuart McPherson**  
Security Contact  
[stuart@acelo.ai](mailto:stuart@acelo.ai)

---

Thank you for helping keep Acelo secure!