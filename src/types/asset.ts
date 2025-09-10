export interface AssetFile {
  name: string
  id: string
  created_at: string
  metadata: Record<string, string | number | boolean>
}

export interface AssetFormData {
  name: string
  description?: string
  file?: File
}