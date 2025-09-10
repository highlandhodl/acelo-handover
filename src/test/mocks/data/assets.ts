import type { MockDataFactory } from '../../types/testing'
import type { AssetFile, AssetFormData } from '../../../types/asset'

const createMockAsset: MockDataFactory<AssetFile>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'test-asset.pdf',
  created_at: new Date().toISOString(),
  metadata: {
    size: 1024,
    type: 'application/pdf',
    uploaded_by: 'test-user-id',
  },
  ...overrides,
})

const createManyMockAssets: MockDataFactory<AssetFile>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockAsset({
      name: `test-asset-${index + 1}.pdf`,
      ...overrides,
    })
  )
}

const createMockAssetFormData: MockDataFactory<AssetFormData>['create'] = (overrides = {}) => ({
  name: 'Test Asset',
  description: 'Test asset description',
  file: new File(['test content'], 'test-asset.pdf', { type: 'application/pdf' }),
  ...overrides,
})

const createManyMockAssetFormData: MockDataFactory<AssetFormData>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockAssetFormData({
      name: `Test Asset ${index + 1}`,
      description: `Test asset description ${index + 1}`,
      file: new File(['test content'], `test-asset-${index + 1}.pdf`, { type: 'application/pdf' }),
      ...overrides,
    })
  )
}

export const mockAssets: MockDataFactory<AssetFile> = {
  create: createMockAsset,
  createMany: createManyMockAssets,
}

export const mockAssetFormData: MockDataFactory<AssetFormData> = {
  create: createMockAssetFormData,
  createMany: createManyMockAssetFormData,
}

// Common asset test scenarios
export const assetTestScenarios = {
  pdf: () => createMockAsset({
    name: 'document.pdf',
    metadata: { size: 2048, type: 'application/pdf' }
  }),
  image: () => createMockAsset({
    name: 'image.png',
    metadata: { size: 512, type: 'image/png', width: 1920, height: 1080 }
  }),
  video: () => createMockAsset({
    name: 'video.mp4',
    metadata: { size: 10240, type: 'video/mp4', duration: 120 }
  }),
  largeFile: () => createMockAsset({
    name: 'large-file.zip',
    metadata: { size: 104857600, type: 'application/zip' } // 100MB
  }),
}