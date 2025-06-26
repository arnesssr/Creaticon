
import { Card } from "@/components/ui/card";

interface PreviewPanelProps {
  generatedHTML: string;
}

export const PreviewPanel = ({ generatedHTML }: PreviewPanelProps) => {
  if (!generatedHTML) {
    return (
      <div className="h-96 bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-lg font-medium">Preview will appear here</p>
          <p className="text-sm">Enter your project description and click generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Live Preview</h3>
        <div className="flex gap-2">
          <button className="w-3 h-3 rounded-full bg-red-500"></button>
          <button className="w-3 h-3 rounded-full bg-yellow-500"></button>
          <button className="w-3 h-3 rounded-full bg-green-500"></button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
        <iframe
          srcDoc={generatedHTML}
          className="w-full h-96 border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Generated UI Preview"
        />
      </div>
      
      <div className="flex gap-2 justify-center">
        <button className="px-3 py-1 text-xs bg-white/20 text-white rounded-full">Desktop</button>
        <button className="px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20">Tablet</button>
        <button className="px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20">Mobile</button>
      </div>
    </div>
  );
};
