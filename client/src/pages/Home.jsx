import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Flame, Sprout, Hammer } from 'lucide-react';
import PageTransition from '../components/PageTransition.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import SplitText from '../components/SplitText.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Button from '../components/Button.jsx';
import EventCard from '../components/EventCard.jsx';
import Counter from '../components/Counter.jsx';
import { MenuSkeleton } from '../components/Loader.jsx';
import useFetch from '../hooks/useFetch.js';

const img = (id, w = 1600, h = 1100) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const money = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

const principles = [
  {
    icon: Flame,
    title: 'One oven',
    body: 'Everything that needs heat gets it from the same wood-fired oven. It is temperamental, and it is the reason the food tastes the way it does.',
  },
  {
    icon: Sprout,
    title: 'Short supply lines',
    body: 'Vegetables come from three growers within forty miles. When they stop sending something, it comes off the menu that evening.',
  },
  {
    icon: Hammer,
    title: 'Made here',
    body: 'Bread, butter, vinegar, the lot. If it can reasonably be made in the building, it is — which is slower, and worth it.',
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { data: featured, loading: loadingDishes } = useFetch('/menu/featured');
  const { data: events } = useFetch('/events');

  return (
    <PageTransition>
      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-end overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
          <SmartImage src={img('photo-1544148103-0773bf10d330', 2000, 1400)} alt="The dining room at Ember & Oak" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-char-950 via-char-950/70 to-char-950/45" />
        </motion.div>

        <motion.div style={{ opacity: fade }} className="shell relative pb-24 pt-44">
          <Reveal from="fade">
            <span className="eyebrow flex items-center gap-4">
              <span className="h-px w-12 bg-brass" aria-hidden="true" />
              Bermondsey, London
            </span>
          </Reveal>

          <h1 className="display mt-8 max-w-4xl text-[clamp(3rem,10vw,8rem)] text-cream-50">
            <SplitText text="Cooked over" stagger={0.05} />
            <br />
            <em className="font-light not-italic text-brass">
              <SplitText text="fire and time." delay={0.14} stagger={0.05} />
            </em>
          </h1>

          <Reveal from="up" delay={0.55}>
            <p className="mt-9 max-w-md text-lg leading-[1.8] text-cream-200">
              Thirty-eight covers, one wood oven, and a menu short enough to change whenever the
              growers change their minds.
            </p>
          </Reveal>

          <Reveal from="up" delay={0.68}>
            <div className="mt-11 flex flex-wrap items-center gap-5">
              <Button to="/reserve" size="lg">Reserve a table</Button>
              <Button to="/menu" variant="outline" size="lg">
                Read the menu <ArrowRight size={15} />
              </Button>
            </div>
          </Reveal>
        </motion.div>
      </section>

      {/* Statement */}
      <section className="border-y border-char-800 bg-char-900/40">
        <div className="shell py-24 md:py-32">
          <Reveal from="up">
            <p className="display mx-auto max-w-4xl text-balance text-center text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.35] text-cream-100">
              We are not trying to cook the most complicated food in London. We are trying to cook
              twelve dishes properly, and to change them before anyone gets bored — including us.
            </p>
          </Reveal>
          <Reveal from="fade" delay={0.25}>
            <p className="mt-10 text-center font-sans text-[0.62rem] uppercase tracking-[0.3em] text-cream-600">
              Ines Duarte &middot; Head Chef
            </p>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="shell py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              eyebrow="How we work"
              title="Three rules the kitchen keeps."
              lead="They sound simple written down. Keeping to them is what makes the difference between a good night and a forgettable one."
            />
          </div>

          <RevealGroup className="space-y-12">
            {principles.map((p, i) => (
              <RevealItem key={p.title}>
                <article className="group border-t border-char-700 pt-8">
                  <div className="flex items-start gap-6">
                    <span className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-brass">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-3 font-display text-3xl font-light text-cream-50">
                        <p.icon size={20} className="text-brass" aria-hidden="true" />
                        {p.title}
                      </h3>
                      <p className="mt-4 max-w-lg text-base leading-[1.85] text-cream-400">{p.body}</p>
                    </div>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Editorial image pair */}
      <section className="shell pb-24 md:pb-32">
        <div className="grid gap-5 md:grid-cols-12">
          <Reveal from="right" className="md:col-span-7">
            <SmartImage
              src={img('photo-1551218808-94e220e084d2', 1400, 1000)}
              alt="A chef finishing a plate at the pass"
              className="aspect-[4/3] w-full"
              imgClassName="transition-transform duration-[1400ms] ease-smooth hover:scale-[1.04]"
            />
          </Reveal>
          <Reveal from="left" delay={0.15} className="md:col-span-5 md:mt-20">
            <SmartImage
              src={img('photo-1466637574441-749b8f19452f', 1000, 1200)}
              alt="Produce laid out before service"
              className="aspect-[3/4] w-full"
              imgClassName="transition-transform duration-[1400ms] ease-smooth hover:scale-[1.04]"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream-400">
              Deliveries land at seven. By nine the menu for that evening is written, printed and
              pinned in the pass.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured dishes */}
      <section className="border-y border-char-800 bg-char-900/30 py-24 md:py-32">
        <div className="shell">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
            <SectionHeading eyebrow="This week" title="On the menu right now." />
            <Reveal from="fade" delay={0.2}>
              <Button to="/menu" variant="outline">
                The full menu <ArrowRight size={15} />
              </Button>
            </Reveal>
          </div>

          {loadingDishes ? (
            <MenuSkeleton rows={4} />
          ) : (
            <RevealGroup className="grid gap-x-14 gap-y-10 md:grid-cols-2" stagger={0.09}>
              {(featured?.items ?? []).map((dish) => (
                <RevealItem key={dish._id}>
                  <article className="border-t border-char-700 pt-7">
                    <div className="flex items-baseline">
                      <h3 className="font-display text-2xl font-normal text-cream-50">{dish.name}</h3>
                      <span className="leader" aria-hidden="true" />
                      <span className="font-display text-2xl font-light text-brass">{money(dish.price)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-cream-400">{dish.description}</p>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      {/* Numbers */}
      <section className="shell py-24 md:py-32">
        <dl className="grid gap-12 border-y border-char-800 py-14 sm:grid-cols-3">
          {[
            { value: 38, suffix: '', label: 'Covers in the room' },
            { value: 12, suffix: '', label: 'Dishes on the menu' },
            { value: 3, suffix: '', label: 'Growers we buy from' },
          ].map((stat) => (
            <Reveal key={stat.label} from="up">
              <div className="text-center">
                <dt className="font-display text-6xl font-light text-brass">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="mt-3 font-sans text-[0.62rem] uppercase tracking-[0.26em] text-cream-600">
                  {stat.label}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Events */}
      {(events?.items ?? []).length > 0 && (
        <section className="shell pb-24 md:pb-32">
          <SectionHeading
            eyebrow="Coming up"
            title="Evenings worth clearing a diary for."
            lead="A handful of dinners each season, usually built around someone who knows more about one thing than we do."
            className="mb-14"
          />
          <div className="grid gap-6">
            {events.items.slice(0, 2).map((event, i) => (
              <Reveal key={event._id} from="up" delay={i * 0.1}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-char-800">
        <SmartImage src={img('photo-1481833761820-0509d3217039', 2000, 1000)} alt="" className="absolute inset-0 h-full w-full" imgClassName="opacity-25" />
        <div className="absolute inset-0 bg-char-950/70" />

        <div className="shell relative py-28 text-center md:py-36">
          <Reveal from="up">
            <h2 className="display mx-auto max-w-3xl text-[clamp(2.5rem,6.5vw,5rem)] text-cream-50">
              <SplitText text="The room fills quickly." />
            </h2>
          </Reveal>
          <Reveal from="up" delay={0.2}>
            <p className="mx-auto mt-7 max-w-md text-balance leading-relaxed text-cream-300">
              We open the book three weeks out. Counter seats are held back for walk-ins from six.
            </p>
          </Reveal>
          <Reveal from="up" delay={0.3}>
            <div className="mt-11">
              <Button to="/reserve" size="lg">Reserve a table</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
