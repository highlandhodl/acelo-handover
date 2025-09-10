import { bench, describe } from 'vitest'
import { mockAssets, mockPrompts, mockCoaches, mockAutomations } from '../mocks/data'

describe('Mock Data Factory Performance Tests', () => {
  bench('create single asset', () => {
    mockAssets.create()
  })

  bench('create single asset with overrides', () => {
    mockAssets.create({
      name: 'Performance Test Asset',
      description: 'Testing asset creation performance',
      file_size: 2048,
    })
  })

  bench('create many assets (10)', () => {
    mockAssets.createMany(10)
  })

  bench('create many assets (100)', () => {
    mockAssets.createMany(100)
  })

  bench('create single prompt', () => {
    mockPrompts.create()
  })

  bench('create many prompts (50)', () => {
    mockPrompts.createMany(50)
  })

  bench('create single coach', () => {
    mockCoaches.create()
  })

  bench('create many coaches (25)', () => {
    mockCoaches.createMany(25)
  })

  bench('create single automation', () => {
    mockAutomations.create()
  })

  bench('create many automations (30)', () => {
    mockAutomations.createMany(30)
  })

  bench('create mixed data sets', () => {
    // Simulate creating data for a full test scenario
    const assets = mockAssets.createMany(10)
    const prompts = mockPrompts.createMany(5)
    const coaches = mockCoaches.createMany(3)
    const automations = mockAutomations.createMany(7)
    
    return {
      assets: assets.length,
      prompts: prompts.length,
      coaches: coaches.length,
      automations: automations.length,
    }
  })

  bench('create large dataset (stress test)', () => {
    // Stress test with larger datasets
    const assets = mockAssets.createMany(500)
    const prompts = mockPrompts.createMany(200)
    const coaches = mockCoaches.createMany(100)
    const automations = mockAutomations.createMany(150)
    
    return {
      total: assets.length + prompts.length + coaches.length + automations.length
    }
  })
})