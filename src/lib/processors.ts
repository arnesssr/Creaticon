
import * as cheerio from 'cheerio';

export interface ExtractedIcon {
  id: string;
  name: string;
  svg: string;
  category: string;
  viewBox?: string;
  size: {
    width: number;
    height: number;
  };
}

export interface ProcessedCode {
  html: string;
  css: string;
  javascript: string;
  icons: ExtractedIcon[];
  preview: string;
}

export const processGeneratedHTML = (html: string): ProcessedCode => {
  const $ = cheerio.load(html);
  
  // Extract CSS
  const cssContent = $('style').map((_, el) => $(el).html()).get().join('\n');
  $('style').remove();
  
  // Extract JavaScript
  const jsContent = $('script').map((_, el) => $(el).html()).get().join('\n');
  $('script').remove();
  
  // Extract SVG icons
  const icons = extractSVGIcons(html);
  
  // Clean HTML (remove style and script tags for display)
  const cleanHTML = $.html();
  
  return {
    html: html, // Keep original for preview
    css: cssContent,
    javascript: jsContent,
    icons: icons,
    preview: html
  };
};

export const extractSVGIcons = (html: string): ExtractedIcon[] => {
  const $ = cheerio.load(html);
  const svgElements = $('svg');
  const icons: ExtractedIcon[] = [];
  
  svgElements.each((index, element) => {
    const $svg = $(element);
    const svgString = $.html($svg);
    
    if (svgString) {
      const viewBox = $svg.attr('viewBox') || '0 0 24 24';
      const [, , width, height] = viewBox.split(' ').map(Number);
      
      // Try to determine icon name from context
      const iconName = determineIconName($svg, index);
      const category = determineIconCategory($svg);
      
      icons.push({
        id: `icon-${index + 1}`,
        name: iconName,
        svg: svgString,
        category: category,
        viewBox: viewBox,
        size: {
          width: width || 24,
          height: height || 24
        }
      });
    }
  });
  
  return icons;
};

const determineIconName = ($svg: cheerio.Cheerio<any>, index: number): string => {
  // Try to find name from nearby text or attributes
  const nearbyText = $svg.parent().text().trim();
  const className = $svg.attr('class') || '';
  const dataName = $svg.attr('data-name');
  
  if (dataName) return dataName;
  if (nearbyText && nearbyText.length < 20) return nearbyText.toLowerCase().replace(/\s+/g, '-');
  if (className.includes('icon-')) return className.split('icon-')[1];
  
  // Default names based on common patterns
  const defaultNames = [
    'home', 'user', 'settings', 'search', 'menu', 'close', 'arrow', 'heart',
    'star', 'share', 'download', 'upload', 'edit', 'delete', 'add', 'check'
  ];
  
  return defaultNames[index % defaultNames.length] || `icon-${index + 1}`;
};

const determineIconCategory = ($svg: cheerio.Cheerio<any>): string => {
  const context = $svg.closest('nav, header, footer, .navigation, .menu').length > 0 ? 'navigation' :
                 $svg.closest('form, .form, .input').length > 0 ? 'form' :
                 $svg.closest('.social, .contact').length > 0 ? 'social' :
                 $svg.closest('button, .button').length > 0 ? 'action' : 'general';
  
  return context;
};

export const formatCode = (code: string, language: 'html' | 'css' | 'javascript'): string => {
  // Basic code formatting - in a real app you'd use prettier
  switch (language) {
    case 'html':
      return code.replace(/></g, '>\n<').replace(/^\s+|\s+$/g, '');
    case 'css':
      return code.replace(/}/g, '}\n').replace(/{/g, ' {\n  ').replace(/;/g, ';\n  ');
    case 'javascript':
      return code.replace(/}/g, '}\n').replace(/{/g, ' {\n  ');
    default:
      return code;
  }
};
