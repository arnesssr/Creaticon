import React from 'react';
import { ProcessedCode } from '@/types';
import { Button } from '@/components/ui/button';

interface UIResultsProps {
  generatedCode: ProcessedCode;
}

const UIResults: React.FC<UIResultsProps> = ({ generatedCode }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Generated UI Preview</h3>
        </div>
        <div className="p-0">
          <iframe
            srcDoc={generatedCode.preview}
            className="w-full h-96 border-0"
            title="Generated UI Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Button 
              onClick={() => console.log('Download HTML')}
              variant="outline"
            >
              Download HTML
            </Button>
            <Button 
              onClick={() => console.log('Download CSS')}
              variant="outline"
            >
              Download CSS
            </Button>
            <Button 
              onClick={() => console.log('Download All')}
            >
              Download Complete Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIResults;
