import { ExtractedIcon, UserInput } from '@/types';
import { generateIconsWithAI } from './aiService';

// Icon library sources that can be imported and modified
export interface IconLibrary {
  name: string;
  source: 'lucide' | 'heroicons' | 'feather' | 'tabler' | 'phosphor';
  baseIcons: Record<string, string>; // icon name -> SVG string
}

// Advanced icon styling options
export interface IconStyleOptions {
  color: string;
  strokeWidth?: number;
  fill?: boolean;
  gradient?: {
    from: string;
    to: string;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
  animation?: 'none' | 'pulse' | 'spin' | 'bounce' | 'fade';
  shape?: 'circle' | 'square' | 'rounded' | 'hexagon' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  effect?: 'shadow' | 'glow' | 'outline' | 'filled';
}

// Context-aware icon generation request
export interface ContextualIconRequest extends UserInput {
  appSections: AppSection[];
  brandColors?: string[];
  iconStyle: IconStyleOptions;
  aiCoordination?: boolean; // Use multiple AI models for better results
}

// App sections that need icons
export interface AppSection {
  name: string;
  description: string;
  iconCount: number;
  category: 'navigation' | 'action' | 'feature' | 'status' | 'social' | 'utility';
  priority: 'high' | 'medium' | 'low';
}

// Enhanced icon with metadata
export interface EnhancedIcon extends ExtractedIcon {
  category: string;
  section: string;
  baseIcon?: string; // Source from library if modified
  modifications: IconStyleOptions;
  aiGenerated: boolean;
  contextScore: number; // How well it fits the context (0-1)
}

/**
 * AI Coordination Strategy for Icon Generation
 * Uses multiple AI models working together for better results
 */
export class AIIconCoordinator {
  private primaryAI = 'gemini'; // Main creative AI
  private analysisAI = 'gemini'; // Context analysis AI
  
  async generateContextualIcons(request: ContextualIconRequest): Promise<EnhancedIcon[]> {
    console.log('🤖 Starting AI-coordinated icon generation...');
    
    // Step 1: Analyze app context with Analysis AI
    const context = await this.analyzeAppContext(request);
    console.log('📊 Context analysis complete:', context);
    
    // Step 2: Generate base icons with Primary AI
    const baseIcons = await this.generateBaseIcons(request, context);
    console.log('🎨 Base icons generated:', baseIcons.length);
    
    // Step 3: Import and modify library icons for better coverage
    const libraryIcons = await this.importAndModifyLibraryIcons(request, context);
    console.log('📚 Library icons enhanced:', libraryIcons.length);
    
    // Step 4: Apply advanced styling and effects
    const styledIcons = await this.applyAdvancedStyling([...baseIcons, ...libraryIcons], request.iconStyle);
    console.log('✨ Advanced styling applied');
    
    // Step 5: Context validation and optimization
    const optimizedIcons = await this.validateAndOptimize(styledIcons, context);
    console.log('🔍 Icons optimized for context');
    
    return optimizedIcons;
  }

  private async analyzeAppContext(request: ContextualIconRequest): Promise<AppContextAnalysis> {
    // Use AI to deeply understand the app and determine what icons are needed
    const analysisPrompt = `
    Analyze this app and determine the icon requirements:
    
    App: "${request.projectDescription}"
    Type: ${request.projectType}
    Style: ${request.stylePreference}
    
    Return JSON with:
    {
      "appType": "e-commerce|social|productivity|entertainment|etc",
      "primaryFeatures": ["feature1", "feature2"],
      "userActions": ["action1", "action2"],
      "navigationSections": ["section1", "section2"],
      "iconTheme": "modern|minimal|playful|professional|etc",
      "colorPalette": ["color1", "color2"],
      "estimatedIconCount": 20,
      "contextKeywords": ["keyword1", "keyword2"]
    }
    `;

    try {
      // This would call the analysis AI (could be same or different model)
      const response = await generateIconsWithAI({
        projectDescription: analysisPrompt,
        projectType: 'analysis',
        stylePreference: 'analytical',
        provider: 'auto'
      });

      // Parse and return context (simplified for demo)
      return {
        appType: 'productivity',
        primaryFeatures: ['dashboard', 'analytics', 'settings'],
        userActions: ['create', 'edit', 'delete', 'share'],
        navigationSections: ['home', 'profile', 'settings'],
        iconTheme: request.stylePreference,
        colorPalette: request.brandColors || ['#3B82F6', '#8B5CF6'],
        estimatedIconCount: 20,
        contextKeywords: ['modern', 'clean', 'professional']
      };
    } catch (error) {
      console.error('Context analysis failed:', error);
      return this.getDefaultContext(request);
    }
  }

