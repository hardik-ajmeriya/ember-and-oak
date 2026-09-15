import { useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import PageHero from '../components/PageHero.jsx';
import MenuCourse from '../components/MenuCourse.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { MenuSkeleton } from '../components/Loader.jsx';
import useFetch from '../hooks/useFetch.js';

const seasons = [
  { key: 'all', label: 'Everything' },
  { key: 'autumn', label: 'Autumn' },
  { key: 'winter', label: 'Winter' },
  { key: 'spring', label: 'Spring' },
  { key: 'summer', label: 'Summer' },
];

const diets = [
  { key: 'all', label: 'No filter' },
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten-free', label: 'Gluten free' },
];

export default function Menu() {
  const [season, setSeason] = useState('all');
  const [dietary, setDietary] = useState('all');

  const { data, loading, error } = useFetch(`/menu?season=${season}&dietary=${dietary}`);

  return (
    <PageTransition>
      <PageHero
        eyebrow="Autumn, week two"
        title="Written this morning."
        lead="What follows is what the kitchen has today. It will not be identical next week, and that is rather the point."
        image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&h=900&q=80"
        crumbs={[{ label: 'Menu' }]}
      />

      <section className="shell py-16 md:py-24">
        <Reveal from="up">
          <div className="mb-16 flex flex-col gap-6 border-b border-char-800 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow mr-3 text-cream-400">Season</span>
              {seasons.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeason(s.key)}
                  className={`border px-4 py-1.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    season === s.key ? 'border-brass text-brass' : 'border-char-700 text-cream-400 hover:border-char-500 hover:text-cream-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow mr-3 text-cream-400">Dietary</span>
              {diets.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDietary(d.key)}
                  className={`border px-4 py-1.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    dietary === d.key ? 'border-brass text-brass' : 'border-char-700 text-cream-400 hover:border-char-500 hover:text-cream-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-[1fr_17.5rem] lg:gap-20">
          <div className="space-y-20">
            {loading ? (
              <MenuSkeleton rows={8} />
            ) : error ? (
              <EmptyState title="Could not load the menu" message={error} />
            ) : (data?.courses?.length ?? 0) === 0 ? (
              <EmptyState
                title="Nothing matches that"
                message="Try widening the filters — the kitchen writes a short menu, so combinations run out quickly."
                action={
                  <Button className="mt-2" onClick={() => { setSeason('all'); setDietary('all'); }}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              data.courses.map((group, i) => <MenuCourse key={group.course} group={group} index={i} />)
            )}
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border border-char-700 bg-char-900/50 p-7">
              <h2 className="font-display text-2xl font-light text-cream-50">A note on allergies</h2>
              <p className="mt-4 text-sm leading-relaxed text-cream-400">
                Our kitchen is small and handles nuts, gluten and shellfish daily, so we cannot promise
                a dish is entirely free of any trace. Tell us when you book and the chef will talk to
                you before service.
              </p>
              <Button to="/reserve" size="sm" className="mt-7 w-full">Reserve a table</Button>
            </div>

            <div className="mt-6 border border-char-700 bg-char-900/50 p-7">
              <h2 className="font-display text-2xl font-light text-cream-50">Wine</h2>
              <p className="mt-4 text-sm leading-relaxed text-cream-400">
                Around ninety bins, weighted towards growers working with minimal intervention.
                Fourteen by the glass, changed weekly. Ask — the list is not on the website on purpose.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
