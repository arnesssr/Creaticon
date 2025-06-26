
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Package, Image } from "lucide-react";
import { useDownload } from "@/hooks/useDownload";

interface DownloadPanelProps {
  generatedResult: {
    html: string;
    css: string;
    javascript: string;
    icons: Array<{
      id: string;
      name: string;
      svg: string;
      category: string;
    }>;
  };
}

export const DownloadPanel = ({ generatedResult }: DownloadPanelProps) => {
  const { downloadSingleFile, downloadZip, isDownloading } = useDownload();

  const downloadHTML = () => {
    downloadSingleFile('index.html', generatedResult.html, 'text/html');
  };

  const downloadCSS = () => {
    downloadSingleFile('styles.css', generatedResult.css, 'text/css');
  };

  const downloadJS = () => {
    downloadSingleFile('script.js', generatedResult.javascript, 'text/javascript');
  };

  const downloadAllAsZip = () => {
    downloadZip(generatedResult);
  };

  const downloadIcon = (icon: any) => {
    downloadSingleFile(`${icon.name}.svg`, icon.svg, 'image/svg+xml');
  };

  return (
    <div className="space-y-6">
      {/* Individual File Downloads */}
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Individual Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={downloadHTML}
              disabled={isDownloading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              HTML File
            </Button>
            
            {generatedResult.css && (
              <Button
                onClick={downloadCSS}
                disabled={isDownloading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                CSS File
              </Button>
            )}
            
            {generatedResult.javascript && (
              <Button
                onClick={downloadJS}
                disabled={isDownloading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                JS File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Icons Download */}
      {generatedResult.icons.length > 0 && (
        <Card className="backdrop-blur-lg bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image className="h-5 w-5" />
              Custom Icons ({generatedResult.icons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generatedResult.icons.map((icon) => (
                <div key={icon.id} className="text-center">
                  <div 
                    className="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-white/20 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: icon.svg }}
                  />
                  <Button
                    onClick={() => downloadIcon(icon)}
                    disabled={isDownloading}
                    size="sm"
                    className="text-xs bg-white/20 hover:bg-white/30 text-white"
                  >
                    {icon.name}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Project Download */}
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Complete Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Download everything as a ZIP file including HTML, CSS, JavaScript, and all custom icons.
            </p>
            <Button
              onClick={downloadAllAsZip}
              disabled={isDownloading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3"
            >
              <Package className="h-5 w-5 mr-2" />
              {isDownloading ? "Creating ZIP..." : "Download Complete Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
