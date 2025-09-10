import React from 'react';
import { Play, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../lib/supabaseClient';

/**
 * Coach data structure representing an AI coach in the system
 */
interface Coach {
  /** Unique identifier for the coach */
  id: string
  /** Display name of the coach */
  name: string
  /** Optional description of the coach's expertise */
  description: string | null
  /** Voice name for speech synthesis */
  voice_name: string | null
  /** Voice ID for speech synthesis */
  voice_id: string | null
  /** Category/domain of expertise */
  category: string | null
  /** Rating score for the coach */
  rating: number
  /** Whether the coach is currently available */
  available: boolean
  /** External agent ID if integrated with third-party */
  agent_id: string | null
  /** External URL for additional resources */
  external_url: string | null
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}

/**
 * Props for the CoachCard component
 */
interface CoachCardProps {
  /** The coach data to display */
  coach: Coach
  /** Callback when the edit action is triggered */
  onEdit: (coach: Coach) => void
  /** Callback when the delete action is triggered */
  onDelete: (coachId: string) => void
  /** Callback when a coaching session is started */
  onStartSession: (coach: Coach) => void
}

/**
 * CoachCard component displays information about an AI coach and provides
 * actions to edit, delete, or start a coaching session.
 * 
 * @param props - The component props
 * @param props.coach - The coach data to display
 * @param props.onEdit - Callback when edit is clicked
 * @param props.onDelete - Callback when delete is clicked
 * @param props.onStartSession - Callback when start session is clicked
 * @returns React component rendering a coach card
 * 
 * @example
 * ```tsx
 * <CoachCard
 *   coach={coachData}
 *   onEdit={(coach) => setEditingCoach(coach)}
 *   onDelete={(id) => handleDelete(id)}
 *   onStartSession={(coach) => startCoachingSession(coach)}
 * />
 * ```
 */
export default function CoachCard({ coach, onEdit, onDelete, onStartSession }: CoachCardProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this coach?')) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', coach.id)

      if (error) throw error

      onDelete(coach.id)
      toast({
        title: 'Success',
        description: 'Coach deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting coach:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete coach',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-muted rounded-lg flex-shrink-0">
              <UserCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate max-w-full" title={coach.name}>
                {coach.name}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {coach.category || 'Coach'} • Rating {coach.rating}/5
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatDate(coach.updated_at)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartSession(coach)}
              disabled={!coach.available}
              className="h-8 w-8 p-0"
              title="Start Session"
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}