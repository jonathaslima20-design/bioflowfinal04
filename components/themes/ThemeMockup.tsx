'use client';

import { memo, type ReactNode } from 'react';
import { getTheme, getThemeDefaults } from '@/themes/registry';
import { DEMO_PROFILE, DEMO_LINKS, DEMO_SOCIALS } from './demoData';
import type { BioProfile } from '@/themes/types';

const DEFAULT_PHONE_WIDTH = 220;
const DEFAULT_PHONE_HEIGHT = 504;
const INNER_WIDTH = 400;

type Props = {
  themeKey: string;
  overrides?: Partial<BioProfile>;
  overlay?: ReactNode;
  links?: any[];
  socials?: any[];
  videos?: any[];
  banners?: any[];
  themeSettings?: Record<string, any>;
  width?: number;
  height?: number;
};

function PhoneFrame({
  children,
  overlay,
  width = DEFAULT_PHONE_WIDTH,
  height = DEFAULT_PHONE_HEIGHT,
}: {
  children: ReactNode;
  overlay?: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="relative bg-white brutal-border rounded-[36px] p-2 brutal-shadow-xl"
      style={{ width: width + 16, height: height + 16 }}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20" />
      <div
        className="relative overflow-hidden rounded-[28px] bg-white"
        style={{ width, height }}
      >
        {children}
        {overlay}
      </div>
    </div>
  );
}

function ThemeMockupBase({
  themeKey,
  overrides,
  overlay,
  links,
  socials,
  videos,
  banners,
  themeSettings,
  width = DEFAULT_PHONE_WIDTH,
  height = DEFAULT_PHONE_HEIGHT,
}: Props) {
  const theme = getTheme(themeKey);
  const Component = theme.component;
  const defaults = getThemeDefaults(themeKey);
  const settingsForTheme = themeSettings && Object.keys(themeSettings).length > 0
    ? { [themeKey]: themeSettings }
    : {};
  const profile = {
    border_width: 2,
    shadow_offset: 4,
    ...DEMO_PROFILE,
    ...defaults,
    ...overrides,
    theme: themeKey,
    theme_settings: settingsForTheme,
  } as BioProfile;

  const scale = width / INNER_WIDTH;
  const innerHeight = height / scale;

  return (
    <PhoneFrame overlay={overlay} width={width} height={height}>
      <div
        className="pointer-events-none select-none origin-top-left"
        style={{
          width: INNER_WIDTH,
          height: innerHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        aria-hidden
      >
        <Component
          profile={profile}
          links={links ?? DEMO_LINKS}
          socials={socials ?? DEMO_SOCIALS}
          videos={videos ?? []}
          banners={banners ?? []}
        />
      </div>
    </PhoneFrame>
  );
}

export const ThemeMockup = memo(ThemeMockupBase);
export { PhoneFrame };
