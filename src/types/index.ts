// Import React component types
export * from './react-components';

// User Input Interface
export interface UserInput {
  projectDescription: string;
  projectType: 'web-app' | 'dashboard' | 'mobile-app' | 'landing-page' | 'icon-pack' | 'react-component';
  stylePreference: 'modern' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: string;
  targetAudience?: string;
}

// React Component Generation Result
export interface GenerationResult {
  type: 'react-component' | 'icon-pack';
  reactComponent?: ReactComponent; // For React components
  icons?: ExtractedIcon[];     // For icon generation
}

// Extracted Icon Interface
export interface ExtractedIcon {
  id: string;
  name: string;
  svg: string;
  usage: string;
  size: number;
}

// Generation Response Interface (Enhanced)
export interface GenerationResponse {
  success: boolean;
  html?: string;  // Legacy support
  data?: {
    html: string;
    icons: ExtractedIcon[];
    preview: string;
  };
  result?: GenerationResult; // New enhanced result
  error?: string;
}

// Preview State Interface (Legacy - kept for backward compatibility)
export interface PreviewState {
  previewHtml: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  setPreviewHtml: (html: string) => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

// Generation Mode Type
export type GenerationMode = 'icons' | 'ui' | 'react-component';

// Enhanced UserInput for React Components
export interface ReactComponentInput extends UserInput {
  framework: ComponentFramework;
  styling: StylingMethod;
  complexity: 'simple' | 'medium' | 'complex';
  responsive: boolean;
  accessibility: boolean;
  category?: ComponentCategory;
}
