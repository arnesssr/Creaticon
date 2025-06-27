/**
 * AI Streaming Service
 * 
 * This service provides real-time code generation with progressive updates,
 * allowing the AI to write code in the editor line by line as it generates.
 */

import { aiCoordinator } from './aiCoordinator';
import { analyzeUserPrompt, PromptAnalysis } from './aiPromptEnhancer';

export interface StreamingOptions {
  mode: 'chunk' | 'line' | 'token';
  delayMs: number;
  enablePreview: boolean;
  onProgress?: (progress: number) => void;
  onLineComplete?: (line: string, lineNumber: number) => void;
  onChunkComplete?: (chunk: string, chunkNumber: number) => void;
  onComplete?: (fullCode: string) => void;
  onError?: (error: string) => void;
}

export interface StreamingResult {
  success: boolean;
  totalLines: number;
  totalChunks: number;
  timeElapsed: number;
  analysis?: PromptAnalysis;
  error?: string;
}

export class AIStreamingService {
  private isStreaming = false;
  private currentStream: AbortController | null = null;

  /**
   * Generate and stream React component code in real-time
   */
  async streamReactComponent(
    prompt: string,
    options: StreamingOptions
  ): Promise<StreamingResult> {
    const startTime = Date.now();

    try {
      if (this.isStreaming) {
        throw new Error('Streaming already in progress');
      }

      this.isStreaming = true;
      this.currentStream = new AbortController();

      // Step 1: Analyze the prompt (V3)
      console.log('🔍 Step 1: Analyzing prompt with V3...');
      const analysisResult = await analyzeUserPrompt(prompt, 'react-component');

      if (!analysisResult.success || !analysisResult.analysis) {
        throw new Error('Failed to analyze prompt');
      }

      const analysis = analysisResult.analysis;
      console.log('✅ Analysis complete:', analysis);

      // Step 2: Generate component code (V1) 
      console.log('🎨 Step 2: Generating component with V1...');
      const enhancedPrompt = this.createStreamingPrompt(analysis);
      
      const response = await aiCoordinator.callBestProvider(enhancedPrompt, {
        maxTokens: 2000,
        temperature: 0.3,
        preferredProvider: 'gpt-4',
        stream: false // We'll handle streaming manually
      });

      if (!response.success || !response.content) {
        throw new Error('Failed to generate component code');
      }

      // Step 3: Process and stream the generated code
      console.log('⚡ Step 3: Processing and streaming code...');
      const fullCode = this.extractComponentCode(response.content);
      const streamingResult = await this.streamCodeToEditor(fullCode, options);

      return {
        success: true,
        totalLines: streamingResult.totalLines,
        totalChunks: streamingResult.totalChunks,
        timeElapsed: Date.now() - startTime,
        analysis
      };

    } catch (error) {
      console.error('Streaming error:', error);
      
      if (options.onError) {
        options.onError(error instanceof Error ? error.message : 'Streaming failed');
      }

      return {
        success: false,
        totalLines: 0,
        totalChunks: 0,
        timeElapsed: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Streaming failed'
      };
    } finally {
      this.isStreaming = false;
      this.currentStream = null;
    }
  }

  /**
   * Create an optimized prompt for streaming generation
   */
  private createStreamingPrompt(analysis: PromptAnalysis): string {
    return `Create a complete React TypeScript component based on this analysis:

REQUIREMENTS:
${analysis.enhancedPrompt}

TARGET OUTPUT:
${analysis.targetOutput}

DESIGN STYLE: ${analysis.designStyle}
COMPLEXITY: ${analysis.complexity}

SPECIFIC INSTRUCTIONS:
- Write clean, readable TypeScript React code
- Use Tailwind CSS for styling 
- Include proper TypeScript interfaces for props
- Add JSDoc comments for functions
- Use modern React patterns (hooks, functional components)
- Ensure responsive design
- Follow accessibility best practices
- Include error handling where appropriate

OUTPUT FORMAT:
Return ONLY the React component code, no explanations or markdown.
Start with imports and end with export default.

The component should be production-ready and self-contained.`;
  }

