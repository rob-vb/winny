const GIPHY_API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY;
const GIPHY_API_BASE = "https://api.giphy.com/v1";

const CELEBRATION_GIF_IDS = [
  "o75ajIFH0QnQC3nCeD",
  "b09xElu8in7Lq",
  "g9582DNuQppxC",
  "l0MYt5jPR6QX5pnqM",
  "GS9pfaxQj5hPKFGGp8",
  "mp1JYId8n0t3y",
  "Jt4y4zi519V6asgGhA",
  "YRuFixSNWFVcXaxpmX",
  "mGK1g88HZRa2FlKGbz",
  "cdXpgeB32BekIGzBNh",
  "xT77XWum9yH7zNkFW0",
  "26u4cqiYI30juCOGY",
];

export interface CelebrationGif {
  id: string;
  url: string;
  analytics: {
    onload?: string;
    onclick?: string;
    onsent?: string;
  };
}

interface GiphyApiGif {
  id: string;
  images: {
    original: { url: string };
    fixed_height?: { url: string };
  };
  analytics?: {
    onload?: { url: string };
    onclick?: { url: string };
    onsent?: { url: string };
  };
}

let cachedGifs: CelebrationGif[] | null = null;
let inFlight: Promise<CelebrationGif[]> | null = null;

async function fetchCelebrationGifs(): Promise<CelebrationGif[]> {
  if (!GIPHY_API_KEY) {
    throw new Error("EXPO_PUBLIC_GIPHY_API_KEY is not set");
  }
  const ids = CELEBRATION_GIF_IDS.join(",");
  const url = `${GIPHY_API_BASE}/gifs?api_key=${encodeURIComponent(
    GIPHY_API_KEY
  )}&ids=${encodeURIComponent(ids)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Giphy API ${res.status}`);
  }
  const json = (await res.json()) as { data: GiphyApiGif[] };
  return json.data.map((gif) => ({
    id: gif.id,
    url: gif.images.original.url,
    analytics: {
      onload: gif.analytics?.onload?.url,
      onclick: gif.analytics?.onclick?.url,
      onsent: gif.analytics?.onsent?.url,
    },
  }));
}

export async function getCelebrationGifs(): Promise<CelebrationGif[]> {
  if (cachedGifs) return cachedGifs;
  if (inFlight) return inFlight;
  inFlight = fetchCelebrationGifs()
    .then((gifs) => {
      cachedGifs = gifs;
      inFlight = null;
      return gifs;
    })
    .catch((err) => {
      inFlight = null;
      throw err;
    });
  return inFlight;
}

export async function getRandomCelebrationGif(): Promise<CelebrationGif | null> {
  try {
    const gifs = await getCelebrationGifs();
    if (gifs.length === 0) {
      console.warn("[giphy] no gifs returned");
      return null;
    }
    return gifs[Math.floor(Math.random() * gifs.length)];
  } catch (err) {
    console.warn("[giphy] fetch failed:", err);
    console.warn("[giphy] api key present?", !!GIPHY_API_KEY);
    return null;
  }
}

export function pingGiphyAnalytics(url: string | undefined): void {
  if (!url) return;
  fetch(url).catch(() => {});
}
