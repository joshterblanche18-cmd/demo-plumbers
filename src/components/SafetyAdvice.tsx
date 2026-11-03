import { useId } from "react";
import { location } from "@/config/location";

type Props = { className?: string; headingClassName?: string };

// Official advice, summarised from SGN. See src/config/location.ts for the sources.
export function SafetyAdvice({ className, headingClassName }: Props) {
  const { gasEmergency, lifeEmergency } = location;
  const headingId = useId();
  return (
    <aside className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className={headingClassName}>
        Smell gas, or think it could be carbon monoxide?
      </h2>
      <p>
        Open doors and windows and get everyone into fresh air. Turn off the gas at the meter if you
        can, but do not go into a cellar. Do not smoke, light a flame or touch electrical switches.
      </p>
      <p>
        Call the {gasEmergency.name} free, day or night:{" "}
        <a href={`tel:${gasEmergency.tel}`}>{gasEmergency.display}</a>. If someone has collapsed,
        call <a href={`tel:${lifeEmergency.tel}`}>{lifeEmergency.display}</a>.
      </p>
      <p>That number is real. Everything else on this site is fictional.</p>
    </aside>
  );
}
