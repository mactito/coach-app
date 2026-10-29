import AppFrame from '@/components/AppFrame'
import { trainerLinks } from '@/lib/links'

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame links={trainerLinks}>{children}</AppFrame>
}
