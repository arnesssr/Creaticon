import { ReactComponent, ComponentVariant, ComponentGenerationRequest } from '@/types/react-components';
import { generateReactComponentWithAI } from '@/lib/aiServices';

/**
 * Component Variants Generator
 * Business logic for generating component variations with clean separation of concerns
 */

// Variant generation strategies (Strategy Pattern)
export interface VariantGenerationStrategy {
  name: string;
  description: string;
  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest;
}

/**
 * Dark Theme Variant Strategy
 */
export class DarkThemeVariantStrategy implements VariantGenerationStrategy {
  name = 'Dark Theme';
  description = 'Generate a dark theme version of the component';

  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest {
    const darkThemeDescription = `Create a dark theme variant of this ${baseComponent.category} component: "${baseComponent.description}"

DARK THEME REQUIREMENTS:
- Use dark color schemes (dark backgrounds, light text)
- Ensure proper contrast ratios for accessibility
- Use dark theme color variants
- Maintain the same functionality and structure
- Add dark mode specific hover and focus states

ORIGINAL COMPONENT CONTEXT:
- Framework: ${baseComponent.framework}
- Styling: ${baseComponent.styling}
- Category: ${baseComponent.category}
- Props: ${baseComponent.props.map(p => p.name).join(', ')}

Make it visually appealing with proper dark theme aesthetics while keeping the same component interface.`;

    return {
      description: darkThemeDescription,
      framework: baseComponent.framework,
      styling: baseComponent.styling,
      category: baseComponent.category,
      responsive: baseComponent.responsive,
      accessibility: baseComponent.accessibility.ariaLabels,
      complexity: 'medium'
    };
  }
}

/**
 * Mobile-First Variant Strategy
 */
export class MobileFirstVariantStrategy implements VariantGenerationStrategy {
  name = 'Mobile-First';
  description = 'Generate a mobile-optimized version';

  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest {
    const mobileDescription = `Create a mobile-first optimized variant of this ${baseComponent.category} component: "${baseComponent.description}"

MOBILE-FIRST REQUIREMENTS:
- Optimize for touch interactions (larger tap targets)
- Use mobile-friendly spacing and sizing
- Implement progressive enhancement for larger screens
- Ensure excellent mobile UX with swipe gestures if applicable
- Use mobile-first responsive design principles
- Optimize for smaller screen real estate

ORIGINAL COMPONENT CONTEXT:
- Framework: ${baseComponent.framework}
- Styling: ${baseComponent.styling}
- Category: ${baseComponent.category}
- Props: ${baseComponent.props.map(p => p.name).join(', ')}

Focus on mobile usability while maintaining desktop compatibility.`;

    return {
      description: mobileDescription,
      framework: baseComponent.framework,
      styling: baseComponent.styling,
      category: baseComponent.category,
      responsive: true, // Force responsive for mobile-first
      accessibility: baseComponent.accessibility.ariaLabels,
      complexity: 'medium'
    };
  }
}

/**
 * Minimal Variant Strategy
 */
export class MinimalVariantStrategy implements VariantGenerationStrategy {
  name = 'Minimal';
  description = 'Generate a clean, minimal version';

  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest {
    const minimalDescription = `Create a minimal, clean variant of this ${baseComponent.category} component: "${baseComponent.description}"

MINIMAL DESIGN REQUIREMENTS:
- Use clean, simple design with lots of whitespace
- Minimal color palette (2-3 colors max)
- Simple typography without decorative elements
- Remove unnecessary visual elements
- Focus on content and functionality
- Use subtle shadows and borders
- Clean, geometric shapes and layouts

ORIGINAL COMPONENT CONTEXT:
- Framework: ${baseComponent.framework}
- Styling: ${baseComponent.styling}
- Category: ${baseComponent.category}
- Props: ${baseComponent.props.map(p => p.name).join(', ')}

Create a clean, professional look that focuses on usability over decoration.`;

    return {
      description: minimalDescription,
      framework: baseComponent.framework,
      styling: baseComponent.styling,
      category: baseComponent.category,
      responsive: baseComponent.responsive,
      accessibility: baseComponent.accessibility.ariaLabels,
      complexity: 'simple' // Minimal should be simple
    };
  }
}

/**
 * Animated Variant Strategy
 */
export class AnimatedVariantStrategy implements VariantGenerationStrategy {
  name = 'Animated';
  description = 'Generate a version with smooth animations';

  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest {
    const animatedDescription = `Create an animated variant of this ${baseComponent.category} component: "${baseComponent.description}"

ANIMATION REQUIREMENTS:
- Add smooth micro-interactions and animations
- Use CSS transitions for hover and focus states
- Implement loading animations if applicable
- Add enter/exit animations for dynamic content
- Use transform animations for better performance
- Keep animations subtle and purposeful
- Ensure animations don't interfere with accessibility

ANIMATION TYPES TO CONSIDER:
- Hover effects and state transitions
- Loading and skeleton animations
- Slide-in/fade-in animations for content
- Button press and click feedback
- Form validation animations

ORIGINAL COMPONENT CONTEXT:
- Framework: ${baseComponent.framework}
- Styling: ${baseComponent.styling}
- Category: ${baseComponent.category}
- Props: ${baseComponent.props.map(p => p.name).join(', ')}

Make it feel alive and responsive while maintaining good performance.`;

    return {
      description: animatedDescription,
      framework: baseComponent.framework,
      styling: baseComponent.styling,
      category: baseComponent.category,
      responsive: baseComponent.responsive,
      accessibility: baseComponent.accessibility.ariaLabels,
      complexity: 'complex' // Animations add complexity
    };
  }
}

