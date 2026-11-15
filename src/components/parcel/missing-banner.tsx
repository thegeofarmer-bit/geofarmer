import { Callout } from "@/components/ui/callout";
import { FACTOR_COUNT, type SuitabilityResult } from "@/lib/engine/suitability";

export function MissingBanner({ result }: { result: SuitabilityResult | undefined }) {
  if (!result || result.missing.length === 0) return null;
  const names = result.missing.map((m) => m.label);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
  const one = result.missing.length === 1;
  const used = FACTOR_COUNT - result.missing.length;
  return (
    <Callout tone="warn" icon="alert">
      <b>
        {result.missing.length} {one ? "value is" : "values are"} missing: {list}.
      </b>{" "}
      We did not guess {one ? "it" : "them"}.{" "}
      {used > 0 ? `Scores use the other ${used === 1 ? "factor" : `${used} factors`}.` : "No crop can be scored yet."}
    </Callout>
  );
}
