import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"

interface Coach {
  id: string
  name: string
  description: string | null
  external_url: string | null
}

interface CoachingModalProps {
  coach: Coach | null
  isOpen: boolean
  onClose: () => void
}

export default function CoachingModal({ coach, isOpen, onClose }: CoachingModalProps) {

  if (!coach) {
    return null
  }

  const openCoachingSession = () => {
    if (coach?.external_url) {
      window.open(coach.external_url, '_blank', 'noopener,noreferrer')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Coaching Session</DialogTitle>
          {coach?.description && (
            <p className="text-muted-foreground">{coach.description}</p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your coaching session with <strong>{coach?.name}</strong> will open in a new window for the best experience.
          </p>
          
          <div className="flex gap-3">
            <Button onClick={openCoachingSession} className="flex-1">
              Start Session
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}