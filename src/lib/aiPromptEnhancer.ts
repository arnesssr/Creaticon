import { aiCoordinator } from './aiCoordinator';

/**
 * AI Prompt Enhancement and Analysis System
 * 
 * This system uses multiple AI models to:
 * 1. Analyze user input for context and intent
 * 2. Enhance prompts for better generation results
 * 3. Coordinate between different AI models for optimal results
 */

export interface PromptAnalysis {
  intent: 'icon-generation' | 'component-generation';
  context: string;
  designStyle: string;
  complexity: 'simple' | 'medium' | 'complex';
  requirements: string[];
  enhancedPrompt: string;
  targetOutput: string;
  estimatedTime: number; // in seconds
}

export interface EnhancementResult {
  success: boolean;
  analysis?: PromptAnalysis;
  error?: string;
}

/**
 * V3 Model - Prompt Analysis and Context Finding
 * Uses DeepSeek V3 for intelligent prompt analysis
 */
export const analyzeUserPrompt = async (
  userInput: string, 
  generationType: 'icons' | 'react-component'
): Promise<EnhancementResult> => {
  try {
    console.log(`🔍 V3 Analysis - Analyzing user input for ${generationType}...`);
    
    const analysisPrompt = `You are an expert design and development analyst. Analyze the user's request and provide structured analysis.

USER REQUEST: "${userInput}"
GENERATION TYPE: ${generationType}

Analyze and respond with ONLY a JSON object in this exact format:
{
  "intent": "${generationType === 'icons' ? 'icon-generation' : 'component-generation'}",
  "context": "Brief context of what user wants",
  "designStyle": "modern|minimal|corporate|creative|glassmorphism|neumorphism",
  "complexity": "simple|medium|complex",
  "requirements": ["requirement1", "requirement2", "requirement3"],
  "enhancedPrompt": "Enhanced detailed prompt for AI generation",
  "targetOutput": "Clear description of expected output",
  "estimatedTime": 3
}

Requirements for analysis:
- Be specific about design patterns
- Extract implicit requirements
- Suggest modern design trends
- Keep enhancedPrompt under 500 words but comprehensive
- Focus on ${generationType === 'icons' ? 'SVG icon sets with consistent styling' : 'React components with TypeScript and Tailwind CSS'}`;

    const response = await aiCoordinator.callBestProvider(analysisPrompt, {
      maxTokens: 1000,
      temperature: 0.3,
      preferredProvider: 'deepseek-v3' // V3 for analysis
    });

    if (!response.success || !response.content) {
      throw new Error('Failed to analyze user prompt');
    }

    // Parse the JSON response
    let analysis: PromptAnalysis;
    try {
      // Extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysis.enhancedPrompt || !analysis.targetOutput) {
        throw new Error('Invalid analysis structure');
      }
      
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      
      // Fallback: create basic analysis
      analysis = createFallbackAnalysis(userInput, generationType);
    }

    console.log('✅ V3 Analysis completed:', analysis);
    
    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('Prompt analysis error:', error);
    
    // Fallback to basic enhancement
    const fallbackAnalysis = createFallbackAnalysis(userInput, generationType);
    
    return {
      success: true,
      analysis: fallbackAnalysis
    };
  }
};

/**
 * Fallback analysis when AI analysis fails
 */
const createFallbackAnalysis = (
  userInput: string, 
  generationType: 'icons' | 'react-component'
): PromptAnalysis => {
  const isIcons = generationType === 'icons';
  
  return {
    intent: isIcons ? 'icon-generation' : 'component-generation',
    context: `User wants to create ${isIcons ? 'icons' : 'a React component'} based on their description`,
    designStyle: 'modern',
    complexity: userInput.length > 100 ? 'complex' : userInput.length > 50 ? 'medium' : 'simple',
    requirements: isIcons 
      ? ['Consistent style', 'SVG format', 'Scalable design', 'Modern aesthetics']
      : ['React TypeScript', 'Tailwind CSS', 'Responsive design', 'Accessibility'],
    enhancedPrompt: isIcons 
      ? `Create a professional SVG icon set based on: ${userInput}. Use modern, clean design with consistent styling, proper viewBox, and scalable vector graphics.`
      : `Create a modern React TypeScript component based on: ${userInput}. Use Tailwind CSS for styling, ensure responsive design, include proper TypeScript props, and follow accessibility best practices.`,
    targetOutput: isIcons 
      ? 'SVG icon set with consistent styling and proper markup'
      : 'React TypeScript component with props, styling, and documentation',
    estimatedTime: 4
  };
};

