export const BellIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3a6 6 0 0 0-6 6v3.6L4.5 15a1 1 0 0 0 .75 1.66h13.5A1 1 0 0 0 19.5 15L18 12.6V9a6 6 0 0 0-6-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
};
