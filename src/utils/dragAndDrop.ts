// Utility functions for drag-and-drop functionality

export const reorderArray = <T>(array: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const moveArrayItem = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  if (fromIndex === toIndex) return array;
  
  const newArray = [...array];
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  
  return newArray;
};

export const insertAtPosition = <T>(
  array: T[],
  item: T,
  position: number
): T[] => {
  const newArray = [...array];
  newArray.splice(position, 0, item);
  return newArray;
};

export const removeFromPosition = <T>(
  array: T[],
  position: number
): T[] => {
  const newArray = [...array];
  newArray.splice(position, 1);
  return newArray;
};