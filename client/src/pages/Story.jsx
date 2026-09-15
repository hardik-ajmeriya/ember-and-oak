import PageTransition from '../components/PageTransition.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal.jsx';
import SmartImage from '../components/SmartImage.jsx';
import Button from '../components/Button.jsx';

const img = (id, w = 1400, h = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const team = [
  {
    name: 'Ines Duarte',
    role: 'Head Chef & Co-founder',
    photo: img('photo-1573497019940-1c28c88b4f3e', 800, 1000),
    bio: 'Trained in Lisbon and Copenhagen. Opened Ember & Oak with a second-hand oven and a lease she could not really afford.',
  },
  {
    name: 'Sam Okafor',
    role: 'Co-founder & Sommelier',
    photo: img('photo-1552058544-f2b08422138a', 800, 1000),
    bio: 'Spent nine years on floors in Bordeaux and Bristol. Buys wine the way Ines buys vegetables: from people he has met.',
  },
  {
    name: 'Tom Aldridge',
    role: 'Baker',
    photo: img('photo-1472099645785-5658abf4ff4e', 800, 1000),
    bio: 'Keeps an eleven-year-old starter alive and has strong opinions about hydration. Bakes twice daily.',
  },
  {
    name: 'Nour Haddad',
    role: 'Restaurant Manager',
    photo: img('photo-1508214751196-bcfd4ca60f91', 800, 1000),
    bio: 'Remembers what you ordered last time, which guests find unnerving and then, on reflection, quite nice.',
  },
];

const timeline = [
  ['2016', 'A lease on Wharf Lane', 'Twelve tables, a second-hand oven, and a menu of six dishes written on a chalkboard.'],
  ['2018', 'The oven is rebuilt', 'Two months closed while a bricklayer from Naples rebuilt the chamber. Everything since tastes different.'],
  ['2021', 'Three growers, one contract', 'We stopped buying from wholesalers and committed to whatever three farms could supply.'],
  ['2024', 'The counter opens', 'Six seats at the pass, kept back for walk-ins and for people who like watching.'],
];

export default function Story() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Since 2016"
        title="A short history of a small room."
        lead="Ember & Oak has been on Wharf Lane since 2016. It has been three different restaurants in that time, all of them ours."
        image={img('photo-1555396273-367ea4eb4db5', 1800, 900)}
        crumbs={[{ label: 'The Room' }]}
      />

      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal from="up">
            <div className="space-y-6 text-base leading-[1.9] text-cream-300">
              <p className="font-display text-2xl font-light leading-[1.6] text-cream-100">
                The building was a chandlery, then a printers, then empty for eleven years. When we
                took it, the floor sloped so badly that plates slid off the pass.
              </p>
              <p>
                We kept the slope. Fixing it would have cost more than the ovens, and after a while it
                stopped being a fault and started being a feature — the reason the room has a slightly
                askew, lived-in quality that new restaurants spend a fortune trying to fake.
              </p>
              <p>
                What we did spend money on was heat. The oven is the only piece of equipment in the
                building that has ever been rebuilt from scratch, by a bricklayer who flew in from
                Naples and complained about the weather for eight weeks. Everything we cook passes
                through it or beside it.
              </p>
              <p>
                The menu is short because the room is small and the oven has a fixed number of shelves.
                Constraints, it turns out, are a reasonable substitute for talent.
              </p>
            </div>
          </Reveal>

          <Reveal from="left" delay={0.15}>
            <SmartImage
              src={img('photo-1517248135467-4c7edcad34c4', 1000, 1300)}
              alt="The bar and back counter"
              className="aspect-[3/4] w-full"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-char-800 bg-char-900/30 py-20 md:py-28">
        <div className="shell">
          <SectionHeading eyebrow="Milestones" title="Eight years, four turning points." className="mb-14" />
          <ol className="space-y-0">
            {timeline.map(([year, title, body]) => (
              <Reveal key={year} from="up">
                <li className="grid gap-4 border-t border-char-700 py-9 md:grid-cols-[8rem_1fr] md:gap-10">
                  <span className="font-display text-3xl font-light text-brass">{year}</span>
                  <div>
                    <h3 className="font-display text-2xl font-normal text-cream-50">{title}</h3>
                    <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-cream-400">{body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="Who is here"
          title="Four people you will meet."
          lead="Fourteen work here in total. These four have been here longest and are hardest to replace."
          className="mb-14"
        />

        <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.09}>
          {team.map((person) => (
            <RevealItem key={person.name}>
              <article className="group">
                <SmartImage
                  src={person.photo}
                  alt={person.name}
                  className="aspect-[4/5] w-full"
                  imgClassName="grayscale transition-all duration-[1200ms] ease-smooth group-hover:grayscale-0"
                />
                <h3 className="mt-6 font-display text-2xl font-normal text-cream-50">{person.name}</h3>
                <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.22em] text-brass">{person.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-cream-400">{person.bio}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal from="up" delay={0.2}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-5 border-t border-char-800 pt-14">
            <Button to="/reserve" size="lg">Reserve a table</Button>
            <Button to="/visit" variant="outline" size="lg">Private dining enquiries</Button>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
