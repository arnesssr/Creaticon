import { useState } from 'react';
import { toast } from 'sonner';
import { generateAPI, GenerateRequest } from '@/api/generate';
import { AIProvider } from '@/lib/aiService';

export interface GenerationInput {
  projectDescription: string;
  projectType: string;
  stylePreference: string;
  colorScheme?: string;
  provider?: AIProvider;
}

export interface GenerationResult {
  html: string;
  css: string;
  javascript: string;
  pages: Array<{
    name: string;
    path: string;
    html: string;
    description: string;
  }>;
  logos: Array<{
    name: string;
    svg: string;
    description: string;
    variants: string[];
  }>;
  icons: Array<{
    id: string;
    name: string;
    svg: string;
    category: string;
  }>;
}

export const useGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generateUI = async (input: GenerationInput) => {
    if (!input.projectDescription.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress steps
      const steps = [
        'Analyzing project requirements...',
        'Selecting AI provider...',
        'Generating UI structure...',
        'Creating custom styles...',
        'Adding interactive elements...',
        'Extracting SVG icons...',
        'Finalizing output...'
      ];

      for (let i = 0; i < steps.length - 1; i++) {
        toast.info(steps[i]);
        setProgress((i + 1) * 14);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Use the updated API function with provider support
      const data = await generateAPI(input as GenerateRequest);

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      toast.info(steps[steps.length - 1]);
      setProgress(100);

      setResult({
        html: data.data!.html,
        css: data.data!.css,
        javascript: data.data!.javascript,
        pages: data.data!.pages || [],
        logos: data.data!.logos || [],
        icons: data.data!.icons
      });

      toast.success('UI generated successfully!');

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate UI');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    generateUI,
    resetGeneration,
    isGenerating,
    progress,
    result
  };
};
