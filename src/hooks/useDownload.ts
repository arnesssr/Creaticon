
import { useState } from 'react';
import { toast } from 'sonner';

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSingleFile = async (filename: string, content: string, mimeType: string) => {
    try {
      setIsDownloading(true);
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadZip = async (data: any) => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'zip',
          data: data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ZIP file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = 'ui-project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Downloaded project ZIP file');
      
    } catch (error) {
      console.error('ZIP download error:', error);
      toast.error('Failed to download ZIP file');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadSingleFile,
    downloadZip,
    isDownloading
  };
};
