import { PageContent } from "./components/PageContent";
import { type GithubRepo } from "./components/ProjectCard";

async function getRepo(owner: string, repo: string): Promise<GithubRepo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const [bev, site] = await Promise.all([
    getRepo("lenvxdev", "BetterEnhancedVelocity"),
    getRepo("lenvxdev", "site"),
  ]);

  return (
    <PageContent
      bev={bev}
      site={site}
      discordId={process.env.NEXT_PUBLIC_DISCORD_ID}
    />
  );
}
