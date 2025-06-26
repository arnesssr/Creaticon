import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { convertSvgToFormat, presetSizes, presetFormats, ConversionFormat } from '@/lib/svgConverter';
import toast from 'react-hot-toast';
import { Download, Image } from 'lucide-react';

interface ConversionDialogProps {
  svgContent: string;
  iconName: string;
  children: React.ReactNode;
}

const ConversionDialog: React.FC<ConversionDialogProps> = ({ 
  svgContent, 
  iconName, 
  children 
}) => {
  const [selectedFormats, setSelectedFormats] = useState<ConversionFormat[]>(['png']);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([48]);
  const [customSize, setCustomSize] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [quality, setQuality] = useState<number>(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFormatChange = (format: ConversionFormat, checked: boolean) => {
    if (checked) {
      setSelectedFormats(prev => [...prev, format]);
    } else {
      setSelectedFormats(prev => prev.filter(f => f !== format));
    }
  };

  const handleSizeChange = (size: number, checked: boolean) => {
    if (checked) {
      setSelectedSizes(prev => [...prev, size]);
    } else {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    }
  };

  const addCustomSize = () => {
    const size = parseInt(customSize);
    if (size && size > 0 && size <= 2048 && !selectedSizes.includes(size)) {
      setSelectedSizes(prev => [...prev, size].sort((a, b) => a - b));
      setCustomSize('');
    }
  };

  const handleConvert = async () => {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format');
      return;
    }
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    setIsConverting(true);
    
    try {
      const conversions = selectedFormats.flatMap(format =>
        selectedSizes.map(size => ({
          format,
          size,
          backgroundColor: (format === 'jpg' || format === 'jpeg') ? backgroundColor : undefined,
          quality: (format === 'jpg' || format === 'jpeg' || format === 'webp') ? quality : undefined
        }))
      );

      // Convert each combination
      for (const options of conversions) {
        await convertSvgToFormat(
          svgContent,
          `${iconName}-${options.size}px`,
          options
        );
      }

      toast.success(`Successfully converted to ${conversions.length} files!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert icon. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Convert {iconName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Output Formats</Label>
            <div className="grid grid-cols-2 gap-2">
              {presetFormats.map(format => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={selectedFormats.includes(format)}
                    onCheckedChange={(checked) => 
                      handleFormatChange(format, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`format-${format}`} 
                    className="text-sm font-mono uppercase"
                  >
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Sizes (pixels)</Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {presetSizes.map(size => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={(checked) => 
                      handleSizeChange(size, checked as boolean)
                    }
                  />
                  <Label htmlFor={`size-${size}`} className="text-xs">
                    {size}px
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Custom Size Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Custom size"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                type="number"
                min="1"
                max="2048"
                className="text-sm"
              />
              <Button 
                onClick={addCustomSize} 
                size="sm" 
                variant="outline"
                disabled={!customSize || parseInt(customSize) <= 0}
              >
                Add
              </Button>
            </div>
          </div>

          {/* JPG Background Color (shown only if JPG is selected) */}
          {(selectedFormats.includes('jpg') || selectedFormats.includes('jpeg')) && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                JPG Background Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {backgroundColor}
                </span>
              </div>
            </div>
          )}

          {/* Quality Slider (for JPG/WebP) */}
          {(selectedFormats.some(f => ['jpg', 'jpeg', 'webp'].includes(f))) && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Quality ({Math.round(quality * 100)}%)
              </Label>
              <Input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Convert Button */}
          <Button 
            onClick={handleConvert} 
            disabled={isConverting || selectedFormats.length === 0 || selectedSizes.length === 0}
            className="w-full"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Converting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Convert & Download ({selectedFormats.length * selectedSizes.length} files)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversionDialog;
