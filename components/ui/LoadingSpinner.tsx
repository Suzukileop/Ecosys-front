interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Chargement">
      <div
        className={`${sizeClasses[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
    </div>
  );
}
