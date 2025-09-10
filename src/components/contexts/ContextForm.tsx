import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { useCreateContext } from '../../hooks/contexts/useCreateContext';
import { useUpdateContext } from '../../hooks/contexts/useUpdateContext';
import type { Context, ContextFormData } from '../../types/context';
import { CONTEXT_CATEGORIES } from '../../types/context';

const contextSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.enum([
    'client_profiles',
    'product_service_info',
    'competitor_analysis',
    'industry_knowledge',
    'brand_voice_guidelines',
    'technical_documentation',
    'creative_frameworks',
    'communication_templates',
    'process_documentation',
    'market_research'
  ], {
    required_error: 'Please select a category',
  }),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type FormData = z.infer<typeof contextSchema>;

interface ContextFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingContext?: Context | null;
}

export default function ContextForm({ isOpen, onClose, editingContext }: ContextFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('edit');
  
  const createContextMutation = useCreateContext();
  const updateContextMutation = useUpdateContext();

  const form = useForm<FormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      title: editingContext?.title || '',
      description: editingContext?.description || '',
      category: editingContext?.category || undefined,
      content: editingContext?.content || '',
    },
  });

  React.useEffect(() => {
    if (editingContext) {
      form.reset({
        title: editingContext.title,
        description: editingContext.description || '',
        category: editingContext.category,
        content: editingContext.content,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        category: undefined,
        content: '',
      });
    }
  }, [editingContext, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const contextData: ContextFormData = {
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        content: data.content,
      };

      if (editingContext) {
        await updateContextMutation.mutateAsync({
          id: editingContext.id,
          data: contextData,
        });
        toast({
          title: 'Success',
          description: 'Context updated successfully',
        });
      } else {
        await createContextMutation.mutateAsync(contextData);
        toast({
          title: 'Success',
          description: 'Context created successfully',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving context:', error);
      toast({
        title: 'Error',
        description: 'Failed to save context',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createContextMutation.isPending || updateContextMutation.isPending;
  const contentValue = form.watch('content');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingContext ? 'Edit Context' : 'Create New Context'}
          </DialogTitle>
          <DialogDescription>
            {editingContext 
              ? 'Make changes to your context document below.'
              : 'Create a new context document that you can reuse in your prompts.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter context title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTEXT_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div>
                              <div className="font-medium">{category.label}</div>
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this context..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Editor with Markdown Preview */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="edit" className="mt-4">
                        <Textarea 
                          placeholder="Enter your context content here. You can use Markdown formatting."
                          rows={12}
                          className="font-mono text-sm"
                          {...field}
                        />
                      </TabsContent>
                      
                      <TabsContent value="preview" className="mt-4">
                        <Card>
                          <CardContent className="p-4">
                            {contentValue ? (
                              <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                                  {contentValue}
                                </pre>
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">
                                Nothing to preview yet. Add some content in the Edit tab.
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (editingContext ? 'Updating...' : 'Creating...') 
                  : (editingContext ? 'Update Context' : 'Create Context')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}