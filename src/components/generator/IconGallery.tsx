
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Icon {
  id: string;
  name: string;
  svg: string;
  category: string;
}

interface IconGalleryProps {
  icons: Icon[];
}

export const IconGallery = ({ icons }: IconGalleryProps) => {
  const downloadIcon = (icon: Icon) => {
    const blob = new Blob([icon.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${icon.name} icon`);
  };

  const downloadAllIcons = () => {
    icons.forEach((icon, index) => {
      setTimeout(() => downloadIcon(icon), index * 100);
    });
    toast.success(`Downloading ${icons.length} icons`);
  };

  const copyIconSVG = (icon: Icon) => {
    navigator.clipboard.writeText(icon.svg);
    toast.success(`Copied ${icon.name} SVG to clipboard`);
  };

  const categories = [...new Set(icons.map(icon => icon.category))];

  return (
    <Card className="backdrop-blur-lg bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Generated Icons</CardTitle>
          <Button
            onClick={downloadAllIcons}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map(category => (
            <Badge key={category} variant="secondary" className="bg-white/20 text-white">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {icons.map((icon) => (
            <div
              key={icon.id}
              className="group relative bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center space-y-3">
                <div
                  className="w-12 h-12 flex items-center justify-center text-white"
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{icon.name}</p>
                  <p className="text-gray-400 text-xs">{icon.category}</p>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyIconSVG(icon)}
                  className="text-xs border-white/20 text-white hover:bg-white/10"
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadIcon(icon)}
                  className="text-xs bg-blue-500 hover:bg-blue-600"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {icons.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🎭</div>
            <p>No icons generated yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
