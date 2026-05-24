"use client";

import { Age } from "./Age";
import { Currently } from "./Currently";
import { HashHighlight } from "./HashHighlight";
import { MotionSection } from "./MotionSection";
import { ProfileHeader } from "./ProfileHeader";
import { ProjectCard, type GithubRepo } from "./ProjectCard";
import { SectionHeader } from "./SectionHeader";
import { useLang } from "../contexts/LangContext";

interface Props {
  bev:  GithubRepo | null;
  site: GithubRepo | null;
  discordId: string | undefined;
}

function insertAge(text: string) {
  const [before, after] = text.split("{age}");
  return <>{before}<Age />{after}</>;
}

export function PageContent({ bev, site, discordId }: Props) {
  const { t } = useLang();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 overflow-x-hidden">
      <div className="w-full max-w-6xl min-w-0">

        <ProfileHeader />

        <MotionSection delay={0.08} id="currently" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="currently" />
          <SectionHeader section="currently" label={t("currently")} />
          <hr className="border-white/10 mb-5" />
          {discordId && <Currently userId={discordId} />}
        </MotionSection>

        <MotionSection delay={0.16} id="about" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="about" />
          <SectionHeader section="about" label={t("about")} />
          <hr className="border-white/10 mb-5" />
          <p className="text-zinc-400 text-base leading-relaxed">{insertAge(t("aboutP1"))}</p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">{t("aboutP2")}</p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">{t("aboutP3")}</p>
          <p className="text-zinc-400 text-base leading-relaxed mt-3">{t("aboutP4")}</p>
        </MotionSection>

        <MotionSection delay={0.24} id="projects" className="relative mt-4 rounded-2xl backdrop-blur-xl bg-black/50 border border-white/[0.08] px-8 py-7">
          <HashHighlight id="projects" />
          <SectionHeader section="projects" label={t("projects")} />
          <hr className="border-white/10 mb-5" />
          <div className="flex flex-col gap-3">
            {bev  && <ProjectCard repo={bev}  />}
            {site && <ProjectCard repo={site} />}
          </div>
        </MotionSection>

      </div>
    </main>
  );
}
