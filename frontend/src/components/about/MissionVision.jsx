import Reveal from '../ui/Reveal.jsx';

export default function MissionVision() {
  return (
    <section className="py-section-padding px-margin-mobile md:px-margin-desktop max-w-container mx-auto">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <Reveal from="left" className="space-y-12">
          <div>
            <h2 className="font-display text-headline-md text-brand-dark mb-6">Our Mission</h2>
            <p className="font-body text-body-lg text-ink-muted leading-relaxed">
              To become one of Asia's most trusted Digital Transformation companies, empowering enterprises
              through robust software architectures, AI-driven insights, and a culture of relentless
              engineering excellence.
            </p>
          </div>
          <div>
            <h2 className="font-display text-headline-md text-brand-dark mb-6">Our Vision</h2>
            <p className="font-body text-body-lg text-ink-muted leading-relaxed">
              To orchestrate a future where technology and human ingenuity converge seamlessly, creating a
              digital ecosystem that is secure, sustainable, and universally accessible.
            </p>
          </div>
        </Reveal>
        <Reveal from="right" className="relative">
          <div className="aspect-square rounded-xl overflow-hidden shadow-2xl relative">
            <img
              className="w-full h-full object-cover"
              alt="A professional high-tech workspace with engineers collaborating around multiple screens"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPH3ptHIs_pevaJLg33kNzZilIxRnSf3dxZtsfP73hzZjiL0QyUy3P2_1AZIjWVjKizbvmotz69u5ujUixfsrdbfX6LUNNvdBEGN_8LhgcYUxz1Kz8sP6mkGR2haK6yEVOoZvAUkRgXV1EneNZv9gwtzaBaqGBRB3XboGO_2ByMDwjDe1pAR8DCZiDq2IuVHhZbTKflunSf2I98Wdj6ixcT8_SyfUhQad1SEs9oqOLSaMvU9UyOv7X"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent" />
          </div>
          <div className="absolute -bottom-10 -left-10 glass-panel-light p-6 rounded-lg hidden lg:block max-w-xs animate-float">
            <p className="font-label-caps text-label-caps text-brand mb-2 italic">
              "Precision in every line of code."
            </p>
            <p className="text-xs text-ink-muted">— CoreFusion Engineering Standards</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
