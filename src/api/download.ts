
import { NextApiRequest, NextApiResponse } from 'next';
import JSZip from 'jszip';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    if (type === 'single-file') {
      const { filename, content, mimeType } = data;
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(content);
    }

    if (type === 'zip') {
      const { html, css, javascript, icons } = data;
      
      const zip = new JSZip();
      
      // Add main files
      if (html) zip.file('index.html', html);
      if (css) zip.file('styles.css', css);
      if (javascript) zip.file('script.js', javascript);
      
      // Add icons folder
      if (icons && icons.length > 0) {
        const iconsFolder = zip.folder('icons');
        icons.forEach((icon: any) => {
          iconsFolder?.file(`${icon.name}.svg`, icon.svg);
        });
      }
      
      // Add README
      const readme = `# Generated UI Project

This project was generated using the AI UI Generator.

## Files included:
- index.html - Main HTML file
${css ? '- styles.css - CSS styles' : ''}
${javascript ? '- script.js - JavaScript functionality' : ''}
${icons?.length ? `- icons/ - ${icons.length} custom SVG icons` : ''}

## Usage:
1. Open index.html in your browser
2. Customize the CSS and JavaScript as needed
3. Use the SVG icons in your projects

Generated on: ${new Date().toISOString()}
`;
      
      zip.file('README.md', readme);
      
      const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="ui-project.zip"');
      return res.send(zipContent);
    }

    return res.status(400).json({ error: 'Invalid download type' });

  } catch (error) {
    console.error('Download API Error:', error);
    return res.status(500).json({ error: 'Failed to create download' });
  }
}
