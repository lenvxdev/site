import { Age } from "./components/Age";
import { Currently } from "./components/Currently";
import { HashHighlight } from "./components/HashHighlight";
import { MotionSection } from "./components/MotionSection";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProjectCard, type GithubRepo } from "./components/ProjectCard";
import { SectionHeader } from "./components/SectionHeader";

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
    <main className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-6xl min-w-0">

        <ProfileHeader />

        <MotionSection delay={0.08} id="currently" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="currently" />
          <SectionHeader section="currently" label="I am currently" />
          <hr className="border-white/10 mb-5" />
          {process.env.NEXT_PUBLIC_DISCORD_ID && (
            <Currently userId={process.env.NEXT_PUBLIC_DISCORD_ID} />
          )}
        </MotionSection>

        <MotionSection delay={0.16} id="about" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="about" />
          <SectionHeader section="about" label="About me" />
          <hr className="border-white/10 mb-5" />
          <p className="text-zinc-400 text-base leading-relaxed">
            hi, im lenvx, i am <Age /> y.o self-taught developer, mostly focused on web and minecraft development, currently coding mostly in kotlin.
          </p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">
            outside of development, i also make music, mainly phonk, breakcore, and house. i enjoy experimenting with different sounds and ideas, trying new things and seeing what fits my style.
          </p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">
            i also do graphic design work such as logos, thumbnails, and ui design. besides that, im also into photography, even tho i dont own a camera yet. for now, i mostly take photos with my phone, but hopefully ill get a proper camera in the future.
          </p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">
            overall, im a very productive and chill person who simply enjoys creating stuff.
          </p>
        </MotionSection>

        <MotionSection delay={0.24} id="projects" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/50 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="projects" />
          <SectionHeader section="projects" label="Projects" />
          <hr className="border-white/10 mb-5" />
          <div className="flex flex-col gap-3">
            {bev && <ProjectCard repo={bev} />}
            {site && <ProjectCard repo={site} />}
          </div>
        </MotionSection>

      </div>
    </main>
  );
}
