import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/auth/useAuth';

const promptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  prompt_content: z.string().min(10, 'Prompt content must be at least 10 characters'),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface Prompt {
  id: string;
  title: string;
  description: string;
  purpose: string;
  prompt_content: string;
}

interface PromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPrompt?: Prompt | null;
}

export default function PromptForm({ isOpen, onClose, onSuccess, editingPrompt }: PromptFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: editingPrompt?.title || '',
      description: editingPrompt?.description || '',
      purpose: editingPrompt?.purpose || '',
      prompt_content: editingPrompt?.prompt_content || '',
    },
  });

  React.useEffect(() => {
    if (editingPrompt) {
      form.reset({
        title: editingPrompt.title,
        description: editingPrompt.description,
        purpose: editingPrompt.purpose,
        prompt_content: editingPrompt.prompt_content,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        purpose: '',
        prompt_content: '',
      });
    }
  }, [editingPrompt, form]);

  const onSubmit = async (data: PromptFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create prompts',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingPrompt) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            title: data.title,
            description: data.description || null,
            purpose: data.purpose,
            prompt_content: data.prompt_content,
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Prompt updated successfully',
        });
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            title: data.title,
            description: data.description || null,
            purpose: data.purpose,
            prompt_content: data.prompt_content,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Prompt created successfully',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogDescription>
            {editingPrompt 
              ? 'Make changes to your prompt below.'
              : 'Create a new prompt that you can reuse and share.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of what this prompt does..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose & Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain the purpose of this prompt and how to use it effectively. This will be shown to users before they use the prompt. You can use Markdown formatting."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your prompt template here. User context will be appended to the end of this prompt."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting 
                  ? (editingPrompt ? 'Updating...' : 'Creating...') 
                  : (editingPrompt ? 'Update Prompt' : 'Create Prompt')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}