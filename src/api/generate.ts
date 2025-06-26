
import { NextApiRequest, NextApiResponse } from 'next';
import { generateUIWithGemini, GenerationRequest } from '@/lib/gemini';
import { processGeneratedHTML } from '@/lib/processors';

export interface GenerateResponse {
  success: boolean;
  data?: {
    html: string;
    css: string;
    javascript: string;
    icons: any[];
    preview: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const input: GenerationRequest = req.body;

    // Validate input
    if (!input.projectDescription || input.projectDescription.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project description must be at least 10 characters long' 
      });
    }

    // Generate UI with Gemini
    console.log('Generating UI for:', input.projectDescription);
    const geminiResponse = await generateUIWithGemini(input);

    if (!geminiResponse.success) {
      return res.status(500).json({ 
        success: false, 
        error: geminiResponse.error || 'Failed to generate UI' 
      });
    }

    // Process the generated HTML
    const processedCode = processGeneratedHTML(geminiResponse.html);

    return res.status(200).json({
      success: true,
      data: {
        html: processedCode.html,
        css: processedCode.css,
        javascript: processedCode.javascript,
        icons: processedCode.icons,
        preview: processedCode.preview
      }
    });

  } catch (error) {
    console.error('Generation API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during generation' 
    });
  }
}
