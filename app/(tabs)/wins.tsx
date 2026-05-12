import { useMemo, useState } from "react";
import { SectionList, View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore } from "@/src/stores/useWinsStore";
import { HistoryHeroHeader } from "@/src/components/HistoryHeroHeader";
import { DateSectionHeader } from "@/src/components/DateSectionHeader";
import { WinCard } from "@/src/components/WinCard";
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
  // Multi-field useShallow pattern — copy from index.tsx (PATTERNS.md Pattern 5)
  const { wins, totalWins, streak, isHydrated } = useWinsStore(
    useShallow((s) => ({
      wins: s.wins,
      totalWins: s.totalWins,
      streak: s.streak,
      isHydrated: s.isHydrated,
    }))
  );

  // Hydration guard — RESEARCH.md Pitfall 4: do not re-hydrate here.
  // index.tsx drives hydration at app boot; WinsScreen only guards on isHydrated.
  if (!isHydrated) return null;

  // Collapse state: Record<date_key, boolean>. D-15: not persisted across launches.
  // D-14: default {} means all sections start expanded.
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (date_key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [date_key]: !prev[date_key],
    }));
  };

  // Memoize section grouping — mandatory at scale, prevents O(n) on every render (HIST-01)
  const sections = useMemo(() => groupWinsByDate(wins), [wins]);

  // Empty state — D-08: no hero header shown when totalWins === 0
  if (totalWins === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View
          className="flex-1 items-center justify-center px-4"
          accessibilityLabel="No wins yet. Head to Home to log your first win."
        >
          <Image
            source={require("@/assets/images/trophy.png")}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
            className="mb-8"
            accessibilityLabel="Winning Streak trophy"
          />
          <Text className="font-nunito-bold text-sm text-text-primary text-center max-w-[280px]">
            Your wins will live here
          </Text>
          <Text className="font-nunito-regular text-base text-text-secondary text-center leading-relaxed mt-2 max-w-[280px]">
            Head to Home and log your first win.
          </Text>
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
          collapsedSections[(section as WinSection).date_key] ? null : (
            <WinCard win={item} isNew={false} />
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