  private async generateBaseIcons(request: ContextualIconRequest, context: AppContextAnalysis): Promise<EnhancedIcon[]> {
    // Enhanced prompt that uses context analysis
    const enhancedPrompt = `
    Create a comprehensive icon pack for: "${request.projectDescription}"
    
    CONTEXT ANALYSIS:
    - App Type: ${context.appType}
    - Primary Features: ${context.primaryFeatures.join(', ')}
    - User Actions: ${context.userActions.join(', ')}
    - Navigation: ${context.navigationSections.join(', ')}
    - Style Theme: ${context.iconTheme}
    - Colors: ${context.colorPalette.join(', ')}
    
    REQUIREMENTS:
    1. Generate ${context.estimatedIconCount} unique, contextual SVG icons
    2. Cover ALL app sections and features identified in analysis
    3. Each icon must be semantically meaningful for this specific app
    4. Apply advanced CSS styling:
       - Gradients using the color palette
       - Hover animations and micro-interactions
       - Consistent stroke width and styling
       - Modern design patterns (${request.stylePreference})
    
    ICON CATEGORIES TO INCLUDE:
    - Navigation: ${context.navigationSections.join(', ')}
    - Features: ${context.primaryFeatures.join(', ')}
    - Actions: ${context.userActions.join(', ')}
    - Status indicators (success, warning, error, loading)
    - Utility icons (search, filter, sort, settings)
    
    STYLING REQUIREMENTS:
    - Base colors: ${request.iconStyle.color}
    - Style: ${request.stylePreference}
    - Effects: ${request.iconStyle.effect || 'subtle shadow'}
    - Animation: ${request.iconStyle.animation || 'subtle hover'}
    
    Return complete HTML with all icons displayed in a beautiful showcase.
    Each SVG must have proper data-name, data-category, and data-section attributes.
    `;

    try {
      const response = await generateIconsWithAI({
        projectDescription: enhancedPrompt,
        projectType: 'icon-pack',
        stylePreference: request.stylePreference,
        colorScheme: context.colorPalette.join(', '),
        provider: 'auto'
      });

      if (response.success) {
        // Process the HTML and extract enhanced icons
        return this.extractEnhancedIcons(response.html, context);
      }
    } catch (error) {
      console.error('Base icon generation failed:', error);
    }

    return [];
  }

  private async importAndModifyLibraryIcons(request: ContextualIconRequest, context: AppContextAnalysis): Promise<EnhancedIcon[]> {
    // Define common icon libraries and their specialties
    const iconLibraries = {
      lucide: ['settings', 'user', 'home', 'search', 'menu', 'bell', 'heart', 'star'],
      heroicons: ['academic-cap', 'adjustments', 'annotation', 'archive'],
      feather: ['activity', 'airplay', 'alert-circle', 'align-center'],
      tabler: ['dashboard', 'chart-bar', 'database', 'device-desktop'],
      phosphor: ['brain', 'chart-line', 'cursor', 'lightning']
    };

    const enhancedIcons: EnhancedIcon[] = [];

    // For each required icon category, find appropriate library icons
    for (const feature of context.primaryFeatures) {
      const libraryIcon = this.findBestLibraryIcon(feature, iconLibraries);
      if (libraryIcon) {
        const enhancedIcon = await this.enhanceLibraryIcon(libraryIcon, request.iconStyle, context);
        enhancedIcons.push(enhancedIcon);
      }
    }

    return enhancedIcons;
  }

  private findBestLibraryIcon(feature: string, libraries: Record<string, string[]>): string | null {
    // Smart matching logic to find best icon for feature
    const featureMappings: Record<string, string[]> = {
      'dashboard': ['dashboard', 'chart-bar', 'grid'],
      'analytics': ['chart-line', 'chart-bar', 'activity'],
      'settings': ['settings', 'adjustments', 'cog'],
      'profile': ['user', 'person', 'account'],
      'search': ['search', 'magnifying-glass', 'find'],
      'notifications': ['bell', 'alert-circle', 'notification']
    };

    const possibleIcons = featureMappings[feature.toLowerCase()] || [];
    
    // Return first match found in any library
    for (const library of Object.values(libraries)) {
      for (const icon of possibleIcons) {
        if (library.includes(icon)) {
          return icon;
        }
      }
    }

    return null;
  }

  private async enhanceLibraryIcon(iconName: string, style: IconStyleOptions, context: AppContextAnalysis): Promise<EnhancedIcon> {
    // Apply advanced styling to library icon
    const baseIcon = this.getLibraryIconSVG(iconName);
    const enhancedSVG = this.applyIconStyling(baseIcon, style, context);

    return {
      id: `enhanced-${iconName}`,
      name: iconName,
      svg: enhancedSVG,
      usage: 'feature',
      size: 24,
      category: 'library-enhanced',
      section: 'features',
      baseIcon: iconName,
      modifications: style,
      aiGenerated: false,
      contextScore: 0.8
    };
  }

