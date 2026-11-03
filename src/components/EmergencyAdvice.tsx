import { location } from "@/config/location";
import type { Emergency } from "@/lib/chat/safety";

// Official advice, not AI. Sources, checked 3 November 2026:
// Gas and carbon monoxide: SGN, see src/config/location.ts.
// Fire: Scottish Fire and Rescue Service, https://www.firescotland.gov.uk/at-home/escape-plan/
// Flooding and electrics: Electrical Safety First,
// https://www.electricalsafetyfirst.org.uk/guidance/safety-around-the-home/flooding-advice/
export function EmergencyAdvice({ kind, className }: { kind: Emergency; className?: string }) {
  const { gasEmergency, lifeEmergency } = location;
  const call999 = <a href={`tel:${lifeEmergency.tel}`}>{lifeEmergency.display}</a>;

  if (kind === "gas") {
    return (
      <div className={className}>
        <p><strong>This could be dangerous. Please act now.</strong></p>
        <p>Open doors and windows and get everyone into fresh air. Turn off the gas at the meter if you can, but do not go into a cellar. Do not smoke, light a flame or touch electrical switches.</p>
        <p>Call the {gasEmergency.name} free, day or night: <a href={`tel:${gasEmergency.tel}`}>{gasEmergency.display}</a>.</p>
        <p>If you may have breathed carbon monoxide, get medical help, even if you feel better outside. If someone has collapsed, call {call999}.</p>
        <p>These numbers are real. This firm is fictional, so it cannot help you.</p>
      </div>
    );
  }
  if (kind === "fire") {
    return (
      <div className={className}>
        <p><strong>Get out, stay out, and call {call999}.</strong></p>
        <p>Do not try to fight the fire or collect belongings. Close doors behind you. Call {call999} as soon as you are safe, and never go back inside.</p>
        <p>This number is real. This firm is fictional, so it cannot help you.</p>
      </div>
    );
  }
  return (
    <div className={className}>
      <p><strong>Water and electricity are dangerous together. Please stay clear.</strong></p>
      <p>Do not touch switches, sockets or appliances while standing in water, and keep away from exposed wiring. Turn the power off at the fuse box only if it is safe to reach and dry. If it is wet or damaged, do not touch it.</p>
      <p>Get a registered electrician to check it before using the power again. If anyone is in danger, call {call999}.</p>
      <p>This number is real. This firm is fictional, so it cannot help you.</p>
    </div>
  );
}
