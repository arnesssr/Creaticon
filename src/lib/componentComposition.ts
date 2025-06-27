import { ReactComponent, ComponentGenerationRequest } from '@/types/react-components';
import { generateReactComponentWithAI } from '@/lib/aiServices';

/**
 * Component Composition Service
 * Business logic for combining multiple components with clean separation of concerns
 */

// Composition strategies (Strategy Pattern)
export interface CompositionStrategy {
  name: string;
  description: string;
  generateRequest(components: ReactComponent[], layoutType: string): ComponentGenerationRequest;
}

/**
 * Layout Composition Strategy
 */
export class LayoutCompositionStrategy implements CompositionStrategy {
  name = 'Layout Composition';
  description = 'Combine components into a cohesive layout';

  generateRequest(components: ReactComponent[], layoutType: string): ComponentGenerationRequest {
    const componentDescriptions = components.map(comp => 
      `- ${comp.displayName}: ${comp.description}`
    ).join('\n');

    const compositionDescription = `Create a ${layoutType} layout composition using these components:

${componentDescriptions}

COMPOSITION REQUIREMENTS:
- Layout Type: ${layoutType}
- Combine all components into a single cohesive interface
- Maintain each component's functionality and props
- Create proper component hierarchy and data flow
- Use consistent spacing and alignment
- Ensure responsive design across all screen sizes
- Implement proper accessibility patterns

LAYOUT SPECIFICATIONS:
${this.getLayoutSpecifications(layoutType)}

TECHNICAL REQUIREMENTS:
- Framework: ${this.getCommonFramework(components)}
- Styling: ${this.getCommonStyling(components)}
- Make the composition reusable and configurable
- Include proper TypeScript interfaces
- Add meaningful prop drilling and state management
- Ensure all original component interfaces are preserved

Create a professional, production-ready composed component.`;

    return {
      description: compositionDescription,
      framework: this.getCommonFramework(components),
      styling: this.getCommonStyling(components),
      category: 'layout',
      responsive: true,
      accessibility: true,
      complexity: 'complex'
    };
  }

  private getLayoutSpecifications(layoutType: string): string {
    switch (layoutType.toLowerCase()) {
      case 'dashboard':
        return `- Header with navigation and user info
- Sidebar with menu items
- Main content area with grid layout
- Footer with additional links
- Use CSS Grid or Flexbox for layout structure`;

      case 'form':
        return `- Form container with proper validation
- Field grouping and spacing
- Submit and cancel actions
- Progress indicators if multi-step
- Error handling and user feedback`;

      case 'card-grid':
        return `- Responsive grid of cards
- Consistent card sizing and spacing
- Hover effects and interactions
- Proper content hierarchy
- Mobile-friendly responsive behavior`;

      case 'hero-section':
        return `- Eye-catching hero content
- Call-to-action elements
- Background image or gradient support
- Responsive text sizing
- Mobile-optimized layout`;

      case 'sidebar-content':
        return `- Sidebar navigation or filters
- Main content area
- Collapsible sidebar for mobile
- Proper content flow and hierarchy
- Responsive breakpoint handling`;

      default:
        return `- Logical component arrangement
- Proper spacing and alignment
- Responsive design principles
- Consistent visual hierarchy
- User-friendly interactions`;
    }
  }

  private getCommonFramework(components: ReactComponent[]): any {
    const frameworks = components.map(c => c.framework);
    return frameworks[0] || 'react-typescript';
  }

  private getCommonStyling(components: ReactComponent[]): any {
    const stylings = components.map(c => c.styling);
    return stylings[0] || 'tailwind';
  }
}

/**
 * Page Composition Strategy
 */
export class PageCompositionStrategy implements CompositionStrategy {
  name = 'Page Composition';
  description = 'Combine components into a complete page';

  generateRequest(components: ReactComponent[], pageType: string): ComponentGenerationRequest {
    const componentDescriptions = components.map(comp => 
      `- ${comp.displayName}: ${comp.description}`
    ).join('\n');

    const pageDescription = `Create a complete ${pageType} page using these components:

${componentDescriptions}

PAGE COMPOSITION REQUIREMENTS:
- Page Type: ${pageType}
- Create a full-page layout with proper structure
- Include semantic HTML elements (header, nav, main, aside, footer)
- Implement proper SEO structure
- Add meta information and page title handling
- Create proper navigation flow between sections

PAGE SPECIFICATIONS:
${this.getPageSpecifications(pageType)}

TECHNICAL REQUIREMENTS:
- Framework: ${this.getCommonFramework(components)}
- Styling: ${this.getCommonStyling(components)}
- Include proper page-level state management
- Add loading states and error boundaries
- Implement proper accessibility (ARIA landmarks)
- Ensure excellent mobile experience
- Add proper head management for SEO

Create a complete, production-ready page component.`;

    return {
      description: pageDescription,
      framework: this.getCommonFramework(components),
      styling: this.getCommonStyling(components),
      category: 'layout',
      responsive: true,
      accessibility: true,
      complexity: 'complex'
    };
  }

