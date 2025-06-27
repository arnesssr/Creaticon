import { ReactComponent, GenerationRequest, ComponentGenerationOptions } from '../types/reactComponent';
import { aiService } from './aiService';

export interface GenerationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  feedback?: string;
  duration?: number;
  retryCount?: number;
}

export interface MultiStepGenerationPipeline {
  id: string;
  request: GenerationRequest;
  steps: GenerationStep[];
  currentStep: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
  finalResult?: ReactComponent;
  startTime: number;
  endTime?: number;
  userFeedback?: Record<string, string>;
}

export interface StepResult {  
  success: boolean;
  data?: any;
  error?: string;
  suggestions?: string[];
  needsUserInput?: boolean;
  userPrompt?: string;
}

class MultiStepGenerationService {
  private pipelines: Map<string, MultiStepGenerationPipeline> = new Map();
  private stepHandlers: Map<string, (pipeline: MultiStepGenerationPipeline, step: GenerationStep) => Promise<StepResult>> = new Map();

  constructor() {
    this.initializeStepHandlers();
  }

  private initializeStepHandlers() {
    this.stepHandlers.set('analyze_request', this.analyzeRequest.bind(this));
    this.stepHandlers.set('generate_structure', this.generateStructure.bind(this)); 
    this.stepHandlers.set('generate_components', this.generateComponents.bind(this));
    this.stepHandlers.set('apply_styling', this.applyStyling.bind(this));
    this.stepHandlers.set('optimize_code', this.optimizeCode.bind(this));
    this.stepHandlers.set('validate_output', this.validateOutput.bind(this));
    this.stepHandlers.set('generate_variants', this.generateVariants.bind(this));
  }

  async startPipeline(request: GenerationRequest, options?: ComponentGenerationOptions): Promise<string> {
    const pipelineId = this.generatePipelineId();
    const steps = this.createStepsForRequest(request);
    
    const pipeline: MultiStepGenerationPipeline = {
      id: pipelineId,
      request: { ...request, options },
      steps,
      currentStep: 0,
      status: 'pending',
      startTime: Date.now(),
      userFeedback: {}
    };

    this.pipelines.set(pipelineId, pipeline);
    
    // Start processing asynchronously
    this.processPipeline(pipelineId);
    
    return pipelineId;
  }

  async processPipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');

    pipeline.status = 'in-progress';

