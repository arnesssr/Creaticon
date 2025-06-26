import React from 'react';
import { ProcessedCode } from '@/types';
import LoadingDisplay from './LoadingDisplay';
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
  
  if (isLoading) {
    console.log('✨ Showing LoadingDisplay');
    return <LoadingDisplay generationType={generationType} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-medium mb-2">❌ Generation Failed</div>
        <p className="text-red-700">{error}</p>
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
