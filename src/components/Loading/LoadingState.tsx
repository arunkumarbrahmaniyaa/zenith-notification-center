export const LoadingState = () => {
  return (
    <div className="znc-loading" role="status" aria-live="polite">
      <span className="znc-spinner" aria-hidden="true" />
      <span>Loading notifications...</span>
    </div>
  );
};
