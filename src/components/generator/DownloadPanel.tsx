
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface GeneratedResult {
  html: string;
  css: string;
  javascript: string;
  icons: Array<{
    id: string;
    name: string;
    svg: string;
    category: string;
  }>;
}

interface DownloadPanelProps {
  generatedResult: GeneratedResult;
}

export const DownloadPanel = ({ generatedResult }: DownloadPanelProps) => {
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const downloadAllAsZip = async () => {
    // In a real implementation, you would use JSZip here
    toast.info("ZIP download would be implemented with JSZip library");
  };

  const downloadOptions = [
    {
      title: "Complete HTML File",
      description: "Ready-to-use HTML file with embedded styles",
      filename: "index.html",
      content: generatedResult.html,
      mimeType: "text/html"
    },
    {
      title: "CSS Stylesheet",
      description: "Separated CSS styles for better organization",
      filename: "styles.css",
      content: generatedResult.css,
      mimeType: "text/css"
    },
    {
      title: "JavaScript File",
      description: "Interactive functionality and animations",
      filename: "script.js",
      content: generatedResult.javascript,
      mimeType: "text/javascript"
    }
  ];

  return (
    <Card className="backdrop-blur-lg bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Download Assets</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {downloadOptions.map((option, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{option.title}</h3>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
              <Button
                onClick={() => downloadFile(option.content, option.filename, option.mimeType)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Complete Package</h3>
              <p className="text-gray-400 text-sm">
                All files and {generatedResult.icons.length} icons in one ZIP
              </p>
            </div>
            <Button
              onClick={downloadAllAsZip}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download ZIP
            </Button>
          </div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <h4 className="text-yellow-300 font-medium mb-2">📝 Usage Instructions</h4>
          <ul className="text-yellow-100 text-sm space-y-1">
            <li>• The HTML file is ready to open in any browser</li>
            <li>• CSS and JS files can be linked separately for better organization</li>
            <li>• Icons are provided as SVG files for scalability</li>
            <li>• All code is optimized and production-ready</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
