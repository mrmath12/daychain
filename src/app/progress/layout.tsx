import { ProgressTabs } from '@/components/layout/ProgressTabs'

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <ProgressTabs>{children}</ProgressTabs>
}
