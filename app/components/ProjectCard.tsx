"use client";

import { useStrokeAnim, strokeSvg } from "../hooks/useStrokeAnim";

export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

export function ProjectCard({ repo }: { repo: GithubRepo }) {
  const { ref, enter, leave, svgProps } = useStrokeAnim<HTMLAnchorElement>();

  return (
    <a
      ref={ref}
      data-cursor-stroke
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${repo.name} on GitHub`}
      className="relative flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm px-5 py-4 hover:bg-white/[0.08] hover:border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchEnd={leave}
      onTouchCancel={leave}
    >
      {strokeSvg(svgProps)}

      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-white font-medium">{repo.name}</span>
          {repo.language && (
            <span className="text-xs text-zinc-500 font-mono">{repo.language}</span>
          )}
        </div>
        {repo.description && (
          <p className="text-zinc-500 text-sm leading-relaxed">{repo.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-zinc-500 text-sm shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{repo.stargazers_count}</span>
      </div>
    </a>
  );
}