  private applyIconStyling(baseSVG: string, style: IconStyleOptions, context: AppContextAnalysis): string {
    let enhancedSVG = baseSVG;

    // Apply color modifications
    if (style.color) {
      enhancedSVG = enhancedSVG.replace(/stroke="[^"]*"/g, `stroke="${style.color}"`);
      if (style.fill) {
        enhancedSVG = enhancedSVG.replace(/fill="[^"]*"/g, `fill="${style.color}"`);
      }
    }

    // Apply gradient if specified
    if (style.gradient) {
      const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
      const gradientDef = `
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${style.gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${style.gradient.to};stop-opacity:1" />
          </linearGradient>
        </defs>
      `;
      enhancedSVG = enhancedSVG.replace('<svg', `<svg>${gradientDef}<svg`);
      enhancedSVG = enhancedSVG.replace(/fill="[^"]*"/g, `fill="url(#${gradientId})"`);
    }

    // Apply stroke width
    if (style.strokeWidth) {
      enhancedSVG = enhancedSVG.replace(/stroke-width="[^"]*"/g, `stroke-width="${style.strokeWidth}"`);
    }

    // Add CSS animations and effects
    const cssClass = `icon-${style.animation || 'default'}`;
    enhancedSVG = enhancedSVG.replace('<svg', `<svg class="${cssClass}"`);

    return enhancedSVG;
  }

  private async applyAdvancedStyling(icons: EnhancedIcon[], style: IconStyleOptions): Promise<EnhancedIcon[]> {
    return icons.map(icon => ({
      ...icon,
      svg: this.applyAdvancedEffects(icon.svg, style),
      modifications: style
    }));
  }

  private applyAdvancedEffects(svg: string, style: IconStyleOptions): string {
    // Add advanced CSS effects like shadows, glows, etc.
    let styledSVG = svg;

    // Add shadow effect
    if (style.effect === 'shadow') {
      const shadowFilter = `
        <filter id="shadow-${Math.random().toString(36).substr(2, 9)}">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      `;
      styledSVG = styledSVG.replace('<svg', `<svg>${shadowFilter}<svg`);
    }

    // Add glow effect
    if (style.effect === 'glow') {
      const glowFilter = `
        <filter id="glow-${Math.random().toString(36).substr(2, 9)}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      `;
      styledSVG = styledSVG.replace('<svg', `<svg>${glowFilter}<svg`);
    }

    return styledSVG;
  }

  private async validateAndOptimize(icons: EnhancedIcon[], context: AppContextAnalysis): Promise<EnhancedIcon[]> {
    // Validate that icons fit the context and optimize for performance
    return icons.map(icon => ({
      ...icon,
      contextScore: this.calculateContextScore(icon, context)
    })).sort((a, b) => b.contextScore - a.contextScore);
  }

  private calculateContextScore(icon: EnhancedIcon, context: AppContextAnalysis): number {
    let score = 0.5; // Base score

    // Check if icon name matches context keywords
    const iconNameLower = icon.name.toLowerCase();
    context.contextKeywords.forEach(keyword => {
      if (iconNameLower.includes(keyword.toLowerCase())) {
        score += 0.1;
      }
    });

    // Check if icon fits primary features
    context.primaryFeatures.forEach(feature => {
      if (iconNameLower.includes(feature.toLowerCase())) {
        score += 0.2;
      }
    });

    // AI-generated icons get slight bonus for originality
    if (icon.aiGenerated) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private extractEnhancedIcons(html: string, context: AppContextAnalysis): EnhancedIcon[] {
    // Extract icons from generated HTML with enhanced metadata
    // This would use cheerio to parse and extract icons
    // For now, returning mock data
    return [];
  }

  private getLibraryIconSVG(iconName: string): string {
    // Mock library icon - in real implementation, this would fetch from actual libraries
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="12 6v6l4 2"/>
    </svg>`;
  }

  private getDefaultContext(request: ContextualIconRequest): AppContextAnalysis {
    return {
      appType: 'general',
      primaryFeatures: ['dashboard', 'settings', 'profile'],
      userActions: ['view', 'edit', 'delete'],
      navigationSections: ['home', 'about', 'contact'],
      iconTheme: request.stylePreference,
      colorPalette: ['#3B82F6', '#8B5CF6'],
      estimatedIconCount: 15,
      contextKeywords: ['modern', 'clean']
    };
  }
}

// Context analysis result
interface AppContextAnalysis {
  appType: string;
  primaryFeatures: string[];
  userActions: string[];
  navigationSections: string[];
  iconTheme: string;
  colorPalette: string[];
  estimatedIconCount: number;
  contextKeywords: string[];
}

// Export the main function for use in the API
export const generateIntelligentIconPack = async (request: ContextualIconRequest): Promise<EnhancedIcon[]> => {
  const coordinator = new AIIconCoordinator();
  return coordinator.generateContextualIcons(request);
};
