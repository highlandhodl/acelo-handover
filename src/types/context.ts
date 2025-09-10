// Main data model for contexts
export interface Context {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: ContextCategory;
  content: string;
  created_at: string;
  updated_at: string;
}

// Context categories enum
export type ContextCategory = 
  | 'client_profiles'
  | 'product_service_info'
  | 'competitor_analysis'
  | 'industry_knowledge'
  | 'brand_voice_guidelines'
  | 'technical_documentation'
  | 'creative_frameworks'
  | 'communication_templates'
  | 'process_documentation'
  | 'market_research';

// Data required for forms (Create/Update)
export interface ContextFormData {
  title: string;
  description?: string;
  category: ContextCategory;
  content: string;
}

// Category display information
export interface ContextCategoryInfo {
  value: ContextCategory;
  label: string;
  description: string;
}

// Category information constants
export const CONTEXT_CATEGORIES: ContextCategoryInfo[] = [
  {
    value: 'client_profiles',
    label: 'Client/Customer Profiles',
    description: 'Customer segments and personas'
  },
  {
    value: 'product_service_info',
    label: 'Product/Service Info',
    description: 'Detailed product descriptions'
  },
  {
    value: 'competitor_analysis',
    label: 'Competitor Analysis',
    description: 'Market positioning information'
  },
  {
    value: 'industry_knowledge',
    label: 'Industry Knowledge',
    description: 'Sector-specific information'
  },
  {
    value: 'brand_voice_guidelines',
    label: 'Brand Voice & Guidelines',
    description: 'Communication styles'
  },
  {
    value: 'technical_documentation',
    label: 'Technical Documentation',
    description: 'Specifications and constraints'
  },
  {
    value: 'creative_frameworks',
    label: 'Creative Frameworks',
    description: 'Writing guides and structures'
  },
  {
    value: 'communication_templates',
    label: 'Communication Templates',
    description: 'Email and meeting formats'
  },
  {
    value: 'process_documentation',
    label: 'Process Documentation',
    description: 'Workflows and procedures'
  },
  {
    value: 'market_research',
    label: 'Market Research',
    description: 'Industry insights and data'
  }
];