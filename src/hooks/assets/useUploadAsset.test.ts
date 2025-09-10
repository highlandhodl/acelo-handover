import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUploadAsset } from './useUploadAsset'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'
import { mockAssetFormData, createSuccessResponse, createErrorResponse } from '../../test/mocks/data'
import { supabase } from '../../lib/supabaseClient'

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

const mockUseAuth = vi.fn()

describe('useUploadAsset', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  }

  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should upload asset successfully', async () => {
    const mockFormData = mockAssetFormData.create()
    const mockUploadResponse = {
      path: `${mockUser.id}/${mockFormData.file!.name}`,
      id: 'upload-id',
      fullPath: `user-assets/${mockUser.id}/${mockFormData.file!.name}`,
    }

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createSuccessResponse(mockUploadResponse))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.status).toBe('idle')

    result.current.mutate(mockFormData)

    // The mutation should be either pending or success depending on timing
    expect(['idle', 'pending', 'success']).toContain(result.current.status)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUploadResponse)
    expect(mockUpload).toHaveBeenCalledWith(
      `${mockUser.id}/${mockFormData.file!.name}`,
      mockFormData.file
    )
    expect(supabase.storage.from).toHaveBeenCalledWith('user-assets')
  })

  it('should handle upload errors gracefully', async () => {
    const mockFormData = mockAssetFormData.create()
    const mockError = new Error('Upload failed')

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createErrorResponse(mockError.message))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    result.current.mutate(mockFormData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should throw error when user is not authenticated', async () => {
    const mockFormData = mockAssetFormData.create()

    mockUseAuth.mockReturnValue({ user: null })

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    result.current.mutate(mockFormData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('No user ID'))
  })

  it('should throw error when no file is provided', async () => {
    const mockFormData = mockAssetFormData.create({ file: undefined })

    mockUseAuth.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    result.current.mutate(mockFormData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('No file provided'))
  })

  it('should invalidate assets queries on success', async () => {
    const mockFormData = mockAssetFormData.create()
    const mockUploadResponse = { path: 'test-path' }

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createSuccessResponse(mockUploadResponse))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    // Spy on queryClient invalidation
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    result.current.mutate(mockFormData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['assets', mockUser.id] })
  })

  it('should create correct file path', async () => {
    const mockFormData = mockAssetFormData.create({
      file: new File(['content'], 'test-document.pdf', { type: 'application/pdf' })
    })

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createSuccessResponse({}))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    result.current.mutate(mockFormData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockUpload).toHaveBeenCalledWith(
      `${mockUser.id}/test-document.pdf`,
      mockFormData.file
    )
  })

  it('should handle different file types', async () => {
    const testFiles = [
      new File(['image content'], 'image.png', { type: 'image/png' }),
      new File(['video content'], 'video.mp4', { type: 'video/mp4' }),
      new File(['text content'], 'document.txt', { type: 'text/plain' }),
    ]

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createSuccessResponse({}))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    for (const file of testFiles) {
      const mockFormData = mockAssetFormData.create({ file })
      
      const { result } = renderHook(() => useUploadAsset(), {
        wrapper: createQueryWrapper(queryClient),
      })

      result.current.mutate(mockFormData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockUpload).toHaveBeenCalledWith(
        `${mockUser.id}/${file.name}`,
        file
      )
    }
  })

  it('should reset mutation state between uploads', async () => {
    const mockFormData1 = mockAssetFormData.create()
    const mockFormData2 = mockAssetFormData.create({
      file: new File(['content 2'], 'file2.txt', { type: 'text/plain' })
    })

    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockUpload = vi.fn().mockResolvedValue(createSuccessResponse({}))
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as ReturnType<typeof supabase.storage.from>)

    const { result } = renderHook(() => useUploadAsset(), {
      wrapper: createQueryWrapper(queryClient),
    })

    // First upload
    result.current.mutate(mockFormData1)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Reset and second upload
    result.current.reset()
    
    // After reset, status should eventually become idle (but might take time)
    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })

    result.current.mutate(mockFormData2)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockUpload).toHaveBeenCalledTimes(2)
  })
})