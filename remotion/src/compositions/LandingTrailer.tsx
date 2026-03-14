import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";

const FPS = 30;

/** Scene durations in seconds */
const SCENES = {
  hero: 5,
  howItWorks: 8,
  features: 15,
  numbers: 5,
  cta: 9,
  // Fade transitions overlap by 0.5s each
} as const;

function HeroScene() {
  const frame = useCurrentFrame();
  const progress = frame / (SCENES.hero * FPS);
  const titleOpacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(progress, [0, 0.3], [40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-[#1e1d1b]">
      <h1
        className="text-center text-[7rem] font-light leading-[0.9] tracking-[-0.04em] text-[#FFFCF2]"
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}
      >
        Your inbox,
        <br />
        <span className="italic text-[#eb5e28]">finally</span> clear.
      </h1>
    </AbsoluteFill>
  );
}

function HowItWorksScene() {
  const frame = useCurrentFrame();
  const progress = frame / (SCENES.howItWorks * FPS);
  const opacity = interpolate(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center bg-[#1e1d1b]"
      style={{ opacity }}
    >
      <div className="text-[1rem] uppercase tracking-[0.15em] text-[#ccc5b9]/60">
        How it works
      </div>
      <div className="mt-12 flex items-center gap-24">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#403d39]/40 bg-[#403d39]/20 text-2xl">
            📧
          </div>
          <span className="text-sm text-[#ccc5b9]">Email Providers</span>
        </div>
        <div className="text-4xl text-[#eb5e28]/40">→</div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#eb5e28]/30 bg-[#eb5e28]/10 text-3xl font-bold text-[#eb5e28]">
            B
          </div>
          <span className="text-sm text-[#ccc5b9]">Bertram AI</span>
        </div>
        <div className="text-4xl text-[#eb5e28]/40">→</div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#403d39]/40 bg-[#403d39]/20 text-2xl">
            ✨
          </div>
          <span className="text-sm text-[#ccc5b9]">Clean Inbox</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function FeaturesScene() {
  const frame = useCurrentFrame();
  const totalFrames = SCENES.features * FPS;
  const featureNames = [
    "AI-Powered Summaries",
    "Smart Replies",
    "Meeting Scheduling",
    "Inbox Analytics",
  ];
  const perFeature = totalFrames / featureNames.length;
  const activeIndex = Math.min(
    Math.floor(frame / perFeature),
    featureNames.length - 1,
  );
  const localProgress = (frame - activeIndex * perFeature) / perFeature;
  const titleOpacity = interpolate(localProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center bg-[#1e1d1b]">
      <div className="text-[0.9rem] uppercase tracking-[0.15em] text-[#ccc5b9]/60">
        {String(activeIndex + 1).padStart(2, "0")} / 04
      </div>
      <h2
        className="mt-6 text-center text-[5rem] font-light leading-[1.1] tracking-[-0.03em] text-[#FFFCF2]"
        style={{ opacity: titleOpacity }}
      >
        {featureNames[activeIndex]}
      </h2>
    </AbsoluteFill>
  );
}

function NumbersScene() {
  const frame = useCurrentFrame();
  const progress = frame / (SCENES.numbers * FPS);
  const stats = ["2M+", "50K", "3hrs", "4.9"];
  const labels = [
    "Emails processed daily",
    "Active users worldwide",
    "Time saved per week",
    "App store rating",
  ];

  return (
    <AbsoluteFill className="flex items-center justify-center bg-[#1e1d1b]">
      <div className="grid grid-cols-2 gap-16">
        {stats.map((stat, i) => {
          const delay = i * 0.15;
          const opacity = interpolate(
            progress,
            [delay, delay + 0.3],
            [0, 1],
            { extrapolateRight: "clamp" },
          );
          return (
            <div key={i} style={{ opacity }}>
              <div className="text-[5rem] font-light leading-none tracking-[-0.04em] text-[#FFFCF2]">
                {stat}
              </div>
              <div className="mt-3 text-sm uppercase tracking-wider text-[#ccc5b9]/60">
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function CtaScene() {
  const frame = useCurrentFrame();
  const progress = frame / (SCENES.cta * FPS);
  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 0.2], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      className="flex flex-col items-center justify-center bg-[#1e1d1b]"
      style={{ opacity }}
    >
      <h2
        className="text-center text-[8rem] font-light leading-[0.9] tracking-[-0.04em] text-[#FFFCF2]"
        style={{ transform: `translateY(${y}px)` }}
      >
        Take back your
        <br />
        <span className="italic text-[#eb5e28]">inbox</span> today.
      </h2>
    </AbsoluteFill>
  );
}

export const LandingTrailer: React.FC = () => {
  const fadeFrames = Math.round(0.5 * FPS);

  let offset = 0;
  const heroStart = offset;
  offset += SCENES.hero * FPS - fadeFrames;

  const howStart = offset;
  offset += SCENES.howItWorks * FPS - fadeFrames;

  const featuresStart = offset;
  offset += SCENES.features * FPS - fadeFrames;

  const numbersStart = offset;
  offset += SCENES.numbers * FPS - fadeFrames;

  const ctaStart = offset;

  return (
    <AbsoluteFill className="bg-[#1e1d1b]">
      <Sequence from={heroStart} durationInFrames={SCENES.hero * FPS}>
        <HeroScene />
      </Sequence>
      <Sequence from={howStart} durationInFrames={SCENES.howItWorks * FPS}>
        <HowItWorksScene />
      </Sequence>
      <Sequence from={featuresStart} durationInFrames={SCENES.features * FPS}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={numbersStart} durationInFrames={SCENES.numbers * FPS}>
        <NumbersScene />
      </Sequence>
      <Sequence from={ctaStart} durationInFrames={SCENES.cta * FPS}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};
