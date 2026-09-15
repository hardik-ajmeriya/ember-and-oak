import PageTransition from '../components/PageTransition.jsx';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import SplitText from '../components/SplitText.jsx';

export default function NotFound() {
  return (
    <PageTransition>
      <section className="shell flex min-h-[80svh] flex-col items-center justify-center py-32 text-center">
        <Reveal from="fade">
          <span className="eyebrow">Error 404</span>
        </Reveal>
        <h1 className="display mt-7 text-[clamp(3rem,14vw,10rem)] text-cream-50">
          <SplitText text="Off the menu." />
        </h1>
        <Reveal from="up" delay={0.2}>
          <p className="mt-7 max-w-md text-balance leading-relaxed text-cream-400">
            That page is not one we serve. It may have been taken off when the season changed.
          </p>
        </Reveal>
        <Reveal from="up" delay={0.3}>
          <div className="mt-11 flex flex-wrap justify-center gap-4">
            <Button to="/">Back to the front</Button>
            <Button to="/menu" variant="outline">Read the menu</Button>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
}