    try {
      while (pipeline.currentStep < pipeline.steps.length) {
        const step = pipeline.steps[pipeline.currentStep];
        await this.executeStep(pipeline, step);
        
        // Check if we need to pause for user input
        if (step.result?.needsUserInput) {
          pipeline.status = 'paused';
          return;
        }
        
        pipeline.currentStep++;
      }

      pipeline.status = 'completed';
      pipeline.endTime = Date.now();
    } catch (error) {
      pipeline.status = 'failed';
      pipeline.endTime = Date.now();
      console.error('Pipeline failed:', error);
    }
  }

  private async executeStep(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<void> {
    const startTime = Date.now();
    step.status = 'in-progress';
    step.retryCount = (step.retryCount || 0);

    try {
      const handler = this.stepHandlers.get(step.id);
      if (!handler) {
        throw new Error(`No handler found for step: ${step.id}`);
      }

      const result = await handler(pipeline, step);
      
      if (result.success) {
        step.status = 'completed';
        step.result = result;
      } else {
        if (step.retryCount < 2) {
          step.retryCount++;
          await this.executeStep(pipeline, step);
          return;
        }
        step.status = 'failed';
        step.result = result;
      }
    } catch (error) {
      step.status = 'failed';
      step.result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }

    step.duration = Date.now() - startTime;
  }

  private createStepsForRequest(request: GenerationRequest): GenerationStep[] {
    const baseSteps: GenerationStep[] = [
      {
        id: 'analyze_request',
        name: 'Analyze Request',
        description: 'Understanding the component requirements and context',
        status: 'pending'
      },
      {
        id: 'generate_structure',
        name: 'Generate Structure',
        description: 'Creating the component architecture and prop interface',
        status: 'pending'
      },
      {
        id: 'generate_components',
        name: 'Generate Components',
        description: 'Writing the React component code',
        status: 'pending'
      },
      {
        id: 'apply_styling',
        name: 'Apply Styling',
        description: 'Adding CSS and styling systems',
        status: 'pending'
      },
      {
        id: 'optimize_code',
        name: 'Optimize Code',
        description: 'Performance and best practices optimization',
        status: 'pending'
      },
      {
        id: 'validate_output',
        name: 'Validate Output',
        description: 'Testing and validation of generated code',
        status: 'pending'
      }
    ];

    // Add optional steps based on request
    if (request.options?.generateVariants) {
      baseSteps.push({
        id: 'generate_variants',
        name: 'Generate Variants',
        description: 'Creating component variations',
        status: 'pending'
      });
    }

    return baseSteps;
  }

  private async analyzeRequest(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const { request } = pipeline;
    
    const analysisPrompt = `
Analyze this React component generation request and provide structured analysis:

Request: "${request.prompt}"
Component Type: ${request.componentType || 'general'}
Framework: ${request.framework || 'React'}
Styling: ${request.styling || 'CSS'}

Please analyze:
1. Component complexity (simple/medium/complex)
2. Required props and their types
3. Styling approach needed
4. Dependencies required
5. Potential challenges
6. Recommended structure

Respond with JSON format:
{
  "complexity": "simple|medium|complex",
  "estimatedProps": [...],
  "stylingNeeds": [...],
  "dependencies": [...],
  "challenges": [...],
  "recommendedStructure": "...",
  "suggestions": [...]
}
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: analysisPrompt,
        options: { maxTokens: 1000, temperature: 0.3 }
      });

      const analysis = JSON.parse(response.code);
      
      return {
        success: true,
        data: analysis,
        suggestions: analysis.suggestions || []
      };
    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async generateStructure(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const analysis = pipeline.steps.find(s => s.id === 'analyze_request')?.result?.data;
    if (!analysis) {
      return { success: false, error: 'No analysis data available' };
    }

    const structurePrompt = `
Based on this analysis, create the TypeScript interface and component structure:

Analysis: ${JSON.stringify(analysis)}
Original Request: "${pipeline.request.prompt}"

Generate:
1. TypeScript interface for props
2. Component structure outline
3. Import statements needed
4. Export strategy

Respond with JSON:
{
  "propsInterface": "...",
  "componentStructure": "...", 
  "imports": [...],
  "exports": "..."
}
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: structurePrompt,
        options: { maxTokens: 1500, temperature: 0.2 }
      });

      const structure = JSON.parse(response.code);
      
      return {
        success: true,
        data: structure
      };
    } catch (error) {
      return {
        success: false,
        error: `Structure generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async generateComponents(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const analysis = pipeline.steps.find(s => s.id === 'analyze_request')?.result?.data;
    const structure = pipeline.steps.find(s => s.id === 'generate_structure')?.result?.data;
    
    if (!analysis || !structure) {
      return { success: false, error: 'Missing prerequisite data' };
    }

    const componentPrompt = `
Generate the complete React component code based on:

Analysis: ${JSON.stringify(analysis)}
Structure: ${JSON.stringify(structure)}
Original Request: "${pipeline.request.prompt}"

Requirements:
- Use TypeScript
- Follow React best practices
- Include proper error handling
- Add JSDoc comments
- Make it production-ready

Generate the complete component code.
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: componentPrompt,
        options: { 
          maxTokens: 3000, 
          temperature: 0.1,
          framework: pipeline.request.framework,
          styling: pipeline.request.styling
        }
      });

      return {
        success: true,
        data: {
          component: response,
          code: response.code,
          props: response.props
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Component generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async applyStyling(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const component = pipeline.steps.find(s => s.id === 'generate_components')?.result?.data;
    if (!component) {
      return { success: false, error: 'No component data available' };
    }

    const stylingSystem = pipeline.request.styling || 'CSS';
    
    const stylingPrompt = `
Enhance this React component with ${stylingSystem} styling:

Component Code: ${component.code}

Requirements:
- Use ${stylingSystem} for styling
- Make it responsive
- Add hover states and animations
- Ensure accessibility
- Modern, clean design

Return the enhanced component with styling.
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: stylingPrompt,
        options: { 
          maxTokens: 4000, 
          temperature: 0.2,
          styling: stylingSystem
        }
      });

      return {
        success: true,
        data: {
          styledComponent: response,
          styling: stylingSystem
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Styling failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async optimizeCode(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const styledComponent = pipeline.steps.find(s => s.id === 'apply_styling')?.result?.data?.styledComponent;
    if (!styledComponent) {
      return { success: false, error: 'No styled component available' };
    }

    const optimizationPrompt = `
Optimize this React component for performance and best practices:

Component Code: ${styledComponent.code}

Apply these optimizations:
1. React.memo where appropriate
2. useCallback and useMemo optimizations
3. Prop type validation
4. Error boundaries
5. Code splitting opportunities
6. Bundle size optimization

Return the optimized component.
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: optimizationPrompt,
        options: { 
          maxTokens: 4000, 
          temperature: 0.1
        }
      });

      return {
        success: true,
        data: {
          optimizedComponent: response,
          optimizations: ['memo', 'callbacks', 'validation', 'error-boundaries']
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async validateOutput(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const optimizedComponent = pipeline.steps.find(s => s.id === 'optimize_code')?.result?.data?.optimizedComponent;
    if (!optimizedComponent) {
      return { success: false, error: 'No optimized component available' };
    }

    try {
      // Basic validation checks
      const validationResults = {
        hasValidTypeScript: this.validateTypeScript(optimizedComponent.code),
        hasValidReact: this.validateReactComponent(optimizedComponent.code),
        hasProps: optimizedComponent.props && optimizedComponent.props.length > 0,
        hasExports: optimizedComponent.code.includes('export'),
        codeQuality: this.assessCodeQuality(optimizedComponent.code)
      };

      const isValid = Object.values(validationResults).every(result => 
        typeof result === 'boolean' ? result : result.score > 0.7
      );

      if (isValid) {
        // Set the final result
        pipeline.finalResult = optimizedComponent;
        
        return {
          success: true,
          data: {
            validation: validationResults,
            finalComponent: optimizedComponent
          }
        };
      } else {
        return {
          success: false,
          error: 'Component validation failed',
          suggestions: ['Review TypeScript errors', 'Check React component structure', 'Verify exports']
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async generateVariants(pipeline: MultiStepGenerationPipeline, step: GenerationStep): Promise<StepResult> {
    const finalComponent = pipeline.finalResult;
    if (!finalComponent) {
      return { success: false, error: 'No final component available' };
    }

    const variantPrompt = `
Generate 3 variants of this React component:

Original Component: ${finalComponent.code}

Create variants:
1. Dark theme version
2. Minimal/clean version  
3. Feature-rich/enhanced version

Each variant should maintain the same props interface but have different styling and potentially additional features.
`;

    try {
      const response = await aiService.generateReactComponent({
        prompt: variantPrompt,
        options: { 
          maxTokens: 5000, 
          temperature: 0.3
        }
      });

      return {
        success: true,
        data: {
          variants: response.variants || [],
          originalComponent: finalComponent
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Variant generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Utility methods
  private validateTypeScript(code: string): boolean {
    // Basic TypeScript validation
    return code.includes('interface') || code.includes('type') || code.includes(': ');
  }

  private validateReactComponent(code: string): boolean {
    return code.includes('React') && (code.includes('function') || code.includes('const')) && code.includes('return');
  }

  private assessCodeQuality(code: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 1.0;

    if (!code.includes('export')) {
      issues.push('Missing export statement');
      score -= 0.2;
    }

    if (!code.includes('React')) {
      issues.push('Missing React import');
      score -= 0.2;
    }

    if (code.length < 100) {
      issues.push('Component seems too minimal');
      score -= 0.1; 
    }

    return { score: Math.max(0, score), issues };
  }

  private generatePipelineId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getPipeline(pipelineId: string): MultiStepGenerationPipeline | undefined {
    return this.pipelines.get(pipelineId);
  }

  async resumePipeline(pipelineId: string, userFeedback?: Record<string, string>): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');

    if (userFeedback) {
      pipeline.userFeedback = { ...pipeline.userFeedback, ...userFeedback };
    }

    if (pipeline.status === 'paused') {
      pipeline.status = 'in-progress';
      await this.processPipeline(pipelineId);
    }
  }

  async cancelPipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (pipeline) {
      pipeline.status = 'failed';
      pipeline.endTime = Date.now();
    }
  }

  getAllPipelines(): MultiStepGenerationPipeline[] {
    return Array.from(this.pipelines.values());
  }

  getActivePipelines(): MultiStepGenerationPipeline[] {
    return Array.from(this.pipelines.values()).filter(p => 
      p.status === 'in-progress' || p.status === 'paused'
    );
  }
}

export const multiStepGenerationService = new MultiStepGenerationService();
