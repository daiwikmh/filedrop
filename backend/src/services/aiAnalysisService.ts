import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';


import dotenv from 'dotenv';

dotenv.config();


interface ImageAnalysisResult {
  description: string;
  tags: string[];
  category: string;
  safetyRating: 'safe' | 'questionable' | 'unsafe';
  confidence: number;
}

class AIAnalysisService {
  private model: ChatOpenAI | null = null;
  private initialized: boolean = false;

  constructor() {
    // Initialize on first use
  }

  private initModel() {
    if (this.initialized) return;



    // Initialize ChatOpenAI with OpenRouter configuration
    this.model = new ChatOpenAI({
      model: 'baidu/ernie-4.5-vl-28b-a3b',
      apiKey: process.env.OPENROUTER_API_KEY,
      temperature: 0.7,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://filedrop-l3vl.onrender.com',
          'X-Title': 'FileDrop AI Analysis',
        },
      },
    });

    this.initialized = true;
    console.log('✅ AI Analysis service initialized (Gemini 2.0 Flash via OpenRouter)');
  }

  /**
   * Analyze an image using Gemini 2.0 Flash via OpenRouter
   * @param imageBuffer - The image file buffer
   * @param mimeType - MIME type of the image
   * @param fileName - Original filename
   * @returns Analysis result with description, tags, and metadata
   */
  async analyzeImage(
    imageBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<ImageAnalysisResult> {
    // Initialize model on first use
    if (!this.initialized) {
      this.initModel();
    }

    // Skip if model not initialized (API key missing)
    if (!this.model) {
      console.log('⏭️  AI analysis skipped (no API key)');
      return this.getFallbackAnalysis(fileName, mimeType);
    }

    try {
      console.log(`🤖 Analyzing image: ${fileName} (${mimeType})`);

      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      // Create message with image
      const message = new HumanMessage({
        content: [
          {
            type: 'text',
            text: `Analyze this image and provide:
1. A detailed description (2-3 sentences)
2. Relevant tags/keywords (5-10 tags)
3. Category (e.g., nature, portrait, food, document, screenshot, etc.)
4. Safety rating (safe/questionable/unsafe)
5. Confidence level (0-100)

Format your response as JSON:
{
  "description": "...",
  "tags": ["tag1", "tag2", ...],
  "category": "...",
  "safetyRating": "safe",
  "confidence": 95
}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      });

      // Get analysis from Gemini
      const response = await this.model.invoke([message]);
      const content = response.content as string;

      // Parse JSON response
      const analysis = this.parseAnalysisResponse(content);

      console.log(`✅ Image analysis complete: ${analysis.category} (${analysis.confidence}% confidence)`);

      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      return this.getFallbackAnalysis(fileName, mimeType);
    }
  }

  /**
   * Parse the AI response and extract structured data
   */
  private parseAnalysisResponse(content: string): ImageAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          description: parsed.description || 'Image uploaded via Telegram',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          category: parsed.category || 'general',
          safetyRating: parsed.safetyRating || 'safe',
          confidence: parsed.confidence || 50,
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback if parsing fails
    return {
      description: content.substring(0, 200) || 'Image uploaded via Telegram',
      tags: [],
      category: 'general',
      safetyRating: 'safe',
      confidence: 50,
    };
  }

  /**
   * Fallback analysis when AI is not available
   */
  private getFallbackAnalysis(fileName: string, mimeType: string): ImageAnalysisResult {
    return {
      description: `Image file: ${fileName}`,
      tags: [mimeType.split('/')[1] || 'image'],
      category: 'uncategorized',
      safetyRating: 'safe',
      confidence: 0,
    };
  }

  /**
   * Check if file type is supported for AI analysis
   */
  isImageSupported(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    return supportedTypes.includes(mimeType.toLowerCase());
  }
}

export default new AIAnalysisService();