  private getPageSpecifications(pageType: string): string {
    switch (pageType.toLowerCase()) {
      case 'landing':
        return `- Hero section with compelling CTA
- Features/benefits sections
- Testimonials or social proof
- Pricing or product information
- Contact/signup section
- Footer with links and info`;

      case 'dashboard':
        return `- Header with user info and navigation
- Sidebar with menu items
- Main dashboard content with widgets
- Breadcrumb navigation
- Quick actions and shortcuts`;

      case 'profile':
        return `- User profile header
- Tabbed content sections
- Settings and preferences
- Activity feed or history
- Action buttons and forms`;

      case 'checkout':
        return `- Progress indicator
- Form sections (shipping, payment, review)
- Order summary sidebar
- Security indicators
- Error handling and validation`;

      default:
        return `- Proper page structure
- Navigation elements
- Content sections
- Call-to-action areas
- Footer information`;
    }
  }

  private getCommonFramework(components: ReactComponent[]): any {
    const frameworks = components.map(c => c.framework);
    return frameworks[0] || 'react-typescript';
  }

  private getCommonStyling(components: ReactComponent[]): any {
    const stylings = components.map(c => c.styling);
    return stylings[0] || 'tailwind';
  }
}

/**
 * Theme Composition Strategy
 */
export class ThemeCompositionStrategy implements CompositionStrategy {
  name = 'Theme Composition';
  description = 'Combine components with unified theming';

  generateRequest(components: ReactComponent[], themeType: string): ComponentGenerationRequest {
    const componentDescriptions = components.map(comp => 
      `- ${comp.displayName}: ${comp.description}`
    ).join('\n');

    const themeDescription = `Create a ${themeType} themed composition using these components:

${componentDescriptions}

THEME COMPOSITION REQUIREMENTS:
- Theme: ${themeType}
- Apply consistent theming across all components
- Create a unified design language
- Ensure proper color harmony and contrast
- Implement consistent typography scaling
- Add theme-specific animations and interactions

THEME SPECIFICATIONS:
${this.getThemeSpecifications(themeType)}

TECHNICAL REQUIREMENTS:
- Framework: ${this.getCommonFramework(components)}
- Styling: ${this.getCommonStyling(components)}
- Create theme provider and context
- Implement CSS custom properties for theming
- Add theme switching capabilities
- Ensure accessibility compliance for chosen theme
- Include proper dark/light mode support

Create a beautifully themed, cohesive component composition.`;

    return {
      description: themeDescription,
      framework: this.getCommonFramework(components),
      styling: this.getCommonStyling(components),
      category: 'layout',
      responsive: true,
      accessibility: true,
      complexity: 'complex'
    };
  }

  private getThemeSpecifications(themeType: string): string {
    switch (themeType.toLowerCase()) {
      case 'modern':
        return `- Clean, minimalist design
- Subtle shadows and gradients
- Modern color palette (blues, grays, whites)
- Sans-serif typography
- Smooth animations and transitions`;

      case 'corporate':
        return `- Professional, trustworthy appearance
- Conservative color scheme
- Clear hierarchy and structure
- Traditional typography choices
- Subtle, professional interactions`;

      case 'creative':
        return `- Bold, expressive design
- Vibrant color combinations
- Creative typography mixing
- Unique shapes and layouts
- Engaging animations and effects`;

      case 'dark':
        return `- Dark backgrounds with light text
- High contrast for readability
- Accent colors that pop on dark
- Proper dark mode accessibility
- Comfortable night viewing experience`;

      case 'minimal':
        return `- Maximum whitespace utilization
- Limited color palette (2-3 colors)
- Simple, clean typography
- Subtle borders and dividers
- Focus on content over decoration`;

      default:
        return `- Consistent visual language
- Harmonious color relationships
- Proper typography scaling
- Unified interaction patterns
- Professional appearance`;
    }
  }

  private getCommonFramework(components: ReactComponent[]): any {
    const frameworks = components.map(c => c.framework);
    return frameworks[0] || 'react-typescript';
  }

  private getCommonStyling(components: ReactComponent[]): any {
    const stylings = components.map(c => c.styling);
    return stylings[0] || 'tailwind';
  }
}

/**
 * Component Composition Service
 * Orchestrates component composition using different strategies
 */