  /**
   * Extract clean component code from AI response
   */
  private extractComponentCode(response: string): string {
    // Remove markdown code blocks if present
    let code = response.replace(/```[a-z]*\n?/g, '').trim();
    
    // Remove any explanatory text before the actual code
    const lines = code.split('\n');
    let startIndex = 0;
    
    // Find the first import or React-related line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^(import|interface|type|const|function|export)/)) {
        startIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex).join('\n');
  }

  /**
   * Stream code to editor with configurable mode
   */
  private async streamCodeToEditor(
    code: string,
    options: StreamingOptions
  ): Promise<{ totalLines: number; totalChunks: number }> {
    return new Promise((resolve, reject) => {
      const lines = code.split('\n');
      const totalLines = lines.length;
      let currentLineIndex = 0;
      let currentChunkIndex = 0;

      const streamInterval = setInterval(() => {
        if (this.currentStream?.signal.aborted) {
          clearInterval(streamInterval);
          reject(new Error('Streaming aborted'));
          return;
        }

        if (currentLineIndex >= totalLines) {
          clearInterval(streamInterval);
          
          if (options.onComplete) {
            options.onComplete(code);
          }
          
          resolve({ totalLines, totalChunks: currentChunkIndex });
          return;
        }

        const currentLine = lines[currentLineIndex];
        
        // Call line completion callback
        if (options.onLineComplete) {
          options.onLineComplete(currentLine, currentLineIndex + 1);
        }

        // Update progress
        const progress = Math.round(((currentLineIndex + 1) / totalLines) * 100);
        if (options.onProgress) {
          options.onProgress(progress);
        }

        // Handle chunk completion (every 5 lines)
        if ((currentLineIndex + 1) % 5 === 0 && options.onChunkComplete) {
          const chunkLines = lines.slice(currentChunkIndex * 5, currentLineIndex + 1);
          options.onChunkComplete(chunkLines.join('\n'), currentChunkIndex + 1);
          currentChunkIndex++;
        }

        currentLineIndex++;
      }, options.delayMs);
    });
  }

  /**
   * Stop current streaming operation
   */
  stopStreaming(): void {
    if (this.currentStream) {
      this.currentStream.abort();
      this.currentStream = null;
    }
    this.isStreaming = false;
  }

  /**
   * Check if streaming is currently active
   */
  get isStreamingActive(): boolean {
    return this.isStreaming;
  }

  /**
   * Generate code with typing animation effect
   */
  async streamWithTypingEffect(
    prompt: string,
    onUpdate: (code: string, progress: number) => void
  ): Promise<StreamingResult> {
    const options: StreamingOptions = {
      mode: 'line',
      delayMs: 100, // Fast typing effect
      enablePreview: true,
      onProgress: (progress) => {
        // Progress is handled in onLineComplete
      },
      onLineComplete: (line, lineNumber) => {
        // Build code progressively
        const codeLines = [];
        for (let i = 0; i < lineNumber; i++) {
          // We need to rebuild from stored lines
          // This is a simplified version - in practice you'd store the lines
        }
      }
    };

    let accumulatedCode = '';
    
    options.onLineComplete = (line, lineNumber) => {
      accumulatedCode += (accumulatedCode ? '\n' : '') + line;
      const progress = lineNumber; // Will be calculated properly in the main function
      onUpdate(accumulatedCode, progress);
    };

    return this.streamReactComponent(prompt, options);
  }

  /**
   * Generate code with chunk-based updates (more performance-friendly)
   */
  async streamWithChunks(
    prompt: string,
    onChunkUpdate: (chunk: string, chunkNumber: number, totalChunks: number) => void,
    onComplete: (fullCode: string) => void
  ): Promise<StreamingResult> {
    const options: StreamingOptions = {
      mode: 'chunk',
      delayMs: 300, // Slower for chunks
      enablePreview: true,
      onChunkComplete: onChunkUpdate,
      onComplete
    };

    return this.streamReactComponent(prompt, options);
  }
}

// Singleton instance
export const aiStreamingService = new AIStreamingService();

// Utility functions for easy integration
export const streamComponentToEditor = async (
  prompt: string,
  editorUpdateCallback: (code: string, progress: number) => void
): Promise<StreamingResult> => {
  return aiStreamingService.streamWithTypingEffect(prompt, editorUpdateCallback);
};

export const streamComponentInChunks = async (
  prompt: string,
  chunkCallback: (chunk: string, chunkNumber: number, totalChunks: number) => void,
  completeCallback: (fullCode: string) => void
): Promise<StreamingResult> => {
  return aiStreamingService.streamWithChunks(prompt, chunkCallback, completeCallback);
};

export default {
  AIStreamingService,
  aiStreamingService,
  streamComponentToEditor,
  streamComponentInChunks
};
