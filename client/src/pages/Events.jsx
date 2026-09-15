import PageTransition from '../components/PageTransition.jsx';
import PageHero from '../components/PageHero.jsx';
import EventCard from '../components/EventCard.jsx';
import Reveal from '../components/Reveal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader from '../components/Loader.jsx';
import Button from '../components/Button.jsx';
import useFetch from '../hooks/useFetch.js';

export default function Events() {
  const { data, loading, error } = useFetch('/events');

  return (
    <PageTransition>
      <PageHero
        eyebrow="What is coming up"
        title="Dinners with a reason."
        lead="Wine nights, the chef's table in game season, and the occasional Saturday morning spent up to the elbows in dough."
        image="https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1800&h=900&q=80"
        crumbs={[{ label: 'Events' }]}
      />

      <section className="shell py-16 md:py-24">
        {loading ? (
          <Loader label="Loading what's coming up" />
        ) : error ? (
          <EmptyState title="Could not load events" message={error} />
        ) : (data?.items?.length ?? 0) === 0 ? (
          <EmptyState
            title="Nothing on the calendar"
            message="We announce the next season's dinners about six weeks ahead. Leave us your email and we will tell you first."
            action={<Button to="/visit" className="mt-2">Get in touch</Button>}
          />
        ) : (
          <div className="grid gap-8">
            {data.items.map((event, i) => (
              <Reveal key={event._id} from="up" delay={i * 0.09}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal from="up" delay={0.2}>
          <div className="mt-20 border border-char-700 bg-char-900/50 px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-light text-cream-50">Something of your own?</h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-sm leading-relaxed text-cream-400">
              The private room seats ten and the whole restaurant takes thirty-eight. We do buyouts on
              Mondays, when the kitchen would otherwise be dark.
            </p>
            <Button to="/visit" className="mt-8">Enquire about private dining</Button>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
