# Creaticon 🎨

## Overview

Creaticon is a powerful AI-driven tool for generating beautiful UI components and icon packs. Simply describe what you want, and our AI will create professional-quality designs ready for download and use in your projects.

### ✨ Key Features

#### 🎨 Icon Generation
- **AI-Powered Icon Creation**: Generate custom SVG icon packs from descriptions
- **Multiple Formats**: Convert SVG icons to PNG, JPG, WebP, and ICO formats
- **Size Flexibility**: Generate icons in multiple sizes (16px to 512px)
- **Color Customization**: Preview and download icons in any color
- **Bulk Export**: Download complete icon packs as ZIP files
- **Professional Quality**: Vector-based SVG icons with clean, scalable designs

#### 🖼️ UI Component Generation
- **Component Creation**: Generate complete UI components from descriptions
- **Live Preview**: Real-time preview with iframe rendering
- **Multi-Format Export**: Download HTML, CSS, and JavaScript separately
- **Complete Packages**: Get organized ZIP files with all assets
- **Modern Styling**: Generated with Tailwind CSS and modern web standards

#### 🔧 Advanced Features
- **Format Conversion**: Convert SVG icons to multiple image formats
- **Custom Sizing**: Support for custom icon sizes up to 2048px
- **Quality Control**: Adjustable compression for JPG/WebP formats
- **Background Colors**: Customizable backgrounds for non-transparent formats
- **Batch Processing**: Convert multiple formats and sizes simultaneously
- **Smart Loading**: Real-time loading animations during generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/creaticon.git

# Navigate to the project directory
cd creaticon

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory and add your AI provider API keys:

```env
# OpenRouter API Key (for DeepSeek V3)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key

# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Hugging Face API Key
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## 📱 Usage

1. **Choose Generation Type**: Select between Icon Pack or UI Component
2. **Describe Your Vision**: Enter a detailed description of what you want to create
3. **Generate**: Click send and watch the AI create your designs
4. **Customize**: Adjust colors, sizes, and preview your creations
5. **Download**: Export individual files or complete packages

### Icon Generation Examples

```
"Create a set of e-commerce icons including shopping cart, heart, user profile, search, and payment icons in a modern flat style"

"Design minimalist social media icons for Facebook, Twitter, Instagram, LinkedIn, and YouTube with rounded corners"
```

### UI Component Examples

```
"Create a modern login form with gradient background, social login buttons, and smooth animations"

"Design a dashboard card showing user statistics with charts and modern styling"
```

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI Integration**: OpenRouter (DeepSeek V3), Google Gemini, Hugging Face
- **File Processing**: JSZip, File-Saver, Canvas API
- **Animations**: CSS animations, React transitions
- **Format Support**: SVG, PNG, JPG, WebP, ICO

## 🎯 Features in Detail

### Icon Conversion
- **Multiple Formats**: Convert SVG to PNG, JPG, WebP, ICO
- **Flexible Sizing**: Any size from 16px to 2048px
- **Quality Control**: Adjustable compression for lossy formats
- **Batch Export**: Generate multiple formats/sizes simultaneously
- **Custom Colors**: Preview and export in any color scheme

### UI Components
- **Live Preview**: Real-time iframe rendering
- **Complete Export**: HTML, CSS, JavaScript files
- **Modern Standards**: Tailwind CSS, responsive design
- **Package Downloads**: Organized ZIP files with documentation

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

