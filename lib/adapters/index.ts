/**
 * Arquitetura Agnóstica de Fornecedores de IA e Imagens.
 * Define os contratos que permitirão plugar qualquer provedor sem alterar o núcleo da Central.
 */

export interface TextGenerationRequest {
  topic: string;
  keywords: string[];
  targetAudience?: string;
  wordCountTarget?: number;
  systemPrompt?: string;
}

export interface TextGenerationResult {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  contentHtml: string;
  tokensInput: number;
  tokensOutput: number;
  modelUsed: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio: "16:9" | "1:1" | "4:3";
  style?: "editorial" | "realistic" | "vector";
  textOverlay?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  altText: string;
  provider: string;
}

export interface TextProviderAdapter {
  id: string;
  name: string;
  generateArticle(request: TextGenerationRequest): Promise<TextGenerationResult>;
}

export interface ImageProviderAdapter {
  id: string;
  name: string;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}

// Registro desacoplado de Adaptadores (Plug and Play)
export class AIProviderRegistry {
  private static textProviders: Map<string, TextProviderAdapter> = new Map();
  private static imageProviders: Map<string, ImageProviderAdapter> = new Map();

  static registerTextProvider(provider: TextProviderAdapter) {
    this.textProviders.set(provider.id, provider);
  }

  static getTextProvider(id: string): TextProviderAdapter | undefined {
    return this.textProviders.get(id);
  }

  static registerImageProvider(provider: ImageProviderAdapter) {
    this.imageProviders.set(provider.id, provider);
  }

  static getImageProvider(id: string): ImageProviderAdapter | undefined {
    return this.imageProviders.get(id);
  }

  static listAvailableProviders() {
    return {
      text: Array.from(this.textProviders.values()).map((p) => ({ id: p.id, name: p.name })),
      image: Array.from(this.imageProviders.values()).map((p) => ({ id: p.id, name: p.name })),
    };
  }
}
