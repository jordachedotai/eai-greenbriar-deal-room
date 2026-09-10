import { Shell } from "@/components/Shell/Shell";
import { loadEvidence, loadMatches } from "@/lib/sources";

// Server component: the only place evidence enters the app. Mock mode reads disk.
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const evidence = loadEvidence();
  const matches = loadMatches();
  return (
    <Shell evidence={evidence} matches={matches}>
      {children}
    </Shell>
  );
}
