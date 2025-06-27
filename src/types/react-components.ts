// React Component Generation Types

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'node';
  required: boolean;
  defaultValue?: any;
  description?: string;
  options?: string[]; // For enum-like props
}

export type ComponentCategory = 
  | 'form' 
  | 'navigation' 
  | 'data-display' 
  | 'feedback' 
  | 'layout' 
  | 'input' 
  | 'media'
  | 'button'
  | 'card'
  | 'modal'
  | 'table'
  | 'chart';

export type ComponentFramework = 
  | 'react'
  | 'react-typescript'
  | 'next'
  | 'remix'
  | 'vite-react';

export type StylingMethod = 
  | 'tailwind'
  | 'styled-components'
  | 'css-modules'
  | 'emotion'
  | 'vanilla-css'
  | 'chakra-ui'
  | 'material-ui';

export interface ReactComponent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  code: string;           // JSX/TSX code
  props: ComponentProp[]; // Component props definition
  dependencies: string[]; // Required packages/imports
  category: ComponentCategory;
  framework: ComponentFramework;
  styling: StylingMethod;
  preview: {
    livePreview: string;  // Rendered component HTML
    codePreview: string;  // Formatted code for display
    usage: string;        // Usage example
  };
  variants?: ComponentVariant[]; // Different versions of the component
  responsive: boolean;    // Whether component is responsive
  accessibility: {
    ariaLabels: boolean;
    keyboardNavigation: boolean;
    screenReaderFriendly: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  code: string;
  props: ComponentProp[];
  preview: string;
}

export interface ComponentGenerationRequest {
  description: string;
  category?: ComponentCategory;
  framework: ComponentFramework;
  styling: StylingMethod;
  responsive: boolean;
  accessibility: boolean;
  customProps?: ComponentProp[];
  theme?: 'light' | 'dark' | 'auto';
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface ComponentGenerationResponse {
  success: boolean;
  component?: ReactComponent;
  error?: string;
  suggestions?: string[];
}

// Live Preview Types
export interface PreviewState {
  component: ReactComponent | null;
  currentProps: Record<string, any>;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
}

export interface PreviewActions {
  setComponent: (component: ReactComponent | null) => void;
  updateProps: (props: Record<string, any>) => void;
  setDeviceMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Export Options
export interface ExportOptions {
  format: 'jsx' | 'tsx' | 'js' | 'ts';
  includePropTypes: boolean;
  includeStyles: boolean;
  includeStorybook: boolean;
  includeTests: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  bundleType: 'single-file' | 'multi-file' | 'package';
}

export interface ExportResult {
  files: {
    name: string;
    content: string;
    type: 'component' | 'style' | 'story' | 'test' | 'package' | 'readme';
  }[];
  instructions: string;
  dependencies: string[];
}

// Component Library Types
export interface ComponentLibrary {
  id: string;
  name: string;
  description: string;
  components: ReactComponent[];
  theme: {
    colors: Record<string, string>;
    spacing: Record<string, string>;
    typography: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

// AI Generation Types
export interface ReactGenerationPrompt {
  userDescription: string;
  category: ComponentCategory;
  framework: ComponentFramework;
  styling: StylingMethod;
  complexity: 'simple' | 'medium' | 'complex';
  responsive: boolean;
  accessibility: boolean;
  existingComponents?: string[]; // To avoid duplication
  designSystem?: {
    colors: string[];
    spacing: string[];
    typography: string[];
  };
}

export interface GenerationContext {
  projectType: 'web-app' | 'dashboard' | 'mobile-app' | 'landing-page' | 'component-library';
  targetAudience: string;
  brandGuidelines?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    tone: 'professional' | 'casual' | 'playful' | 'serious';
  };
}