/**
 * Enhanced generation function that uses V3 analysis + V1 generation
 */
export const generateWithEnhancement = async (
  userInput: string,
  generationType: 'icons' | 'react-component'
): Promise<{
  success: boolean;
  analysis?: PromptAnalysis;
  result?: any;
  error?: string;
}> => {
  try {
    console.log('🚀 Starting enhanced generation workflow...');
    
    // Step 1: V3 Analysis (should take ~1-2 seconds)
    console.log('📊 Step 1: Analyzing user input with V3...');
    const analysisResult = await analyzeUserPrompt(userInput, generationType);
    
    if (!analysisResult.success || !analysisResult.analysis) {
      throw new Error('Failed to analyze user input');
    }

    const analysis = analysisResult.analysis;
    console.log('✅ Analysis complete. Enhanced prompt ready.');

    // Step 2: V1 Generation (should take ~2-3 seconds)
    console.log('🎨 Step 2: Generating with V1 using enhanced prompt...');
    
    let generationResult;
    if (generationType === 'icons') {
      // ICONS ONLY: Use dedicated icon generation service
      console.log('🎨 Generating icons with dedicated icon service...');
      const { generateIconsWithAI } = await import('./aiService');
      generationResult = await generateIconsWithAI({
        projectDescription: analysis.enhancedPrompt,
        projectType: 'icon-pack',
        stylePreference: analysis.designStyle as any,
        colorScheme: 'contextual and beautiful gradients',
        provider: 'auto',
        type: 'icons' // Explicitly specify icons only
      });
    } else if (generationType === 'react-component') {
      // COMPONENTS ONLY: Use dedicated component generation service
      console.log('⚛️ Generating React component with dedicated component service...');
      const { generateReactComponentWithAI } = await import('./aiServices');
      generationResult = await generateReactComponentWithAI({
        description: analysis.enhancedPrompt,
        framework: 'react-typescript',
        styling: 'tailwind',
        responsive: true,
        accessibility: true,
        complexity: analysis.complexity
      });
    } else {
      throw new Error(`Unsupported generation type: ${generationType}`);
    }

    console.log('✅ Enhanced generation workflow completed successfully');

    return {
      success: true,
      analysis,
      result: generationResult
    };

  } catch (error) {
    console.error('Enhanced generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Enhanced generation failed'
    };
  }
};

/**
 * Quick prompt enhancement for real-time suggestions
 */
export const quickEnhancePrompt = (
  userInput: string,
  generationType: 'icons' | 'react-component'
): string => {
  if (!userInput.trim()) return '';
  
  const isIcons = generationType === 'icons';
  const baseEnhancements = isIcons 
    ? ' with consistent modern styling, proper SVG structure, and scalable design'
    : ' using React TypeScript, Tailwind CSS, responsive design, and accessibility best practices';
  
  // Add context if missing
  if (userInput.length < 20) {
    return `Create ${isIcons ? 'a professional icon set for' : 'a modern React component for'} ${userInput}${baseEnhancements}`;
  }
  
  // Enhance existing description
  if (!userInput.toLowerCase().includes(isIcons ? 'icon' : 'component')) {
    return `${userInput}${baseEnhancements}`;
  }
  
  return userInput;
};

export default {
  analyzeUserPrompt,
  generateWithEnhancement,
  quickEnhancePrompt
};
