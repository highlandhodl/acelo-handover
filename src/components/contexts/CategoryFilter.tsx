import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ContextCategory } from '../../types/context';
import { CONTEXT_CATEGORIES } from '../../types/context';

interface CategoryFilterProps {
  value: ContextCategory | 'all';
  onValueChange: (value: ContextCategory | 'all') => void;
}

export default function CategoryFilter({ value, onValueChange }: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {CONTEXT_CATEGORIES.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}