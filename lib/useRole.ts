'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface RoleInfo {
  role: 'commander' | 'coordinator' | 'volunteer' | null
  email: string | null
  isCommander: boolean
  isCoordinator: boolean
  isVolunteer: boolean
  isLoading: boolean
}

export function useRole(): RoleInfo {
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({
    role: null,
    email: null,
    isCommander: false,
    isCoordinator: false,
    isVolunteer: false,
    isLoading: true,
  })

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setRoleInfo(prev => ({ ...prev, isLoading: false }))
          return
        }

        const role = (session.user.user_metadata?.role as string) || null
        const email = session.user.email || null

        setRoleInfo({
          role: role as 'commander' | 'coordinator' | 'volunteer' | null,
          email,
          isCommander: role === 'commander',
          isCoordinator: role === 'coordinator',
          isVolunteer: role === 'volunteer',
          isLoading: false,
        })
      } catch (error) {
        console.error('[v0] Error fetching role:', error)
        setRoleInfo(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchRole()
  }, [])

  return roleInfo
}
