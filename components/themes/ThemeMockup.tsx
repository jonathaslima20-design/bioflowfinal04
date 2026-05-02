'use client';

import { memo, type ReactNode } from 'react';
import { getTheme, getThemeDefaults } from '@/themes/registry';
import { DEMO_PROFILE, DEMO_LINKS, DEMO_SOCIALS, DEMO_VIDEOS, DEMO_BANNERS } from './demoData';
import type { BioProfile } from '@/themes/types';

const PHONE_WIDTH = 200;
const PHONE_HEIGHT = 420;
const INNER_WIDTH = 400;
const SCALE = PHONE_WIDTH / INNER_WIDTH;
const INNER_HEIGHT = PHONE_HEIGHT / SCALE;

type Props = {
  themeKey: string;
  overrides?: Partial<BioProfile>;
  overlay?: ReactNode;
};

function PhoneFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  return (
    <div
      className="relative bg-white brutal-border rounded-[36px] p-2 brutal-shadow-xl"
      style={{ width: PHONE_WIDTH + 16, height: PHONE_HEIGHT + 16 }}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />
      <div
        className="relative overflow-hidden rounded-[28px] bg-white"
        style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT }}
      >
        {children}
        {overlay}
      </div>
    </div>
  );
}

function ThemeMockupBase({ themeKey, overrides, overlay }: Props) {
  const theme = getTheme(themeKey);
  const Component = theme.component;
  const defaults = getThemeDefaults(themeKey);
  const profile = {
    border_width: 2,
    shadow_offset: 4,
    ...DEMO_PROFILE,
    ...defaults,
    ...overrides,
    theme: themeKey,
  } as BioProfile;

  return (
    <PhoneFrame overlay={overlay}>
      <div
        className="pointer-events-none select-none origin-top-left"
        style={{
          width: INNER_WIDTH,
          height: INNER_HEIGHT,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
        }}
        aria-hidden
      >
        <Component
          profile={profile}
          links={DEMO_LINKS}
          socials={DEMO_SOCIALS}
          videos={DEMO_VIDEOS}
          banners={DEMO_BANNERS}
        />
      </div>
    </PhoneFrame>
  );
}

export const ThemeMockup = memo(ThemeMockupBase);
export { PhoneFrame };
