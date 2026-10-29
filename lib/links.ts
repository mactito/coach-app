import type { NavLink } from '@/components/Nav'

export const trainerLinks: NavLink[] = [
  { href: '/trainer', label: 'Home', icon: 'home' },
  { href: '/trainer/clients', label: 'Clienti', icon: 'users' },
  { href: '/trainer/workouts', label: 'Allenamenti', icon: 'build' },
  { href: '/trainer/chat', label: 'Messaggi', icon: 'chat' },
]
export const clientLinks: NavLink[] = [
  { href: '/oggi', label: 'Oggi', icon: 'today' },
  { href: '/progressi', label: 'Progressi', icon: 'prog' },
  { href: '/chat', label: 'Chat', icon: 'chat' },
  { href: '/alimentazione', label: 'Piano', icon: 'food' },
]
