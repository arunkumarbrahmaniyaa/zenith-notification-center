interface EmptyStateProps {
  title: string;
  description?: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="znc-empty" role="status" aria-live="polite">
      <h4>{title}</h4>
      {description ? <p>{description}</p> : null}
    </div>
  );
};
