import { useState } from 'react';
import { toast } from 'sonner';
import { generateCompleteProject, CompleteProjectGeneration, GenerationRequest } from '@/lib/gemini';

export interface ProjectGenerationInput {
  projectDescription: string;
  projectType: string;
  stylePreference: string;
  colorScheme?: string;
}

export const useProjectGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompleteProjectGeneration | null>(null);

  const generateProject = async (input: ProjectGenerationInput) => {
    if (!input.projectDescription.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress steps for complete project generation
      const steps = [
        'Analyzing project requirements...',
        'Creating project structure...',
        'Generating SVG logos...',
        'Creating main page...',
        'Generating additional pages...',
        'Creating global styles...',
        'Finalizing project...'
      ];

      let currentStep = 0;
      
      // Progress simulation with real generation steps
      const updateProgress = (step: string) => {
        toast.info(step);
        setProgress(Math.round((currentStep++ / steps.length) * 100));
      };

      updateProgress(steps[0]);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate the complete project
      const projectResult = await generateCompleteProject(input as GenerationRequest);

      // Update progress through each step
      for (let i = 1; i < steps.length; i++) {
        updateProgress(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!projectResult.success) {
        throw new Error(projectResult.error || 'Project generation failed');
      }

      setProgress(100);
      setResult(projectResult);
      toast.success('Complete project generated successfully!');

    } catch (error) {
      console.error('Project generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate project');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    generateProject,
    resetGeneration,
    isGenerating,
    progress,
    result
  };
};
