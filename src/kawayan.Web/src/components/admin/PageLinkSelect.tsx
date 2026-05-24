const links = [
  { value: '/', label: 'Home page' },
  { value: '/about', label: 'About us page' },
  { value: '/services', label: 'Services page' },
  { value: '/contact', label: 'Contact page' },
];

export function PageLinkSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const match = links.find((l) => l.value === value);
  return (
    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={match ? value : '/contact'} onChange={(e) => onChange(e.target.value)}>
      {links.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
