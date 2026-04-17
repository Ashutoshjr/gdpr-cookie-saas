import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'What is GDPR and why do I need a cookie banner?',
    a: 'GDPR (General Data Protection Regulation) is EU law that requires websites to obtain explicit consent before setting non-essential cookies. Without a compliant consent mechanism, you risk fines of up to €20 million or 4% of annual turnover.',
  },
  {
    q: 'Does this work with any website or CMS?',
    a: 'Yes. CookieConsent is a single JavaScript snippet that works on any website — WordPress, Shopify, Squarespace, custom code, or any framework. If your site can load a `<script>` tag, it works.',
  },
  {
    q: 'How does script blocking work?',
    a: 'You add `type="text/plain"` and `data-category="analytics"` to any third-party script you want blocked. Our SDK keeps these scripts dormant until the user consents to that category, then activates them dynamically.',
  },
  {
    q: 'Where is consent data stored?',
    a: 'All consent data is stored on EU-based servers. Each record includes timestamp, IP address (anonymized), user agent, session ID, and the exact categories the user consented to or rejected. You own your data.',
  },
  {
    q: 'What counts toward my monthly consent limit?',
    a: 'Each time a visitor submits a consent decision (accept all, reject all, or custom preferences) it counts as one consent record. Returning visitors whose stored consent is still valid do not count again.',
  },
  {
    q: 'Do I need to show the banner to users outside the EU?',
    a: 'No — with Geo-Restriction enabled, the banner only appears for visitors in EU/EEA countries. Visitors from outside this region see your site normally without any interruption.',
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-600">
            Legal compliance shouldn&apos;t require a lawyer to understand.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm data-[state=open]:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
