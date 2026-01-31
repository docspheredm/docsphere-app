#!/bin/bash

# MediVoice Records - Quick Start Script
# Run this to get your development environment set up

set -e

echo "🏥 MediVoice Records - Quick Start Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node_version=$(node -v)
echo "  Using: $node_version"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (for Whisper API)
OPENAI_API_KEY=sk_your_api_key_here

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
    echo "✓ Created .env.local template (please update with your keys)"
    echo ""
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p src/app/api/patients
mkdir -p src/app/api/encounters
mkdir -p src/app/api/reminders
mkdir -p src/app/api/investigations
echo "✓ Directories ready"
echo ""

# List important files
echo "📚 Important Files:"
echo "  - MEDICAL_APP_README.md ........... Complete feature overview"
echo "  - SUPABASE_SETUP.md .............. Database setup guide"
echo "  - REACT_NATIVE_SETUP.md .......... Mobile app guide"
echo "  - IMPLEMENTATION_CHECKLIST.md .... Implementation roadmap"
echo ""

echo "🚀 Next Steps:"
echo "  1. Update .env.local with your Supabase & OpenAI keys"
echo "  2. Read: SUPABASE_SETUP.md (set up database)"
echo "  3. Run: npm run dev"
echo "  4. Open: http://localhost:3000"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "Need help? Check:"
echo "  📖 MEDICAL_APP_README.md - Full documentation"
echo "  🗂️  SUPABASE_SETUP.md - Database setup"
echo "  📱 REACT_NATIVE_SETUP.md - Mobile development"
