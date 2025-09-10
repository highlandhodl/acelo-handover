import { Plus, Settings, Search, Filter, Mic } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useState, useMemo } from "react"
import { useToast } from "../components/ui/use-toast"
import CoachCard from "../components/coaches/CoachCard"
import CoachingModal from "../components/coaches/CoachingModal"
import CoachForm from "../components/coaches/CoachForm"
import { useGetCoaches } from "../hooks/coaches/useGetCoaches"
import { Coach } from "../types/coach"

export default function CoachesPage() {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const { data: coaches = [], isLoading: loading, refetch } = useGetCoaches()

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach =>
      (coach.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.specialty?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [coaches, searchTerm]);

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach)
    setIsFormOpen(true)
  }

  const handleDelete = (coachId: string) => {
    refetch()
  }

  const handleStartSession = (coach: Coach) => {
    setSelectedCoach(coach)
    setIsModalOpen(true)
  }

  const handleAddCoach = () => {
    setEditingCoach(null)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    refetch()
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCoach(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Coach Hub</h2>
            <p className="text-muted-foreground">Connect with AI voice coaches for personalized guidance</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading coaches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Coach Hub</h2>
          <p className="text-muted-foreground">Connect with AI voice coaches for personalized guidance</p>
        </div>
        <Button onClick={handleAddCoach} className="bg-gradient-primary text-primary-foreground shadow-orange">
          <Plus className="mr-2 h-4 w-4" />
          Add Coach
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search coaches..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Coaches</h3>
        {filteredCoaches.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Mic className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No coaches found' : 'No coaches yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search to find what you\'re looking for.'
                : 'Add your first AI coach to get started with voice coaching.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleAddCoach}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Coach
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCoaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartSession={handleStartSession}
              />
            ))}
          </div>
        )}
      </div>

      <CoachingModal
        coach={selectedCoach}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCoach(null)
        }}
      />

      <CoachForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        coach={editingCoach}
      />
    </div>
  )
}