import React from 'react';
import { ProcessedCode } from '@/types';
import IconResults from './IconResults';
import UIResults from './UIResults';

interface ResultsDisplayProps {
  generationType: 'icons' | 'ui';
  isLoading: boolean;
  generatedCode: ProcessedCode | null;
  error: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  generationType,
  isLoading,
  generatedCode,
  error
}) => {
  console.log('🎯 ResultsDisplay render - isLoading:', isLoading, 'generationType:', generationType);
  
  // Loading is now handled directly in ChatInterface
  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <div className="text-destructive text-lg font-medium mb-2">❌ Generation Failed</div>
        <p className="text-destructive/80">{error}</p>
      </div>
    );
  }

  if (!generatedCode) {
    return null;
  }

  return (
    <div className="space-y-6">
      {generationType === 'icons' ? (
        <IconResults icons={generatedCode.svgIcons} />
      ) : (
        <UIResults generatedCode={generatedCode} />
      )}
    </div>
  );
};

export default ResultsDisplay;
