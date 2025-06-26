
import JSZip from 'jszip';

export interface DownloadData {
  html: string;
  css: string;
  javascript: string;
  icons: Array<{
    name: string;
    svg: string;
  }>;
}

export const createZipDownload = async (data: DownloadData): Promise<Blob> => {
  const zip = new JSZip();
  
  // Add main files
  if (data.html) zip.file('index.html', data.html);
  if (data.css) zip.file('styles.css', data.css);
  if (data.javascript) zip.file('script.js', data.javascript);
  
  // Add icons folder
  if (data.icons && data.icons.length > 0) {
    const iconsFolder = zip.folder('icons');
    data.icons.forEach((icon: any) => {
      iconsFolder?.file(`${icon.name}.svg`, icon.svg);
    });
  }
  
  // Add README
  const readme = `# Generated UI Project

This project was generated using the AI UI Generator.

## Files included:
- index.html - Main HTML file
${data.css ? '- styles.css - CSS styles' : ''}
${data.javascript ? '- script.js - JavaScript functionality' : ''}
${data.icons?.length ? `- icons/ - ${data.icons.length} custom SVG icons` : ''}

## Usage:
1. Open index.html in your browser
2. Customize the CSS and JavaScript as needed
3. Use the SVG icons in your projects

Generated on: ${new Date().toISOString()}
`;
  
  zip.file('README.md', readme);
  
  const zipContent = await zip.generateAsync({ type: 'blob' });
  return zipContent;
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