export class ComponentCompositionService {
  private strategies: Map<string, CompositionStrategy> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    this.registerStrategy(new LayoutCompositionStrategy());
    this.registerStrategy(new PageCompositionStrategy());
    this.registerStrategy(new ThemeCompositionStrategy());
  }

  registerStrategy(strategy: CompositionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getAvailableStrategies(): CompositionStrategy[] {
    return Array.from(this.strategies.values());
  }

  async composeComponents(
    components: ReactComponent[],
    strategyName: string,
    compositionType: string
  ): Promise<{ success: boolean; composition?: ReactComponent; error?: string }> {
    try {
      if (components.length === 0) {
        throw new Error('At least one component is required for composition');
      }

      const strategy = this.strategies.get(strategyName);
      if (!strategy) {
        throw new Error(`Composition strategy "${strategyName}" not found`);
      }

      // Generate the composition request using the strategy
      const compositionRequest = strategy.generateRequest(components, compositionType);
      
      // Use AI to generate the composition
      const result = await generateReactComponentWithAI(compositionRequest);
      
      if (result.success && result.component) {
        // Enhance the generated composition with metadata
        const composition: ReactComponent = {
          ...result.component,
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${compositionType.replace(/\s+/g, '')}Composition`,
          displayName: `${compositionType} Composition`,
          description: `${strategyName} composition of ${components.length} components: ${compositionType}`,
          category: 'layout',
          // Merge dependencies from all source components
          dependencies: [...new Set([
            ...result.component.dependencies,
            ...components.flatMap(c => c.dependencies)
          ])]
        };

        return { success: true, composition };
      } else {
        return { 
          success: false, 
          error: result.error || `Failed to generate ${strategyName} composition` 
        };
      }
    } catch (error) {
      console.error(`Error creating ${strategyName} composition:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Preset composition types
  async createQuickComposition(
    components: ReactComponent[],
    quickType: 'dashboard' | 'landing-page' | 'form-layout' | 'card-gallery' | 'admin-panel'
  ): Promise<{ success: boolean; composition?: ReactComponent; error?: string }> {
    const quickTypeMap: Record<string, { strategy: string; type: string }> = {
      'dashboard': { strategy: 'Layout Composition', type: 'dashboard' },
      'landing-page': { strategy: 'Page Composition', type: 'landing' },
      'form-layout': { strategy: 'Layout Composition', type: 'form' },
      'card-gallery': { strategy: 'Layout Composition', type: 'card-grid' },
      'admin-panel': { strategy: 'Page Composition', type: 'dashboard' }
    };

    const config = quickTypeMap[quickType];
    if (!config) {
      return { success: false, error: `Quick composition type "${quickType}" not supported` };
    }

    return this.composeComponents(components, config.strategy, config.type);
  }

  // Analyze components for composition compatibility
  analyzeCompositionCompatibility(components: ReactComponent[]): {
    compatible: boolean;
    issues: string[];
    suggestions: string[];
    score: number;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    if (components.length === 0) {
      return { compatible: false, issues: ['No components provided'], suggestions: [], score: 0 };
    }

    // Check framework compatibility
    const frameworks = [...new Set(components.map(c => c.framework))];
    if (frameworks.length > 1) {
      issues.push(`Mixed frameworks detected: ${frameworks.join(', ')}`);
      suggestions.push('Consider using components with the same framework for better compatibility');
      score -= 20;
    }

    // Check styling compatibility
    const stylings = [...new Set(components.map(c => c.styling))];
    if (stylings.length > 1) {
      issues.push(`Mixed styling methods: ${stylings.join(', ')}`);
      suggestions.push('Components with the same styling method compose better');
      score -= 15;
    }

    // Check accessibility consistency
    const accessibilityLevels = components.map(c => c.accessibility.ariaLabels);
    const hasInconsistentA11y = accessibilityLevels.some(a => a !== accessibilityLevels[0]);
    if (hasInconsistentA11y) {
      suggestions.push('Consider ensuring all components have similar accessibility levels');
      score -= 10;
    }

    // Check for responsive consistency
    const responsiveStates = components.map(c => c.responsive);
    const hasInconsistentResponsive = responsiveStates.some(r => r !== responsiveStates[0]);
    if (hasInconsistentResponsive) {
      suggestions.push('Mix of responsive and non-responsive components may cause layout issues');
      score -= 10;
    }

    // Positive indicators
    if (components.length >= 2 && components.length <= 6) {
      suggestions.push('Good number of components for composition');
    } else if (components.length > 6) {
      suggestions.push('Many components - consider grouping into sub-compositions first');
      score -= 5;
    }

    const compatible = issues.length === 0 && score >= 70;

    return { compatible, issues, suggestions, score: Math.max(0, score) };
  }
}

// Export singleton instance
export const componentCompositionService = new ComponentCompositionService();

// Export strategies for custom use
export {
  LayoutCompositionStrategy,
  PageCompositionStrategy,
  ThemeCompositionStrategy
};
