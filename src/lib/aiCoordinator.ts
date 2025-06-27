import { GenerationRequest, GenerationResponse } from './aiServices';
import { deepSeekAnalyst, DeepSeekAnalysis } from './deepseekService';

/**
 * AI Coordination Service
 * 
 * TASK ASSIGNMENTS:
 * - DeepSeek V3 (OpenRouter): All creative design work (icons, UI, layouts)
 * - DeepSeek R1 (Hugging Face): Analysis, optimization, context understanding
 */

export interface CoordinatedGenerationRequest extends GenerationRequest {
  analysisRequired?: boolean;
  optimizationLevel?: 'basic' | 'advanced' | 'maximum';
}

export interface CoordinatedGenerationResponse extends GenerationResponse {
  analysis?: DeepSeekAnalysis;
  optimizations?: string[];
  processingSteps?: string[];
}

/**
 * Main coordinated generation function
 */
export const generateWithAICoordination = async (
  input: CoordinatedGenerationRequest,
  type: 'icons' | 'ui'
): Promise<CoordinatedGenerationResponse> => {
  const processingSteps: string[] = [];
  let analysis: DeepSeekAnalysis | undefined;

  try {
    console.log(`🎯 Starting coordinated AI generation for ${type}...`);
    processingSteps.push(`Started ${type} generation`);

    // Step 1: Context Analysis with DeepSeek R1 (if required)
    if (input.analysisRequired !== false) {
      console.log('🧠 DeepSeek R1: Performing context analysis...');
      processingSteps.push('Analyzing context and requirements');
      
      try {
        analysis = await deepSeekAnalyst.analyzeAppContext({
          projectDescription: input.projectDescription,
          projectType: input.projectType,
          stylePreference: input.stylePreference,
          colorScheme: input.colorScheme,
          targetAudience: 'general users'
        });
        
        if (analysis.success) {
          console.log('✅ Context analysis completed');
          processingSteps.push('Context analysis completed');
        }
      } catch (error) {
        console.warn('⚠️ Context analysis failed, proceeding without it');
        processingSteps.push('Context analysis skipped due to error');
      }
    }

    // Step 2: Generate with DeepSeek V3 (OpenRouter)
    console.log('🎨 DeepSeek V3: Creating design assets...');
    processingSteps.push('Generating design assets');
    
    const designResult = await generateDesignWithV3(input, type, analysis);
    
    if (designResult.success) {
      console.log('✅ Design generation completed');
      processingSteps.push('Design generation completed');
      
      return {
        ...designResult,
        analysis,
        processingSteps,
        optimizations: []
      };
    } else {
      throw new Error(designResult.error || 'Design generation failed');
    }

  } catch (error) {
    console.error('❌ Coordinated generation failed:', error);
    processingSteps.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Coordinated generation failed',
      analysis,
      processingSteps
    };
  }
};

/**
 * DeepSeek V3 Design Generation (OpenRouter)
 */
