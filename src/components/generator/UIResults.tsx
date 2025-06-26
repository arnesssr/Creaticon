import React from 'react';
import { ProcessedCode } from '@/types';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

interface UIResultsProps {
  generatedCode: ProcessedCode;
}

const UIResults: React.FC<UIResultsProps> = ({ generatedCode }) => {
  const downloadHTML = () => {
    const blob = new Blob([generatedCode.html], { type: 'text/html' });
    saveAs(blob, 'component.html');
    toast.success('HTML file downloaded!');
  };

  const downloadCSS = () => {
    const blob = new Blob([generatedCode.css], { type: 'text/css' });
    saveAs(blob, 'styles.css');
    toast.success('CSS file downloaded!');
  };

  const downloadJS = () => {
    if (generatedCode.javascript && generatedCode.javascript.trim()) {
      const blob = new Blob([generatedCode.javascript], { type: 'text/javascript' });
      saveAs(blob, 'script.js');
      toast.success('JavaScript file downloaded!');
    } else {
      toast.info('No JavaScript code to download');
    }
  };

  const downloadCompletePackage = async () => {
    const zip = new JSZip();
    
    // Add HTML file
    zip.file('index.html', generatedCode.html);
    
    // Add CSS file
    zip.file('styles.css', generatedCode.css);
    
    // Add JavaScript file if it exists
    if (generatedCode.javascript && generatedCode.javascript.trim()) {
      zip.file('script.js', generatedCode.javascript);
    }
    
    // Add individual SVG icons if any
    if (generatedCode.svgIcons && generatedCode.svgIcons.length > 0) {
      const iconsFolder = zip.folder('icons');
      generatedCode.svgIcons.forEach(icon => {
        iconsFolder?.file(`${icon.name}.svg`, icon.svg);
      });
    }
    
    // Add a README file
    const readmeContent = `# UI Component Package\n\nGenerated UI component with the following files:\n\n- index.html: Main HTML structure\n- styles.css: CSS styling\n${generatedCode.javascript ? '- script.js: JavaScript functionality\n' : ''}${generatedCode.svgIcons?.length ? `- icons/: ${generatedCode.svgIcons.length} SVG icon files\n` : ''}\n## Usage\n\nOpen index.html in your browser to view the component.\nCopy the HTML, CSS, and JS into your project as needed.`;
    
    zip.file('README.md', readmeContent);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'ui-component-package.zip');
    toast.success('Complete package downloaded!');
  };

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
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={downloadHTML}
              variant="outline"
              size="sm"
            >
              📄 Download HTML
            </Button>
            <Button 
              onClick={downloadCSS}
              variant="outline"
              size="sm"
            >
              🎨 Download CSS
            </Button>
            {generatedCode.javascript && generatedCode.javascript.trim() && (
              <Button 
                onClick={downloadJS}
                variant="outline"
                size="sm"
              >
                ⚡ Download JS
              </Button>
            )}
            <Button 
              onClick={downloadCompletePackage}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              📦 Download Complete Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIResults;
