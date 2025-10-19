'use client';

import { useRef } from 'react';

import VideoPlayer from '@/components/welcome/VideoPlayer';

type FeatureCardProps = {
  step: number;
  title: string;
  description: string;
  videoSrc: string;
  thumbnailSrc: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
};

export default function FeatureCard({
  step,
  title,
  description,
  videoSrc,
  thumbnailSrc,
  icon,
  borderColor,
  bgColor,
  textColor,
}: FeatureCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCardHover = (playing: boolean) => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  return (
    <div
      className={`
        group border-border/50 bg-card/50 flex flex-col rounded-sm border p-8 transition-all duration-300
        ${borderColor}
      `}
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
    >
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`
            ${bgColor}
            flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
            group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]
          `}
        >
          <span
            className={`
              ${textColor}
              text-xl font-bold
            `}
          >
            {step}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-foreground text-2xl font-bold">{title}</h3>
        </div>
      </div>
      <p className="text-foreground mb-4">{description}</p>
      <VideoPlayer
        videoSrc={videoSrc}
        thumbnailSrc={thumbnailSrc}
        videoRef={videoRef}
        altText={`${title} demonstration video`}
      />
    </div>
  );
}
