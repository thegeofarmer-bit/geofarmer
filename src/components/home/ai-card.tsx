import { OpenAssistantButton } from "@/components/assistant/open-assistant";
import { Icon } from "@/components/ui/icon";

const QUESTIONS = [
  "How is crop suitability calculated?",
  "Which data comes from NASA?",
  "How does the rotation advice work?",
];

export function AiCard() {
  return (
    <section className="mb-6 rounded-3xl border-2 border-brand bg-brand-soft p-5">
      <p className="flex items-center gap-2 text-xl font-extrabold">
        <Icon name="assistant" size={24} className="text-brand" /> GeoFarmer AI
      </p>
      <p className="mt-1 max-w-2xl">
        Ask questions in plain language. Answers come only from GeoFarmer&apos;s data and rules, and every answer is
        checked against the data before you see it.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <OpenAssistantButton key={q} label={q} question={q} className="bg-surface" />
        ))}
      </div>
    </section>
  );
}
