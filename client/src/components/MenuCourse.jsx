import { Leaf, Wheat, Nut } from 'lucide-react';
import Reveal from './Reveal.jsx';

const courseTitles = {
  snacks: 'To begin',
  starters: 'Starters',
  mains: 'Mains',
  sides: 'Sides',
  desserts: 'Puddings',
  cheese: 'Cheese',
};

const dietaryIcon = {
  vegetarian: { icon: Leaf, label: 'Vegetarian' },
  vegan: { icon: Leaf, label: 'Vegan' },
  'gluten-free': { icon: Wheat, label: 'Gluten free' },
  'dairy-free': { icon: Wheat, label: 'Dairy free' },
  'contains-nuts': { icon: Nut, label: 'Contains nuts' },
};

const price = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export default function MenuCourse({ group, index = 0 }) {
  return (
    <section className="scroll-mt-32" id={group.course}>
      <Reveal from="up">
        <header className="mb-9 flex items-baseline gap-5">
          <h2 className="font-display text-4xl font-light text-cream-50 md:text-5xl">
            {courseTitles[group.course] ?? group.course}
          </h2>
          <span className="h-px flex-1 bg-char-700" />
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-cream-600">
            {String(index + 1).padStart(2, '0')}
          </span>
        </header>
      </Reveal>

      <ul className="space-y-9">
        {group.items.map((item, i) => (
          <Reveal key={item._id} from="up" delay={Math.min(i, 6) * 0.05}>
            <li>
              <div className="flex items-baseline">
                <h3 className="font-display text-2xl font-normal text-cream-50">{item.name}</h3>
                <span className="leader" aria-hidden="true" />
                <span className="font-display text-2xl font-light text-brass">{price(item.price)}</span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-400">{item.description}</p>

              {item.dietary?.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-4">
                  {item.dietary.map((d) => {
                    const meta = dietaryIcon[d];
                    if (!meta) return null;
                    return (
                      <li key={d} className="flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-cream-600">
                        <meta.icon size={12} className="text-brass/70" />
                        {meta.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