const generateDesignWithV3 = async (
  input: CoordinatedGenerationRequest,
  type: 'icons' | 'ui',
  analysis?: DeepSeekAnalysis
): Promise<GenerationResponse> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // Create enhanced prompt using analysis insights
  const prompt = createEnhancedPrompt(input, type, analysis);
  
  console.log(`📤 Sending ${type} request to DeepSeek V3...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'HTTP-Referer': 'https://creaticon.app',
      'X-Title': 'Creaticon - AI Icon Studio',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: type === 'icons' 
            ? "You are a world-class icon designer creating beautiful, contextual SVG icon systems."
            : "You are an expert frontend developer creating modern, responsive web interfaces."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: false,
      temperature: 0.7,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();
  const html = result.choices[0]?.message?.content || '';

  if (!html) {
    throw new Error('Empty response from DeepSeek V3');
  }

  return {
    html: cleanHTML(html),
    success: true
  };
};

/**
 * Create enhanced prompts using analysis insights
 */
const createEnhancedPrompt = (
  input: CoordinatedGenerationRequest,
  type: 'icons' | 'ui',
  analysis?: DeepSeekAnalysis
): string => {
  const baseDescription = input.projectDescription;
  const analysisInsights = analysis ? generateAnalysisInsights(analysis) : '';

  if (type === 'icons') {
    return `Create a comprehensive icon pack for: "${baseDescription}"

${analysisInsights}

DESIGN REQUIREMENTS:
- Create 20-30 contextually relevant SVG icons
- Style: ${input.stylePreference}
- Colors: ${input.colorScheme || 'modern gradients'}
- Categories: Navigation, Actions, Content, Communication, Status, Feature-specific
- Each icon: 24x24 viewBox, semantic naming, hover animations
- Professional, consistent design language
- Modern CSS with gradients and micro-interactions

TECHNICAL SPECS:
- Complete HTML document with DOCTYPE
- Embedded CSS with animations and custom properties
- Responsive grid layout with category organization
- Size variants (16px, 24px, 32px, 48px)
- Accessibility features (aria-labels, semantic markup)

Return ONLY the complete HTML code, no explanations.`;

  } else {
    return `Create a modern web interface for: "${baseDescription}"

${analysisInsights}

REQUIREMENTS:
- Complete HTML5 structure with DOCTYPE
- Embedded CSS with modern features (Grid, Flexbox, animations)
- Responsive design: ${input.stylePreference} style
- Color scheme: ${input.colorScheme || 'modern professional'}
- Custom SVG icons throughout
- Interactive elements with JavaScript
- Professional typography and spacing
- Mobile-first responsive design

COMPONENTS TO INCLUDE:
- Header with navigation
- Main content area
- Interactive elements
- Footer
- Custom SVG icons
- Modern animations and transitions

Return ONLY the complete HTML code, no explanations.`;
  }
};

/**
 * Generate insights from DeepSeek R1 analysis
 */
const generateAnalysisInsights = (analysis: DeepSeekAnalysis): string => {
  const insights: string[] = [];

  if (analysis.appArchitecture) {
    insights.push(`APP TYPE: ${analysis.appArchitecture.appType}`);
    
    if (analysis.appArchitecture.coreFeatures?.length > 0) {
      const features = analysis.appArchitecture.coreFeatures
        .filter(f => f.priority === 'critical')
        .map(f => f.name)
        .slice(0, 5);
      insights.push(`KEY FEATURES: ${features.join(', ')}`);
    }
  }

  if (analysis.iconRequirements) {
    insights.push(`ICONS NEEDED: ${analysis.iconRequirements.totalIconsNeeded}`);
    
    if (analysis.iconRequirements.iconCategories?.length > 0) {
      const categories = analysis.iconRequirements.iconCategories
        .filter(c => c.designPriority === 'high')
        .map(c => `${c.name} (${c.count})`)
        .slice(0, 4);
      insights.push(`PRIORITY CATEGORIES: ${categories.join(', ')}`);
    }
  }

  if (analysis.designGuidelines) {
    const theme = analysis.designGuidelines.visualTheme;
    if (theme) {
      insights.push(`THEME: ${theme.mood} ${theme.primary}`);
    }

    const style = analysis.designGuidelines.iconStyle;
    if (style) {
      insights.push(`ICON STYLE: ${style.styleFamily}, ${style.visualWeight} weight`);
    }
  }

  if (analysis.contextualInsights?.domainExpertise?.length > 0) {
    const domain = analysis.contextualInsights.domainExpertise[0];
    if (domain.conventions?.length > 0) {
      insights.push(`DOMAIN CONVENTIONS: ${domain.conventions.slice(0, 3).join(', ')}`);
    }
  }

  return insights.length > 0 ? `\nCONTEXT ANALYSIS:\n${insights.join('\n')}\n` : '';
};

/**
 * Clean HTML utility
 */
const cleanHTML = (html: string): string => {
  let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  if (!cleaned.includes('<!DOCTYPE html>')) {
    cleaned = '<!DOCTYPE html>\n' + cleaned;
  }
  
  return cleaned.trim();
};

/**
 * Specialized icon generation with full coordination
 */
export const generateIconsWithFullCoordination = async (
  input: CoordinatedGenerationRequest
): Promise<CoordinatedGenerationResponse> => {
  return generateWithAICoordination({
    ...input,
    analysisRequired: true,
    optimizationLevel: 'advanced'
  }, 'icons');
};

/**
 * Specialized UI generation with full coordination
 */
export const generateUIWithFullCoordination = async (
  input: CoordinatedGenerationRequest
): Promise<CoordinatedGenerationResponse> => {
  return generateWithAICoordination({
    ...input,
    analysisRequired: true,
    optimizationLevel: 'advanced'
  }, 'ui');
};

/**
 * AI Coordinator Service Instance
 * Provides a unified interface for AI coordination
 */
export class AICoordinatorService {
  async callBestProvider(
    prompt: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      preferredProvider?: string;
      stream?: boolean;
    } = {}
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const result = await generateDesignWithV3(
        {
          projectDescription: prompt,
          projectType: 'web-app',
          stylePreference: 'modern'
        },
        'ui'
      );
      
      return {
        success: result.success,
        content: result.html,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export the service instance
export const aiCoordinator = new AICoordinatorService();
