# AI-UI Craft Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [API Reference](#api-reference)
6. [Component Library](#component-library)
7. [Icon Generation](#icon-generation)
8. [UI Generation](#ui-generation)
9. [Customization](#customization)
10. [Export & Download](#export--download)
11. [Contributing](#contributing)
12. [Deployment](#deployment)

## Project Overview

AI-UI Craft is a powerful web application that leverages artificial intelligence to generate beautiful, customizable UI components and icons. The platform provides designers and developers with an intuitive interface to create, modify, and download high-quality UI assets.

### Mission
To democratize UI design by providing AI-powered tools that generate beautiful, customizable interface elements that can be seamlessly integrated into any project.

### Key Objectives
- Generate high-quality UI components and icons using AI
- Provide extensive customization options (colors, gradients, styles)
- Export designs as downloadable images
- Maintain clean, production-ready code
- Offer an intuitive user experience

## Features

### Core Features
- **AI-Powered Generation**: Generate UI components and icons using advanced AI models
- **Real-time Preview**: See changes instantly as you customize
- **Export Options**: Download generated assets as images (PNG, SVG, JPG)
- **Customization Tools**: Modify colors, gradients, sizes, and styles
- **Gallery View**: Browse and select from generated variations
- **Responsive Design**: Works seamlessly across all devices

### Advanced Features
- **Batch Generation**: Generate multiple variations at once
- **Style Presets**: Pre-configured design templates
- **Animation Integration**: GSAP-powered animations
- **Project Management**: Save and organize your designs
- **Version History**: Track changes and revert when needed

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: GSAP (GreenSock Animation Platform)
- **AI Integration**: Google Gemini API
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Icons**: Lucide React

### Project Structure
```
ai-ui-craft/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components
│   │   ├── generator/             # Generation-specific components
│   │   └── landing/               # Landing page components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility functions and configs
│   ├── pages/                     # Page components
│   ├── api/                       # API integration
│   └── assets/                    # Static assets
├── public/                        # Public assets
└── docs/                          # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-ui-craft

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## API Reference

### Generation API
The generation API handles all AI-powered content creation.

#### Generate UI Component
```typescript
POST /api/generate
{
  type: 'component' | 'icon' | 'page',
  prompt: string,
  style?: string,
  variations?: number
}
```

#### Generate Icon
```typescript
POST /api/generate/icon
{
  prompt: string,
  style: 'minimal' | 'detailed' | 'outlined' | 'filled',
  color?: string,
  size?: number
}
```

### Customization API
Handle real-time modifications to generated content.

#### Update Colors
```typescript
PUT /api/customize/colors
{
  elementId: string,
  colors: {
    primary: string,
    secondary: string,
    accent: string
  }
}
```

## Component Library

### Core Components

#### GeneratorInterface
Main interface for creating UI elements.
```typescript
interface GeneratorProps {
  type: 'component' | 'icon' | 'page';
  onGenerate: (result: GenerationResult) => void;
  onCustomize: (options: CustomizationOptions) => void;
}
```

#### IconGallery
Displays generated icons with customization options.
```typescript
interface IconGalleryProps {
  icons: IconData[];
  onSelect: (icon: IconData) => void;
  onCustomize: (icon: IconData, options: CustomizationOptions) => void;
}
```

#### PageGallery
Shows generated page layouts and components.
```typescript
interface PageGalleryProps {
  pages: PageData[];
  onSelect: (page: PageData) => void;
  onPreview: (page: PageData) => void;
}
```

### UI Components
Built with shadcn/ui for consistency and accessibility:
- Button
- Card
- Dialog
- Input
- Select
- Slider
- Tabs
- Tooltip

## Icon Generation

### Features
- **Style Variants**: Minimal, detailed, outlined, filled
- **Color Customization**: Single colors, gradients, patterns
- **Size Options**: 16px to 512px
- **Format Support**: SVG, PNG, ICO

### Customization Options
```typescript
interface IconCustomization {
  color: string;
  gradient?: {
    from: string;
    to: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
  size: number;
  strokeWidth?: number;
  style: 'minimal' | 'detailed' | 'outlined' | 'filled';
}
```

### Usage Example
```typescript
const { generateIcon, customizeIcon } = useIconGeneration();

// Generate icon
const icon = await generateIcon({
  prompt: "Modern calendar icon",
  style: "outlined",
  color: "#3B82F6"
});

// Customize icon
const customized = await customizeIcon(icon.id, {
  gradient: {
    from: "#3B82F6",
    to: "#8B5CF6",
    direction: "diagonal"
  },
  size: 64
});
```

## UI Generation

### Component Types
- **Buttons**: Various styles and states
- **Cards**: Information cards, product cards, profile cards
- **Forms**: Input fields, checkboxes, selectors
- **Navigation**: Menus, breadcrumbs, pagination
- **Data Display**: Tables, lists, grids

### Generation Process
1. **Prompt Analysis**: AI analyzes the user's description
2. **Style Application**: Applies design patterns and themes
3. **Code Generation**: Generates clean, semantic HTML/CSS
4. **Preview Rendering**: Shows real-time preview
5. **Export Preparation**: Optimizes for download

## Customization

### Real-time Editing
- **Color Picker**: HSL, RGB, HEX support
- **Gradient Builder**: Linear and radial gradients
- **Size Adjustments**: Responsive sizing
- **Style Variants**: Multiple design options

### Advanced Customization
```typescript
interface CustomizationOptions {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
  borders: {
    radius: number;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
  };
}
```

## Export & Download

### Supported Formats
- **PNG**: High-quality raster images
- **SVG**: Scalable vector graphics
- **JPG**: Compressed images
- **ICO**: Favicon format

### Export Options
```typescript
interface ExportOptions {
  format: 'png' | 'svg' | 'jpg' | 'ico';
  quality: number; // 1-100 for raster formats
  size: {
    width: number;
    height: number;
  };
  backgroundColor?: string;
  transparent?: boolean; // PNG/SVG only
}
```

### Usage
```typescript
const { exportAsImage } = useExport();

await exportAsImage(elementId, {
  format: 'png',
  quality: 90,
  size: { width: 512, height: 512 },
  transparent: true
});
```

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Add JSDoc comments for complex functions

### Testing
```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Required for production:
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_APP_URL`: Application URL

### Hosting Options
- **Vercel**: Recommended for React applications
- **Netlify**: Good alternative with easy deployment
- **GitHub Pages**: For static hosting
- **Custom Server**: For full control

### Performance Optimization
- Lazy loading for components
- Image optimization
- Code splitting
- CDN integration for assets

## Troubleshooting

### Common Issues
1. **API Key Errors**: Ensure Gemini API key is properly configured
2. **Build Failures**: Check Node.js version compatibility
3. **Slow Generation**: Consider upgrading API plan or implementing caching
4. **Export Issues**: Verify browser compatibility for download features

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG=true
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the FAQ section
- Review existing documentation

---

*Last updated: [Current Date]*
*Version: 1.0.0*
