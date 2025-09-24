import { useState } from 'react'
import { Check, ChevronDown, Search, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { ScrollArea } from '../ui/scroll-area'
import { useGetPrompts } from '../../hooks/prompts/useGetPrompts'
import { Prompt } from '../../types/prompt'

interface PromptSelectorProps {
  selectedPromptId?: string
  onPromptSelect: (promptId?: string) => void
  placeholder?: string
  allowClear?: boolean
}

export default function PromptSelector({
  selectedPromptId,
  onPromptSelect,
  placeholder = "Select a prompt...",
  allowClear = true
}: PromptSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { data: prompts = [], isLoading } = useGetPrompts()

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId)

  const filteredPrompts = prompts.filter(prompt => {
    const searchTerm = searchValue.toLowerCase()
    return (
      prompt.name?.toLowerCase().includes(searchTerm) ||
      prompt.title?.toLowerCase().includes(searchTerm) ||
      prompt.description?.toLowerCase().includes(searchTerm) ||
      prompt.category?.toLowerCase().includes(searchTerm)
    )
  })

  const handleSelect = (prompt: Prompt) => {
    onPromptSelect(prompt.id)
    setOpen(false)
    setSearchValue('')
  }

  const handleClear = () => {
    onPromptSelect(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedPrompt ? (
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {selectedPrompt.name || selectedPrompt.title || 'Unnamed Prompt'}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {isLoading ? 'Loading prompts...' : placeholder}
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[400px] max-h-[80vh] overflow-auto p-0" align="start" side="bottom">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search prompts..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div
            className="max-h-[60vh] overflow-auto overscroll-contain"
            onWheel={(e) => {
              e.stopPropagation()
            }}
          >
            <CommandEmpty>No prompts found.</CommandEmpty>
            {allowClear && selectedPromptId && (
              <CommandGroup>
                <CommandItem
                  value="clear"
                  onSelect={handleClear}
                  className="text-muted-foreground"
                >
                  Clear selection
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {filteredPrompts.map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  value={prompt.id}
                  onSelect={() => handleSelect(prompt)}
                  className="flex items-center gap-2 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {prompt.name || prompt.title || 'Unnamed Prompt'}
                      </div>
                      {prompt.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {prompt.description}
                        </div>
                      )}
                      {prompt.category && (
                        <div className="text-xs text-muted-foreground">
                          Category: {prompt.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <Check
                    className={`h-4 w-4 ${
                      selectedPromptId === prompt.id ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}