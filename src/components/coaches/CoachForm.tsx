import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "../../lib/supabaseClient"
import { useToast } from "../ui/use-toast"

const coachSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  external_url: z.string().url("Please enter a valid URL")
})

type CoachFormData = z.infer<typeof coachSchema>

interface CoachFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  coach?: {
    id: string
    name: string
    description: string | null
    category: string | null
    external_url: string | null
  }
}

const businessCategories = [
  "Business Coaching",
  "Leadership Development", 
  "Career Guidance",
  "Executive Coaching",
  "Entrepreneurship",
  "Sales Training",
  "Team Management",
  "Communication Skills",
  "Productivity",
  "Strategic Planning"
]

export default function CoachForm({ isOpen, onClose, onSuccess, coach }: CoachFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      name: coach?.name || "",
      description: coach?.description || "",
      category: coach?.category || "",
      external_url: coach?.external_url || ""
    }
  })

  const onSubmit = async (data: CoachFormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const coachData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        voice_name: null,
        voice_id: null,
        rating: 4.8,
        available: true,
        agent_id: null,
        external_url: data.external_url,
        user_id: user.id
      }


      if (coach) {
        const { error } = await supabase
          .from('coaches')
          .update(coachData)
          .eq('id', coach.id)
        if (error) {
          console.error('Update error:', error)
          throw error
        }
        toast({
          title: "Success",
          description: "Coach updated successfully",
        })
      } else {
        const { error } = await supabase
          .from('coaches')
          .insert([coachData])
        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        toast({
          title: "Success",
          description: "Coach created successfully",
        })
      }

      onSuccess()
      onClose()
      form.reset()
    } catch (error) {
      console.error('Error saving coach:', error)
      toast({
        title: "Error",
        description: `Failed to save coach: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="coach-form-description">
        <DialogHeader>
          <DialogTitle>{coach ? "Edit Coach" : "Add New Coach"}</DialogTitle>
        </DialogHeader>
        
        <div id="coach-form-description" className="sr-only">
          Form to {coach ? "edit an existing" : "create a new"} AI coach with configuration options
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Coach Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter coach name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe what this coach specializes in..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>External URL *</Label>
            <Input
              {...form.register("external_url")}
              placeholder="https://example.com/coaching-session"
            />
            {form.formState.errors.external_url && (
              <p className="text-sm text-destructive">{form.formState.errors.external_url.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : coach ? "Update Coach" : "Create Coach"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}