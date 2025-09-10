import { describe, it, expect } from 'vitest';
import { 
  reorderArray,
  moveArrayItem,
  insertAtPosition,
  removeFromPosition
} from './dragAndDrop';

describe('dragAndDrop utilities', () => {
  describe('reorderArray', () => {
    it('should reorder array elements correctly', () => {
      const array = ['a', 'b', 'c', 'd'];
      const result = reorderArray(array, 1, 3);
      
      expect(result).toEqual(['a', 'c', 'd', 'b']);
    });

    it('should handle reordering from end to beginning', () => {
      const array = [1, 2, 3, 4];
      const result = reorderArray(array, 3, 0);
      
      expect(result).toEqual([4, 1, 2, 3]);
    });

    it('should not mutate original array', () => {
      const array = ['a', 'b', 'c'];
      const result = reorderArray(array, 0, 2);
      
      expect(array).toEqual(['a', 'b', 'c']);
      expect(result).toEqual(['b', 'c', 'a']);
    });
  });

  describe('moveArrayItem', () => {
    it('should move item from one position to another', () => {
      const array = ['item1', 'item2', 'item3', 'item4'];
      const result = moveArrayItem(array, 0, 2);
      
      expect(result).toEqual(['item2', 'item3', 'item1', 'item4']);
    });

    it('should return same array if moving to same position', () => {
      const array = [1, 2, 3];
      const result = moveArrayItem(array, 1, 1);
      
      expect(result).toEqual([1, 2, 3]);
      expect(result).toBe(array);
    });

    it('should handle moving item backwards', () => {
      const array = ['a', 'b', 'c', 'd'];
      const result = moveArrayItem(array, 3, 1);
      
      expect(result).toEqual(['a', 'd', 'b', 'c']);
    });

    it('should not mutate original array', () => {
      const array = [1, 2, 3];
      const result = moveArrayItem(array, 0, 2);
      
      expect(array).toEqual([1, 2, 3]);
      expect(result).not.toBe(array);
    });
  });

  describe('insertAtPosition', () => {
    it('should insert item at specified position', () => {
      const array = ['a', 'b', 'd'];
      const result = insertAtPosition(array, 'c', 2);
      
      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should insert at beginning', () => {
      const array = [2, 3, 4];
      const result = insertAtPosition(array, 1, 0);
      
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should insert at end', () => {
      const array = [1, 2, 3];
      const result = insertAtPosition(array, 4, 3);
      
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should not mutate original array', () => {
      const array = ['a', 'b'];
      const result = insertAtPosition(array, 'c', 1);
      
      expect(array).toEqual(['a', 'b']);
      expect(result).toEqual(['a', 'c', 'b']);
    });
  });

  describe('removeFromPosition', () => {
    it('should remove item from specified position', () => {
      const array = ['a', 'b', 'c', 'd'];
      const result = removeFromPosition(array, 2);
      
      expect(result).toEqual(['a', 'b', 'd']);
    });

    it('should remove from beginning', () => {
      const array = [1, 2, 3];
      const result = removeFromPosition(array, 0);
      
      expect(result).toEqual([2, 3]);
    });

    it('should remove from end', () => {
      const array = [1, 2, 3];
      const result = removeFromPosition(array, 2);
      
      expect(result).toEqual([1, 2]);
    });

    it('should not mutate original array', () => {
      const array = ['a', 'b', 'c'];
      const result = removeFromPosition(array, 1);
      
      expect(array).toEqual(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'c']);
    });

    it('should handle out of bounds position gracefully', () => {
      const array = [1, 2, 3];
      const result = removeFromPosition(array, 10);
      
      expect(result).toEqual([1, 2, 3]);
    });
  });
});