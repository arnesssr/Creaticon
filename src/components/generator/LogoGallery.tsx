import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Palette, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface LogoDefinition {
  name: string;
  svg: string;
  description: string;
  variants: string[];
}

interface LogoGalleryProps {
  logos: LogoDefinition[];
}

export const LogoGallery: React.FC<LogoGalleryProps> = ({ logos }) => {
  const [selectedFormat, setSelectedFormat] = useState<'svg' | 'png' | 'pdf'>('svg');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');

  const copyToClipboard = async (svg: string, logoName: string) => {
    try {
      await navigator.clipboard.writeText(svg);
      toast.success(`${logoName} SVG copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadLogo = (svg: string, logoName: string, format: string) => {
    const fileName = `${logoName.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    
    if (format === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${logoName} downloaded as ${format.toUpperCase()}!`);
    } else {
      // For PNG/PDF conversion, we'd typically use a library like html2canvas or puppeteer
      // For now, just download as SVG with a message
      toast.info(`${format.toUpperCase()} conversion coming soon! Downloaded as SVG instead.`);
      downloadLogo(svg, logoName, 'svg');
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'w-16 h-16';
      case 'medium': return 'w-24 h-24';
      case 'large': return 'w-32 h-32';
      default: return 'w-24 h-24';
    }
  };

  if (logos.length === 0) {
    return (
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardContent className="text-center py-12">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No logos generated yet. Generate a complete project to see SVG logos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Format:</label>
            <Select value={selectedFormat} onValueChange={(value: 'svg' | 'png' | 'pdf') => setSelectedFormat(value)}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Size:</label>
            <Select value={selectedSize} onValueChange={(value: 'small' | 'medium' | 'large') => setSelectedSize(value)}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map((logo, index) => (
          <Card key={index} className="backdrop-blur-lg bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg">{logo.name}</CardTitle>
              <CardDescription className="text-gray-300">{logo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Preview */}
              <div className="flex justify-center items-center bg-white/5 rounded-lg p-6 min-h-[120px]">
                <div 
                  className={`${getSizeClass(selectedSize)} flex items-center justify-center`}
                  dangerouslySetInnerHTML={{ __html: logo.svg }}
                />
              </div>

              {/* Variants */}
              {logo.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Variants:</label>
                  <div className="flex flex-wrap gap-1">
                    {logo.variants.map((variant, variantIndex) => (
                      <Badge key={variantIndex} variant="secondary" className="text-xs">
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(logo.svg, logo.name)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SVG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadLogo(logo.svg, logo.name, selectedFormat)}
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Full Preview Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => {
                  // Open modal or expand view (would implement modal here)
                  toast.info('Full preview modal coming soon!');
                }}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