/**
 * High Contrast Variant Strategy
 */
export class HighContrastVariantStrategy implements VariantGenerationStrategy {
  name = 'High Contrast';
  description = 'Generate an accessibility-focused high contrast version';

  generateRequest(baseComponent: ReactComponent): ComponentGenerationRequest {
    const highContrastDescription = `Create a high contrast accessibility variant of this ${baseComponent.category} component: "${baseComponent.description}"

HIGH CONTRAST ACCESSIBILITY REQUIREMENTS:
- Use maximum contrast ratios (WCAG AAA compliance)
- Bold, clear borders and outlines
- High contrast color combinations (black/white, dark blue/white)
- Larger font sizes for better readability
- Enhanced focus indicators
- Clear visual hierarchy
- Avoid subtle color distinctions
- Use patterns or textures in addition to color for information

ACCESSIBILITY FEATURES:
- Screen reader optimization
- Keyboard navigation enhancements
- Clear focus management
- High contrast color schemes
- Bold visual indicators

ORIGINAL COMPONENT CONTEXT:
- Framework: ${baseComponent.framework}
- Styling: ${baseComponent.styling}
- Category: ${baseComponent.category}
- Props: ${baseComponent.props.map(p => p.name).join(', ')}

Prioritize maximum accessibility and visual clarity.`;

    return {
      description: highContrastDescription,
      framework: baseComponent.framework,
      styling: baseComponent.styling,
      category: baseComponent.category,
      responsive: baseComponent.responsive,
      accessibility: true, // Force full accessibility
      complexity: 'medium'
    };
  }
}

/**
 * Component Variants Service
 * Orchestrates variant generation using different strategies
 */
export class ComponentVariantsService {
  private strategies: Map<string, VariantGenerationStrategy> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    this.registerStrategy(new DarkThemeVariantStrategy());
    this.registerStrategy(new MobileFirstVariantStrategy());
    this.registerStrategy(new MinimalVariantStrategy());
    this.registerStrategy(new AnimatedVariantStrategy());
    this.registerStrategy(new HighContrastVariantStrategy());
  }

  registerStrategy(strategy: VariantGenerationStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  getAvailableStrategies(): VariantGenerationStrategy[] {
    return Array.from(this.strategies.values());
  }

  async generateVariant(
    baseComponent: ReactComponent,
    strategyName: string
  ): Promise<{ success: boolean; variant?: ReactComponent; error?: string }> {
    try {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) {
        throw new Error(`Variant strategy "${strategyName}" not found`);
      }

      // Generate the variant request using the strategy
      const variantRequest = strategy.generateRequest(baseComponent);
      
      // Use AI to generate the variant
      const result = await generateReactComponentWithAI(variantRequest);
      
      if (result.success && result.component) {
        // Enhance the generated component with variant metadata
        const variant: ReactComponent = {
          ...result.component,
          id: `${baseComponent.id}_${strategyName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          name: `${baseComponent.name}${strategyName.replace(/\s+/g, '')}`,
          displayName: `${baseComponent.displayName} - ${strategyName}`,
          description: `${strategyName} variant of ${baseComponent.description}`,
          variants: undefined // Variants don't have sub-variants
        };

        return { success: true, variant };
      } else {
        return { 
          success: false, 
          error: result.error || `Failed to generate ${strategyName} variant` 
        };
      }
    } catch (error) {
      console.error(`Error generating ${strategyName} variant:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async generateMultipleVariants(
    baseComponent: ReactComponent,
    strategyNames: string[]
  ): Promise<{
    success: boolean;
    variants: ReactComponent[];
    errors: Array<{ strategy: string; error: string }>;
  }> {
    const variants: ReactComponent[] = [];
    const errors: Array<{ strategy: string; error: string }> = [];

    // Generate variants concurrently for better performance
    const variantPromises = strategyNames.map(async (strategyName) => {
      const result = await this.generateVariant(baseComponent, strategyName);
      
      if (result.success && result.variant) {
        return { success: true, strategy: strategyName, variant: result.variant };
      } else {
        return { 
          success: false, 
          strategy: strategyName, 
          error: result.error || 'Unknown error' 
        };
      }
    });

    const results = await Promise.all(variantPromises);

    results.forEach(result => {
      if (result.success && 'variant' in result) {
        variants.push(result.variant);
      } else if (!result.success && 'error' in result) {
        errors.push({ strategy: result.strategy, error: result.error });
      }
    });

    return {
      success: variants.length > 0,
      variants,
      errors
    };
  }

  // Preset variant combinations
  async generateVariantPack(
    baseComponent: ReactComponent,
    packType: 'essential' | 'accessibility' | 'mobile' | 'design' | 'complete'
  ): Promise<{
    success: boolean;
    variants: ReactComponent[];
    errors: Array<{ strategy: string; error: string }>;
  }> {
    const packStrategies: Record<string, string[]> = {
      essential: ['Dark Theme', 'Mobile-First'],
      accessibility: ['High Contrast', 'Dark Theme'],
      mobile: ['Mobile-First', 'Minimal'],
      design: ['Dark Theme', 'Minimal', 'Animated'],
      complete: ['Dark Theme', 'Mobile-First', 'Minimal', 'Animated', 'High Contrast']
    };

    const strategies = packStrategies[packType] || [];
    return this.generateMultipleVariants(baseComponent, strategies);
  }
}

// Export singleton instance
export const componentVariantsService = new ComponentVariantsService();
