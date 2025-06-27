/**
 * Feature Integration Manager
 * Clean orchestration layer for all Phase 3 features with proper separation of concerns
 */

import { ReactComponent } from '@/types/react-components';
import { componentLibraryService } from './componentLibrary';
import { componentVariantsService } from './componentVariants';
import { componentCompositionService } from './componentComposition';

/**
 * Feature orchestration service
 * Coordinates between library management, variants, and composition
 */
export class FeatureIntegrationService {
  
  /**
   * Enhanced component workflow
   * Generate → Save → Create Variants → Compose
   */
  async processNewComponent(component: ReactComponent): Promise<{
    success: boolean;
    component: ReactComponent;
    variants?: ReactComponent[];
    suggestions: string[];
    error?: string;
  }> {
    try {
      // Step 1: Save the base component
      await componentLibraryService.saveComponent(component);
      
      // Step 2: Analyze component for variant suggestions
      const variantSuggestions = this.analyzeVariantOpportunities(component);
      
      // Step 3: Check composition opportunities
      const compositionSuggestions = await this.analyzeCompositionOpportunities(component);
      
      const allSuggestions = [...variantSuggestions, ...compositionSuggestions];
      
      return {
        success: true,
        component,
        suggestions: allSuggestions
      };
      
    } catch (error) {
      console.error('Error processing new component:', error);
      return {
        success: false,
        component,
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Auto-generate essential variants for a component
   */
  async generateEssentialVariants(component: ReactComponent): Promise<{
    success: boolean;
    variants: ReactComponent[];
    errors: Array<{ strategy: string; error: string }>;
  }> {
    return componentVariantsService.generateVariantPack(component, 'essential');
  }

  /**
   * Smart composition suggestions
   * Analyzes existing components to suggest compositions
   */
  async getSmartCompositionSuggestions(component: ReactComponent): Promise<{
    compatibleComponents: ReactComponent[];
    suggestedCompositions: Array<{
      type: string;
      components: ReactComponent[];
      compatibility: number;
      description: string;
    }>;
  }> {
    try {
      const allComponents = await componentLibraryService.getAllComponents();
      
      // Find compatible components
      const compatibleComponents = allComponents.filter(c => 
        c.id !== component.id && 
        c.framework === component.framework &&
        c.styling === component.styling
      );

      // Generate composition suggestions
      const suggestedCompositions = this.generateCompositionSuggestions(
        component, 
        compatibleComponents
      );

      return {
        compatibleComponents: compatibleComponents.slice(0, 10), // Limit for performance
        suggestedCompositions
      };
      
    } catch (error) {
      console.error('Error getting composition suggestions:', error);
      return {
        compatibleComponents: [],
        suggestedCompositions: []
      };
    }
  }

  /**
   * Bulk operations for library management
   */
  async bulkGenerateVariants(
    components: ReactComponent[],
    variantTypes: string[]
  ): Promise<{
    success: boolean;
    results: Array<{
      componentId: string;
      variants: ReactComponent[];
      errors: string[];
    }>;
  }> {
    const results: Array<{
      componentId: string;
      variants: ReactComponent[];
      errors: string[];
    }> = [];

    for (const component of components) {
      try {
        const variantResults = await componentVariantsService.generateMultipleVariants(
          component,
          variantTypes
        );

        // Save successful variants to library
        for (const variant of variantResults.variants) {
          await componentLibraryService.saveComponent(variant);
        }

        results.push({
          componentId: component.id,
          variants: variantResults.variants,
          errors: variantResults.errors.map(e => e.error)
        });

      } catch (error) {
        results.push({
          componentId: component.id,
          variants: [],
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    return {
      success: results.some(r => r.variants.length > 0),
      results
    };
  }

  /**
   * Component analytics and insights
   */
  async getComponentInsights(): Promise<{
    totalComponents: number;
    popularCategories: Array<{ category: string; count: number }>;
    popularFrameworks: Array<{ framework: string; count: number }>;
    recentActivity: Array<{ type: string; component: ReactComponent; timestamp: string }>;
    compositionOpportunities: number;
    variantOpportunities: number;
  }> {
    try {
      const stats = await componentLibraryService.getLibraryStats();
      const allComponents = await componentLibraryService.getAllComponents();

      // Analyze composition opportunities
      const compositionOpportunities = this.calculateCompositionOpportunities(allComponents);
      
      // Analyze variant opportunities
      const variantOpportunities = this.calculateVariantOpportunities(allComponents);

      // Format popular categories
      const popularCategories = Object.entries(stats.componentsByCategory)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Format popular frameworks
      const popularFrameworks = Object.entries(stats.componentsByFramework)
        .map(([framework, count]) => ({ framework, count: count as number }))
        .sort((a, b) => b.count - a.count);

      return {
        totalComponents: stats.totalComponents,
        popularCategories,
        popularFrameworks,
        recentActivity: stats.recentActivity,
        compositionOpportunities,
        variantOpportunities
      };

    } catch (error) {
      console.error('Error getting component insights:', error);
      return {
        totalComponents: 0,
        popularCategories: [],
        popularFrameworks: [],
        recentActivity: [],
        compositionOpportunities: 0,
        variantOpportunities: 0
      };
    }
  }

  /**
   * Private helper methods
   */
  private analyzeVariantOpportunities(component: ReactComponent): string[] {
    const suggestions: string[] = [];

    // Suggest based on component characteristics
    if (component.responsive) {
      suggestions.push('💡 This responsive component would work great with Mobile-First variants');
    }

    if (component.accessibility.ariaLabels) {
      suggestions.push('♿ Consider creating a High Contrast variant for enhanced accessibility');
    }

    if (component.category === 'form' || component.category === 'input') {
      suggestions.push('🎨 Form components often benefit from Dark Theme variants');
    }

    if (component.styling === 'tailwind') {
      suggestions.push('✨ Tailwind components can easily be adapted for Minimal variants');
    }

    return suggestions;
  }

  private async analyzeCompositionOpportunities(component: ReactComponent): Promise<string[]> {
    try {
      const allComponents = await componentLibraryService.getAllComponents();
      const suggestions: string[] = [];

      // Find compatible components for composition
      const compatible = allComponents.filter(c => 
        c.id !== component.id &&
        c.framework === component.framework &&
        c.styling === component.styling
      );

      if (compatible.length > 0) {
        suggestions.push(`🔧 Found ${compatible.length} compatible components for composition`);
      }

      // Category-specific suggestions
      if (component.category === 'button') {
        const forms = compatible.filter(c => c.category === 'form');
        if (forms.length > 0) {
          suggestions.push('📝 Combine this button with form components for complete form layouts');
        }
      }

      if (component.category === 'card') {
        suggestions.push('📊 Card components work great in dashboard and gallery compositions');
      }

      return suggestions;

    } catch (error) {
      console.error('Error analyzing composition opportunities:', error);
      return [];
    }
  }

  private generateCompositionSuggestions(
    baseComponent: ReactComponent,
    compatibleComponents: ReactComponent[]
  ): Array<{
    type: string;
    components: ReactComponent[];
    compatibility: number;
    description: string;
  }> {
    const suggestions: Array<{
      type: string;
      components: ReactComponent[];
      compatibility: number;
      description: string;
    }> = [];

    // Dashboard suggestions
    const dashboardComponents = compatibleComponents.filter(c => 
      ['card', 'button', 'chart', 'table'].includes(c.category)
    );
    
    if (dashboardComponents.length >= 2) {
      const components = [baseComponent, ...dashboardComponents.slice(0, 3)];
      const compatibility = componentCompositionService.analyzeCompositionCompatibility(components);
      
      suggestions.push({
        type: 'Dashboard Layout',
        components,
        compatibility: compatibility.score,
        description: `Create a dashboard using ${components.length} compatible components`
      });
    }

    // Form suggestions
    const formComponents = compatibleComponents.filter(c => 
      ['input', 'button', 'form'].includes(c.category)
    );
    
    if (formComponents.length >= 1) {
      const components = [baseComponent, ...formComponents.slice(0, 2)];
      const compatibility = componentCompositionService.analyzeCompositionCompatibility(components);
      
      suggestions.push({
        type: 'Form Layout',
        components,
        compatibility: compatibility.score,
        description: `Create a form using ${components.length} form-related components`
      });
    }

    // Landing page suggestions
    if (compatibleComponents.length >= 3) {
      const components = [baseComponent, ...compatibleComponents.slice(0, 4)];
      const compatibility = componentCompositionService.analyzeCompositionCompatibility(components);
      
      suggestions.push({
        type: 'Landing Page',
        components,
        compatibility: compatibility.score,
        description: `Create a landing page using ${components.length} diverse components`
      });
    }

    return suggestions.sort((a, b) => b.compatibility - a.compatibility);
  }

  private calculateCompositionOpportunities(components: ReactComponent[]): number {
    // Group by framework and styling for compatibility
    const groups = new Map<string, ReactComponent[]>();
    
    components.forEach(component => {
      const key = `${component.framework}-${component.styling}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(component);
    });

    // Count groups with 2+ components
    let opportunities = 0;
    groups.forEach(group => {
      if (group.length >= 2) {
        // Calculate combinations: n * (n-1) / 2
        opportunities += (group.length * (group.length - 1)) / 2;
      }
    });

    return Math.floor(opportunities);
  }

  private calculateVariantOpportunities(components: ReactComponent[]): number {
    // Each component can have up to 5 variants (based on available strategies)
    const strategiesCount = componentVariantsService.getAvailableStrategies().length;
    return components.length * strategiesCount;
  }
}

// Export singleton instance
export const featureIntegrationService = new FeatureIntegrationService();

// Export utility functions for external use
export function getFeatureRecommendations(component: ReactComponent): {
  variants: string[];
  compositions: string[];
  priority: 'high' | 'medium' | 'low';
} {
  const variants: string[] = [];
  const compositions: string[] = [];
  let priority: 'high' | 'medium' | 'low' = 'medium';

  // High priority recommendations
  if (component.responsive && component.accessibility.ariaLabels) {
    variants.push('Dark Theme', 'High Contrast');
    priority = 'high';
  }

  // Medium priority recommendations
  if (component.category === 'button' || component.category === 'card') {
    compositions.push('Dashboard', 'Landing Page');
  }

  // Category-specific recommendations
  switch (component.category) {
    case 'form':
      variants.push('Dark Theme', 'Mobile-First');
      compositions.push('Form Layout');
      break;
    case 'navigation':
      variants.push('Minimal', 'Dark Theme');
      compositions.push('Dashboard', 'Landing Page');
      break;
    case 'card':
      variants.push('Minimal', 'Animated');
      compositions.push('Card Gallery', 'Dashboard');
      break;
  }

  return { variants, compositions, priority };
}
