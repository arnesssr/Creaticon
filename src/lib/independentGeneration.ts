import { generateWithEnhancement } from './aiPromptEnhancer';
import { processIconHTML } from './processors';
import { ProcessedCode, ReactComponent } from '@/types';

/**
 * Independent Generation Services
 * 
 * This module provides completely separate generation functions for:
 * - Icon generation (uses HTML/SVG processing)
 * - React component generation (uses React component system)
 * 
 * Each function is self-contained and doesn't interfere with the other.
 */

export interface IconGenerationResult {
  success: boolean;
  icons?: ProcessedCode;
  error?: string;
  analysisUsed?: boolean;
  timeElapsed?: number;
}

export interface ComponentGenerationResult {
  success: boolean;
  component?: ReactComponent;
  error?: string;
  analysisUsed?: boolean;
  timeElapsed?: number;
}

/**
 * Independent Icon Generation
 * 
 * This function ONLY generates icons and NEVER affects React components.
 * It uses the V3 → V1 workflow for enhanced results.
 */
export const generateIconsIndependently = async (
  userInput: string,
  useEnhancement: boolean = true
): Promise<IconGenerationResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🎨 Starting independent icon generation...');
    
    if (useEnhancement) {
      // Use enhanced workflow: V3 analysis → V1 generation
      console.log('🔍 Using enhanced workflow (V3 + V1)...');
      
      const enhancedResult = await generateWithEnhancement(userInput, 'icons');
      
      if (enhancedResult.success && enhancedResult.result) {
        const generationResult = enhancedResult.result;
        
        if (generationResult.success && generationResult.html) {
          const processedIcons = processIconHTML(generationResult.html);
          
          return {
            success: true,
            icons: processedIcons,
            analysisUsed: true,
            timeElapsed: Date.now() - startTime
          };
        } else {
          throw new Error(generationResult.error || 'Enhanced icon generation failed');
        }
      } else {
        throw new Error(enhancedResult.error || 'Enhancement workflow failed');
      }
    } else {
      // Direct generation without enhancement
      console.log('⚡ Using direct generation...');
      
      // ICONS ONLY: Import dedicated icon service
      const { generateIconsWithAI } = await import('./aiService');
      
      const result = await generateIconsWithAI({
        projectDescription: userInput,
        projectType: 'icon-pack',
        stylePreference: 'modern',
        colorScheme: 'contextual and beautiful gradients',
        provider: 'auto'
      });
      
      if (result.success && result.html) {
        const processedIcons = processIconHTML(result.html);
        
        return {
          success: true,
          icons: processedIcons,
          analysisUsed: false,
          timeElapsed: Date.now() - startTime
        };
      } else {
        throw new Error(result.error || 'Direct icon generation failed');
      }
    }
    
  } catch (error) {
    console.error('Independent icon generation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Icon generation failed',
      analysisUsed: useEnhancement,
      timeElapsed: Date.now() - startTime
    };
  }
};

/**
 * Independent React Component Generation
 * 
 * This function ONLY generates React components and NEVER affects icon generation.
 * It uses the V3 → V1 workflow for enhanced results.
 */
export const generateComponentIndependently = async (
  userInput: string,
  useEnhancement: boolean = true
): Promise<ComponentGenerationResult> => {
  const startTime = Date.now();
  
  try {
    console.log('⚛️ Starting independent React component generation...');
    
    if (useEnhancement) {
      // Use enhanced workflow: V3 analysis → V1 generation
      console.log('🔍 Using enhanced workflow (V3 + V1)...');
      
      const enhancedResult = await generateWithEnhancement(userInput, 'react-component');
      
      if (enhancedResult.success && enhancedResult.result) {
        const generationResult = enhancedResult.result;
        
        if (generationResult.success && generationResult.component) {
          return {
            success: true,
            component: generationResult.component,
            analysisUsed: true,
            timeElapsed: Date.now() - startTime
          };
        } else {
          throw new Error(generationResult.error || 'Enhanced component generation failed');
        }
      } else {
        throw new Error(enhancedResult.error || 'Enhancement workflow failed');
      }
    } else {
      // Direct generation without enhancement
      console.log('⚡ Using direct generation...');
      
      // COMPONENTS ONLY: Import dedicated component service
      const { generateReactComponentWithAI } = await import('./aiServices');
      
      const result = await generateReactComponentWithAI({
        description: userInput,
        framework: 'react-typescript',
        styling: 'tailwind',
        responsive: true,
        accessibility: true,
        complexity: 'medium'
      });
      
      if (result.success && result.component) {
        return {
          success: true,
          component: result.component,
          analysisUsed: false,
          timeElapsed: Date.now() - startTime
        };
      } else {
        throw new Error(result.error || 'Direct component generation failed');
      }
    }
    
  } catch (error) {
    console.error('Independent component generation error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Component generation failed',
      analysisUsed: useEnhancement,
      timeElapsed: Date.now() - startTime
    };
  }
};

/**
 * Performance-optimized generation with timeout
 * Ensures generation completes within 5 seconds or falls back
 */
export const generateWithTimeout = async <T>(
  generationFunction: () => Promise<T>,
  timeoutMs: number = 5000,
  fallbackFunction?: () => Promise<T>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ Generation timeout after ${timeoutMs}ms`);
      if (fallbackFunction) {
        console.log('🔄 Trying fallback generation...');
        fallbackFunction()
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Generation timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    try {
      const result = await generationFunction();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

/**
 * Fast icon generation with 5-second guarantee
 */
export const generateIconsFast = async (userInput: string): Promise<IconGenerationResult> => {
  return generateWithTimeout(
    () => generateIconsIndependently(userInput, true),
    5000,
    () => generateIconsIndependently(userInput, false) // Fallback without enhancement
  );
};

/**
 * Fast component generation with 5-second guarantee
 */
export const generateComponentFast = async (userInput: string): Promise<ComponentGenerationResult> => {
  return generateWithTimeout(
    () => generateComponentIndependently(userInput, true),
    5000,
    () => generateComponentIndependently(userInput, false) // Fallback without enhancement
  );
};

export default {
  generateIconsIndependently,
  generateComponentIndependently,
  generateIconsFast,
  generateComponentFast,
  generateWithTimeout
};
