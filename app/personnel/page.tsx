'use client'

import { useContext, useState, useCallback } from 'react'
import { AppContext } from '@/components/providers/app-provider'
import { VolunteerCard } from '@/components/impact-grid/volunteer-card'
import { removeVolunteer } from '@/hooks/use-dashboard'

export default function PersonnelPage() {
  const { volunteers } = useContext(AppContext)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: '',
    location: '',
    available: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleAddVolunteer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const newVolunteer = {
        id: `VOL_${Date.now()}`,
        name: formData.name,
        location: formData.location || 'Unknown Location',
        skills: skillsArray,
        availability: formData.available ? 'available' : 'offline',
        clearance_level: 1,
        missions_completed: 0,
        joined_at: new Date().toISOString().split('T')[0],
        contact_email: '',
        contact_phone: '',
        mission_history: [],
      }

      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVolunteer),
      })

      if (response.ok) {
        setFormData({ name: '', role: '', skills: '', location: '', available: true })
        setShowAddForm(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  const handleRemove = useCallback(async (id: string) => {
    try {
      await removeVolunteer(id)
      setRemovingId(null)
    } catch (error) {
      console.error('[v0] Remove volunteer failed:', error)
    }
  }, [])

  const isEmpty = !volunteers || volunteers.length === 0
  const availableCount = volunteers?.filter(v => v.availability === 'available').length || 0
  const busyCount = volunteers?.filter(v => v.availability === 'busy').length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">PERSONNEL_ROSTER</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {volunteers?.length || 0} team {volunteers?.length === 1 ? 'member' : 'members'} · {availableCount} available · {busyCount} on mission
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-sm tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all"
          >
            {showAddForm ? 'CANCEL' : 'ADD_VOLUNTEER'}
          </button>
        </div>
      </div>

      {/* Add Volunteer Form */}
      {showAddForm && (
        <div className="border-b border-border px-4 py-4 md:px-6 md:py-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SGT. ELIAS VANCE"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2">Role (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Medical Officer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2">Location (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Base Camp Alpha"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">Skills (comma-separated, optional)</label>
                <input
                  type="text"
                  placeholder="e.g., medical, first aid, logistics"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-[var(--tactical-orange)]"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="available" className="text-sm font-mono text-muted-foreground">
                  Available for deployment
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-xs tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'ADDING...' : 'CONFIRM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {isEmpty ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-6">No volunteers added yet. Invite your first team member to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[var(--tactical-orange)] text-black font-mono text-sm tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 transition-all"
              >
                ADD_FIRST_VOLUNTEER
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {volunteers.map((volunteer) => (
                <div key={volunteer.id} className="relative">
                  {removingId === volunteer.id && (
                    <div className="absolute inset-0 bg-black/50 rounded-sm z-10 flex items-center justify-center">
                      <div className="bg-card border border-border rounded-sm p-4 text-center">
                        <p className="text-sm mb-3">Remove {volunteer.name} from roster?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemove(volunteer.id)}
                            className="flex-1 px-3 py-2 bg-red-900/50 text-red-200 font-mono text-xs rounded-sm hover:bg-red-900 transition-all"
                          >
                            CONFIRM
                          </button>
                          <button
                            onClick={() => setRemovingId(null)}
                            className="flex-1 px-3 py-2 bg-muted border border-border font-mono text-xs rounded-sm hover:bg-muted/80 transition-all"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <VolunteerCard
                    volunteer={volunteer}
                    onRemove={() => setRemovingId(volunteer.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
