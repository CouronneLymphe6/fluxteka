export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Chargement"
      />
    </div>
  );
}
