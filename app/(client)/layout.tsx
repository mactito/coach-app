import AppFrame from '@/components/AppFrame'
import { clientLinks } from '@/lib/links'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame links={clientLinks}>{children}</AppFrame>
}
