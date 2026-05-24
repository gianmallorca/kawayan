export function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold shrink-0">
      {initials}
    </div>
  );
}
