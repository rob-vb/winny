import { useMemo, useState } from "react";
import { SectionList, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore, useRemoveWin } from "@/src/stores/useWinsStore";
import { HistoryHeroHeader } from "@/src/components/HistoryHeroHeader";
import { DateSectionHeader } from "@/src/components/DateSectionHeader";
import { WinCard } from "@/src/components/WinCard";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import type { Win } from "@/src/db/schema";

// WinSection: shape passed to SectionList — date_key is the section identifier
// Defined at module level (not inside component) per performance contract (HIST-01)
interface WinSection {
  date_key: string;
  data: Win[];
}

// groupWinsByDate — defined at module level per plan spec and PATTERNS.md
// wins[] from store is already date_key DESC (getWins uses orderBy desc)
// Within each group, sorts by logged_at DESC (D-11)
function groupWinsByDate(wins: Win[]): WinSection[] {
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const existing = map.get(win.date_key);
    if (existing) existing.push(win);
    else map.set(win.date_key, [win]);
  }
  return Array.from(map.entries()).map(([date_key, data]) => ({
    date_key,
    data: data.sort(
      (a, b) =>
        new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    ),
  }));
  // Section order is preserved from `wins` which is `date_key DESC` — newest section first
}

export default function WinsScreen() {
  const { t } = useTranslation();
  // Multi-field useShallow pattern — copy from index.tsx (PATTERNS.md Pattern 5)
  const { wins, totalWins, streak, isHydrated } = useWinsStore(
    useShallow((s) => ({
      wins: s.wins,
      totalWins: s.totalWins,
      streak: s.streak,
      isHydrated: s.isHydrated,
    }))
  );

  // Hooks MUST be called before any conditional return (Rules of Hooks).
  // Collapse state: Record<date_key, boolean>. D-15: not persisted across launches.
  // D-14: default {} means all sections start expanded.
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  // Memoize section grouping — mandatory at scale, prevents O(n) on every render (HIST-01)
  const sections = useMemo(() => groupWinsByDate(wins), [wins]);
  const removeWin = useRemoveWin();

  const toggleSection = (date_key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [date_key]: !prev[date_key],
    }));
  };

  // Hydration guard — RESEARCH.md Pitfall 4: do not re-hydrate here.
  // index.tsx drives hydration at app boot; WinsScreen only guards on isHydrated.
  if (!isHydrated) return null;

  // Empty state — D-08: no hero header shown when totalWins === 0
  if (totalWins === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View
          className="flex-1 px-4 pt-4"
          accessibilityLabel={t("wins.emptyAria")}
        >
          <ScreenHeader
            title={t("wins.emptyTitle")}
            body={t("wins.emptyBody")}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Populated state — SectionList with collapsible date sections
  return (
    <SafeAreaView className="flex-1 bg-background">
      <SectionList<Win, WinSection>
        sections={sections}
        extraData={collapsedSections}
        stickySectionHeadersEnabled
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        renderItem={({ item, section }) =>
          collapsedSections[(section as WinSection).date_key] ? (
            <View style={{ height: 0 }} />
          ) : (
            <WinCard win={item} isNew={false} onDelete={removeWin} />
          )
        }
        renderSectionHeader={({ section }) => (
          <DateSectionHeader
            section={section as WinSection}
            isCollapsed={
              !!collapsedSections[(section as WinSection).date_key]
            }
            onToggle={() =>
              toggleSection((section as WinSection).date_key)
            }
          />
        )}
        ListHeaderComponent={
          <HistoryHeroHeader totalWins={totalWins} streak={streak} />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      />
    </SafeAreaView>
  );
}
