// An archway made from a pipe bend, with a flame inside: the gate, the plumbing and the heating.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="currentColor" d="M5 46V23a19 19 0 0 1 38 0v23H33V23a9 9 0 0 0-18 0v23Z" />
      <rect fill="currentColor" x="2" y="41" width="16" height="5" />
      <rect fill="currentColor" x="30" y="41" width="16" height="5" />
      <path fill="#b5622b" d="M24 25c.7 3.2 4.6 5 4.6 10.2a4.6 4.6 0 0 1-9.2 0c0-2.2 1-3.700 2-4.800.2 1.400.8 2.200 1.700 2.400-.4-2.600 0-5.300.9-7.800Z" />
    </svg>
  );
}
