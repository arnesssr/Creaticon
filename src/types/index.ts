// User Input Interface
export interface UserInput {
  projectDescription: string;
  projectType: 'web-app' | 'dashboard' | 'mobile-app' | 'landing-page';
  stylePreference: 'modern' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: string;
  targetAudience?: string;
}

// Processed Code Interface
export interface ProcessedCode {
  html: string;
  css: string;
  javascript: string;
  svgIcons: ExtractedIcon[];
  icons: ExtractedIcon[]; // For backward compatibility
  preview: string;
}

// Extracted Icon Interface
export interface ExtractedIcon {
  id: string;
  name: string;
  svg: string;
  usage: string;
  size: number;
}

// Generation Response Interface
export interface GenerationResponse {
  success: boolean;
  data?: {
    html: string;
    icons: ExtractedIcon[];
    preview: string;
  };
  error?: string;
}


// Preview State Interface
export interface PreviewState {
  previewHtml: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  setPreviewHtml: (html: string) => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}
