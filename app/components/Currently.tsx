"use client";

import { type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanyard, type LanyardActivity } from "../hooks/useLanyard";
import { StrokeCard } from "./StrokeCard";
import { useLang } from "../contexts/LangContext";

function activityImgUrl(activity: LanyardActivity): string | null {
  const img = activity.assets?.large_image;
  if (!img) return null;
  if (img.startsWith("mp:external/")) {
    const parts = img.slice("mp:external/".length).split("/");
    if (parts.length < 3) return null;
    return `${parts[1]}://${parts.slice(2).join("/")}`;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
  }
  return null;
}

const spring = { type: "spring" as const, damping: 22, stiffness: 220 };

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { ...spring },
};

const cardMotion = {
  initial: { opacity: 0, scale: 0.94, y: 14 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.96, y: -8 },
  transition: { ...spring },
};

const textSlip = (delay = 0) => ({
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -5 },
  transition: { ...spring, delay },
});

const CARD_CLASS = "flex items-center gap-3 backdrop-blur-sm bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3";

export function Currently({ userId }: { userId: string }) {
  const { t } = useLang();
  const data = useLanyard(userId);

  if (!data) return null;

  const activities = data.activities ?? [];
  const custom  = activities.find((a) => a.type === 4);
  const playing = activities.find((a) => a.type === 0);
  const hasActivity = data.listening_to_spotify || !!custom?.state || !!playing;
  const playingImg = playing ? activityImgUrl(playing) : null;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="wait">
        {!hasActivity ? (
          <motion.p key="empty" {...fadeSlide} className="text-zinc-600 text-sm">
            {t("idle")}
          </motion.p>
        ) : custom?.state ? (
          <motion.p key="status" {...fadeSlide} className="text-zinc-400 text-sm">
            {custom.state}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {playing && (
          <StrokeCard key="playing" {...cardMotion} className={CARD_CLASS}>
            <AnimatePresence mode="wait">
              {playingImg && (
                <motion.div key={playingImg} {...textSlip()} className="shrink-0">
                      <img
                    src={playingImg}
                    alt={playing.assets?.large_text ?? playing.name}
                    width={40}
                    height={40}
                    className="rounded-md w-10 h-10 object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.p key={playing.name} {...textSlip(0)} className="text-zinc-500 text-xs mb-0.5">
                  {playing.name}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {playing.details && (
                  <motion.p key={playing.details} {...textSlip(0.07)} className="text-white text-sm font-medium truncate">
                    {playing.details}
                  </motion.p>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                {playing.state && (
                  <motion.p key={playing.state} {...textSlip(0.13)} className="text-zinc-500 text-xs truncate">
                    {playing.state}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </StrokeCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {data.listening_to_spotify && data.spotify && (
          <StrokeCard
            key="spotify"
            {...cardMotion}
            className={`${CARD_CLASS} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DB954]`}
            color="#1DB954"
            role="link"
            tabIndex={0}
            aria-label={`Listening to ${data.spotify.song} by ${data.spotify.artist} on Spotify`}
            onClick={() => window.open(`https://open.spotify.com/track/${data.spotify?.track_id}`, "_blank", "noopener,noreferrer")}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.open(`https://open.spotify.com/track/${data.spotify?.track_id}`, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={data.spotify.album_art_url} {...textSlip()} className="shrink-0">
                <img
                  src={data.spotify.album_art_url}
                  alt={data.spotify.album}
                  width={48}
                  height={48}
                  className="rounded-md w-12 h-12 object-cover"
                />
              </motion.div>
            </AnimatePresence>
            <div className="min-w-0">
              <p className="text-zinc-500 text-xs mb-0.5">{t("listeningSpotify")}</p>
              <AnimatePresence mode="wait">
                <motion.p key={data.spotify.song} {...textSlip(0)} className="text-white text-sm font-medium truncate">
                  {data.spotify.song}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p key={data.spotify.artist} {...textSlip(0.07)} className="text-zinc-500 text-xs truncate">
                  {data.spotify.artist}
                </motion.p>
              </AnimatePresence>
            </div>
          </StrokeCard>
        )}
      </AnimatePresence>
    </div>
  );
}
