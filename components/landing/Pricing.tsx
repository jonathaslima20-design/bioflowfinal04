import { Check, Star } from 'lucide-react';
import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  bg: string;
  ctaBg: string;
  ctaText: string;
  highlight?: boolean;
  badge?: { label: string; bg: string; text: string; position: 'top-center' | 'top-right'; icon?: boolean };
};

const MONTHLY_PRICE = 29;
const ANNUAL_PRICE = 279;
const ANNUAL_DISCOUNT = Math.round((1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100);

const plans: Plan[] = [
  {
    name: 'FREE',
    price: 'R$0',
    period: '/sempre',
    features: [
      '3 links sociais',
      '2 links personalizados',
      '1 banner',
      '1 vídeo',
      'Analytics básico',
    ],
    cta: 'COMEÇAR GRÁTIS',
    bg: 'bg-white',
    ctaBg: 'bg-white',
    ctaText: 'text-black',
  },
  {
    name: 'PRO MENSAL',
    price: `R$${MONTHLY_PRICE}`,
    period: '/mês',
    features: [
      'Links ilimitados',
      'Vídeos ilimitados',
      'Banners ilimitados',
      'Domínio personalizado',
      'Meta Pixel & Google Analytics',
      'Suporte prioritário',
      'Indique e ganhe',
    ],
    cta: 'ASSINAR PRO',
    bg: 'bg-bioyellow',
    ctaBg: 'bg-blue-600',
    ctaText: 'text-white',
    highlight: true,
    badge: { label: 'MAIS POPULAR', bg: 'bg-black', text: 'text-white', position: 'top-center', icon: true },
  },
  {
    name: 'PRO ANUAL',
    price: `R$${ANNUAL_PRICE}`,
    period: '/ano',
    features: [
      'Todos os recursos do Pro Mensal',
      'Remoção da logo BioFlowzy',
      `Desconto de ${ANNUAL_DISCOUNT}%`,
      'Acesso antecipado a novos recursos',
    ],
    cta: 'ASSINAR ANUAL',
    bg: 'bg-biolime',
    ctaBg: 'bg-black',
    ctaText: 'text-white',
    badge: { label: `ECONOMIZE ${ANNUAL_DISCOUNT}%`, bg: 'bg-blue-600', text: 'text-white', position: 'top-right' },
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white border-y-2 border-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block bg-biolime text-black px-4 py-1 text-xs font-bold brutal-border">
            PREÇOS
          </span>
          <h2 className="font-display text-4xl md:text-6xl mt-5 tracking-tight">PREÇOS SIMPLES</h2>
          <p className="mt-4 text-base text-black/70">
            Escolha o plano perfeito para você. Cancele quando quiser.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`${p.bg} brutal-border p-8 ${p.highlight ? 'brutal-shadow-xl' : 'brutal-shadow'} relative flex flex-col`}
            >
              {p.badge && (
                <span
                  className={`absolute ${p.badge.position === 'top-center' ? '-top-4 left-1/2 -translate-x-1/2' : '-top-3 right-4'} ${p.badge.bg} ${p.badge.text} px-3 py-1.5 text-xs font-bold brutal-border inline-flex items-center gap-1.5 whitespace-nowrap`}
                >
                  {p.badge.icon && <Star className="w-3 h-3" fill="currentColor" />}
                  {p.badge.label}
                </span>
              )}

              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-5xl">{p.price}</span>
                <span className="text-sm font-medium">{p.period}</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-bold">
                    <span className="w-5 h-5 shrink-0 bg-black text-white flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`mt-8 brutal-btn w-full py-3 text-center font-bold ${p.ctaBg} ${p.ctaText}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
