import { useState } from 'react'
import { Check, ChevronDown, Search, FileStack, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { ScrollArea } from '../ui/scroll-area'
import { useGetContexts } from '../../hooks/contexts/useGetContexts'
import { Context } from '../../types/context'
import { CONTEXT_CATEGORIES } from '../../types/context'

interface ContextSelectorProps {
  selectedContextIds: string[]
  onContextsSelect: (contextIds: string[]) => void
  multiple?: boolean
  placeholder?: string
  allowClear?: boolean
}

export default function ContextSelector({
  selectedContextIds,
  onContextsSelect,
  multiple = true,
  placeholder = "Select contexts...",
  allowClear = true
}: ContextSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { data: contexts = [], isLoading } = useGetContexts()

  const selectedContexts = contexts.filter(c => selectedContextIds.includes(c.id))

  const filteredContexts = contexts.filter(context => {
    const searchTerm = searchValue.toLowerCase()
    return (
      context.title.toLowerCase().includes(searchTerm) ||
      context.description?.toLowerCase().includes(searchTerm) ||
      context.category.toLowerCase().includes(searchTerm) ||
      context.content.toLowerCase().includes(searchTerm)
    )
  })

  const handleSelect = (context: Context) => {
    if (multiple) {
      const isSelected = selectedContextIds.includes(context.id)
      if (isSelected) {
        onContextsSelect(selectedContextIds.filter(id => id !== context.id))
      } else {
        onContextsSelect([...selectedContextIds, context.id])
      }
    } else {
      onContextsSelect([context.id])
      setOpen(false)
    }
    setSearchValue('')
  }

  const handleRemoveContext = (contextId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextsSelect(selectedContextIds.filter(id => id !== contextId))
  }

  const handleClear = () => {
    onContextsSelect([])
    setOpen(false)
  }

  const getCategoryLabel = (category: string) => {
    return CONTEXT_CATEGORIES.find(c => c.value === category)?.label || category
  }

  return (
    <div className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedContexts.length > 0 ? (
              <div className="flex items-center gap-2 min-w-0">
                <FileStack className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {selectedContexts.length} context{selectedContexts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {isLoading ? 'Loading contexts...' : placeholder}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[500px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search contexts..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <ScrollArea className="max-h-[400px]">
              <CommandEmpty>No contexts found.</CommandEmpty>
              {allowClear && selectedContextIds.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    value="clear"
                    onSelect={handleClear}
                    className="text-muted-foreground"
                  >
                    Clear all selections
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {filteredContexts.map((context) => (
                  <CommandItem
                    key={context.id}
                    value={context.id}
                    onSelect={() => handleSelect(context)}
                    className="flex items-center gap-2 p-3"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileStack className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {context.title}
                        </div>
                        {context.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {context.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {getCategoryLabel(context.category)}
                        </div>
                      </div>
                    </div>
                    <Check
                      className={`h-4 w-4 ${
                        selectedContextIds.includes(context.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedContexts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedContexts.map((context) => (
            <Badge
              key={context.id}
              variant="secondary"
              className="flex items-center gap-1 max-w-[200px]"
            >
              <span className="truncate">{context.title}</span>
              <button
                onClick={(e) => handleRemoveContext(context.id, e)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                title="Remove context"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}