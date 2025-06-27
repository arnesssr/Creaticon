
import * as cheerio from 'cheerio';
import DOMPurify from 'dompurify';
import { ExtractedIcon, ProcessedCode } from '@/types';

// Process HTML specifically for icon extraction
export const processIconHTML = (html: string): ProcessedCode => {
  const $ = cheerio.load(html);
  
  // Extract CSS for icons
  const cssContent = $('style').map((_, el) => $(el).html()).get().join('\n');
  
  // Extract SVG icons
  const icons = extractSVGIcons(html);
  
  return {
    html: html, // Keep original for preview
    css: cssContent,
    javascript: '', // Icons typically don't need JavaScript
    svgIcons: icons,
    icons: icons, // For backward compatibility
    preview: html
  };
};

// Legacy function name for backward compatibility
export const processGeneratedHTML = processIconHTML;

// SVG extraction logic according to plan specifications
export const extractSVGIcons = (html: string): ExtractedIcon[] => {
  const $ = cheerio.load(html);
  const svgElements = $('svg');
  
  return svgElements.map((index, element) => {
    const $svg = $(element);
    const svgString = $.html($svg);
    
    return {
      id: `icon-${index}`,
      name: $svg.attr('data-name') || `icon-${index}`,
      svg: svgString,
      usage: $svg.closest('[class]').attr('class') || 'general',
      size: calculateSVGSize(svgString)
    };
  }).get();
};

// Calculate SVG size according to plan
const calculateSVGSize = (svgString: string): number => {
  const sizeMatch = svgString.match(/viewBox=["']([^"']+)["']/);
  if (sizeMatch) {
    const viewBox = sizeMatch[1].split(' ');
    const width = parseInt(viewBox[2]) || 24;
    const height = parseInt(viewBox[3]) || 24;
    return Math.max(width, height);
  }
  return 24;
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
