import React, { useState } from 'react';
import { ExtractedIcon } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Package, Share, MoreVertical, Copy, Palette, Image } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import ConversionDialog from '@/components/ui/ConversionDialog';
import toast from 'react-hot-toast';

interface IconResultsProps {
  icons: ExtractedIcon[];
}

const IconResults: React.FC<IconResultsProps> = ({ icons }) => {
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedSize, setSelectedSize] = useState(48);
  
  if (icons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <p className="text-gray-600">No icons generated yet.</p>
      </div>
    );
  }

  const downloadIcon = (icon: ExtractedIcon, color?: string) => {
    let svgContent = icon.svg;
    if (color) {
      // Simple color replacement - in production, you'd want more sophisticated SVG color manipulation
      svgContent = svgContent.replace(/fill="[^"]*"/g, `fill="${color}"`);
      svgContent = svgContent.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
    }
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    saveAs(blob, `${icon.name}.svg`);
    toast.success(`Downloaded ${icon.name}`);
  };

  const downloadAllIcons = async () => {
    const zip = new JSZip();
    icons.forEach(icon => {
      zip.file(`${icon.name}.svg`, icon.svg);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'icon-pack.zip');
    toast.success(`Downloaded ${icons.length} icons as ZIP`);
  };

  const shareIconPack = () => {
    // In a real app, you'd generate a shareable link
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard!');
  };

  const applyColorToSVG = (svg: string, color: string) => {
    return svg
      .replace(/fill="[^"]*"/g, `fill="${color}"`)
      .replace(/stroke="[^"]*"/g, `stroke="${color}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Generated Icon Pack ({icons.length} icons)
            </h3>
            <p className="text-muted-foreground text-sm">Beautiful, customizable SVG icons</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadAllIcons} variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Download All
            </Button>
            <Button onClick={shareIconPack} variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share Pack
            </Button>
          </div>
        </div>
      </div>

      {/* Color and Size customization */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="space-y-4">
          {/* Color customization */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-foreground">
              Preview Color:
            </label>
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-16 h-8 p-1 border-2 rounded cursor-pointer"
            />
            <span className="text-sm text-muted-foreground font-mono">{selectedColor}</span>
            
            {/* Preset colors */}
            <div className="flex gap-2">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280', '#000000'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-foreground scale-110' : 'border-border'
                  } transition-all hover:scale-110`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Size customization */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-foreground">
              Preview Size:
            </label>
            <div className="flex gap-2">
              {[16, 24, 32, 48, 64, 96].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-xs rounded border ${
                    selectedSize === size 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  } transition-colors`}
                >
                  {size}px
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Current: {selectedSize}px</span>
          </div>
        </div>
      </div>

      {/* Icons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {icons.map((icon) => (
          <div key={icon.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Icon preview */}
            <div className="p-6 flex items-center justify-center bg-muted/30" style={{ height: `${Math.max(selectedSize + 32, 80)}px` }}>
              <div 
                className="flex items-center justify-center"
                style={{ width: `${selectedSize}px`, height: `${selectedSize}px` }}
                dangerouslySetInnerHTML={{ 
                  __html: applyColorToSVG(icon.svg, selectedColor)
                }} 
              />
            </div>
            
            {/* Icon info and actions */}
            <div className="p-3">
              <p className="text-sm font-medium text-foreground mb-2 truncate">
                {icon.name}
              </p>
              <div className="flex gap-1">
                <Button 
                  onClick={() => downloadIcon(icon, selectedColor)}
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-2">
                      <Button 
                        onClick={() => downloadIcon(icon)}
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-xs"
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download Original
                      </Button>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(icon.svg);
                          toast.success('SVG code copied!');
                        }}
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-xs"
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy SVG Code
                      </Button>
                      <ConversionDialog 
                        svgContent={icon.svg}
                        iconName={icon.name}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs"
                        >
                          <Image className="w-3 h-3 mr-2" />
                          Convert to PNG/JPG
                        </Button>
                      </ConversionDialog>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconResults;

