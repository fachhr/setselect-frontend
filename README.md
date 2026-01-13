# SetSelect - Talent Pool Frontend

A modern, streamlined platform for talent pool signup with automated CV parsing.

## Features

- ✨ Single-page talent pool signup form
- 📄 CV upload and automatic parsing
- 🔄 Asynchronous background processing
- 💼 Complete job preferences collection
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure Supabase integration
- 🚀 Built with Next.js 15 and React 19

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Form Handling**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Parser service deployed (Railway)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fachhr/setselect-frontend.git
cd setselect-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
- Supabase URL and keys
- Railway parser API URL
- Parser API key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
setselect-frontend/
├── app/
│   ├── api/                  # API routes
│   │   └── talent-pool/
│   │       ├── upload-cv/
│   │       └── submit/
│   ├── success/              # Success page
│   ├── terms/                # Terms & Conditions
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main landing page
│   └── globals.css           # Global styles
├── components/
│   ├── forms/                # Form components
│   │   ├── CVUploadSection.tsx
│   │   ├── ContactDetailsSection.tsx
│   │   ├── PreferencesSection.tsx
│   │   └── TermsSection.tsx
│   ├── ui/                   # Reusable UI components
│   └── TalentPoolForm.tsx    # Main form container
├── lib/
│   ├── supabase/             # Supabase client utilities
│   ├── validation/           # Zod schemas
│   └── utils/                # Helper functions
├── types/                    # TypeScript type definitions
└── public/                   # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Environment Variables

See `.env.example` for required environment variables.

**Required:**

**Client-side (exposed to browser):**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Server-side only (secure):**
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (CRITICAL: Server-side only!)
- `RAILWAY_API_URL` - Parser service URL (CHANGED from NEXT_PUBLIC_RAILWAY_API_URL for security)
- `PARSER_API_KEY` - API key for parser authentication

⚠️ **Security Note:** Never use `NEXT_PUBLIC_` prefix for secrets or internal URLs. See [CHANGELOG.md](CHANGELOG.md) for details on the security fix.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## Features in Detail

### Talent Pool Signup Flow

1. User fills out contact details (name, email, phone, LinkedIn, experience)
2. User sets job preferences (capacity, availability, location, industries, salary)
3. User uploads CV (PDF or DOCX, max 5MB)
4. User accepts terms and conditions
5. Form submits → immediate success response
6. Parser extracts additional data from CV in background (async)

### Fields Collected

**User-provided (14 fields):**
- Contact: First name, last name, email, LinkedIn, phone, years of experience
- Preferences: Working capacity %, available from date, desired duration, job types, locations, industries, salary range

**Parser-filled (~40+ fields):**
- Education history, work experience, skills, languages, certifications, projects, profile picture, and more

## Contributing

This is a private project. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All Rights Reserved

## Documentation

This project follows enterprise-grade documentation standards. All changes, tests, and engineering decisions are systematically tracked.

### Core Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Complete history of all changes, bug fixes, and features
- **[TESTING_LOG.md](TESTING_LOG.md)** - Test results, coverage reports, and QA activities
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide and verification
- **[docs/ENGINEERING_PRACTICES.md](docs/ENGINEERING_PRACTICES.md)** - Engineering standards, conventions, and best practices

### Technical Specifications

- **[docs/YEARS_OF_EXPERIENCE_CALCULATION.md](docs/YEARS_OF_EXPERIENCE_CALCULATION.md)** - Algorithm spec for years of experience calculation
- **[docs/FRONTEND_YEARS_VERIFICATION.md](docs/FRONTEND_YEARS_VERIFICATION.md)** - Frontend integration verification report

### Quick Links

- 🐛 Found a bug? Check [CHANGELOG.md](CHANGELOG.md) to see if it's already fixed
- 🧪 Adding tests? Follow guidelines in [TESTING_LOG.md](TESTING_LOG.md)
- 🚀 Deploying? Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- 📚 Contributing? Read [docs/ENGINEERING_PRACTICES.md](docs/ENGINEERING_PRACTICES.md)

## Support

For questions or issues, contact: [your-email@example.com]
