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
        <p className="text-destructive/80 mb-4">{error}</p>
        {error.includes('Rate limit') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 text-sm mb-2">
              💡 <strong>Rate Limit Tips:</strong>
            </p>
            <ul className="text-yellow-700 text-xs text-left space-y-1">
              <li>• Wait 30-60 seconds before trying again</li>
              <li>• The system will automatically try backup providers</li>
              <li>• Consider using shorter, more specific descriptions</li>
              <li>• Check if you have Gemini API key configured as backup</li>
            </ul>
          </div>
        )}
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
