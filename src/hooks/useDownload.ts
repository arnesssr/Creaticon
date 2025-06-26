
import { useState } from 'react';
import { toast } from 'sonner';
import { createZipDownload, downloadFile } from '@/api/download';

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadSingleFile = async (filename: string, content: string, mimeType: string) => {
    try {
      setIsDownloading(true);
      downloadFile(content, filename, mimeType);
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
      
      const zipBlob = await createZipDownload(data);
      downloadFile(await zipBlob.text(), 'ui-project.zip', 'application/zip');
      
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
