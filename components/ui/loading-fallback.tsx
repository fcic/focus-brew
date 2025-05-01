import { Skeleton } from "./skeleton";

interface LoadingFallbackProps {
  variant?: "default" | "app" | "minimal";
}

export function LoadingFallback({ variant = "default" }: LoadingFallbackProps) {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[100px]">
        <div className="relative h-10 w-10">
          <div className="absolute animate-ping h-10 w-10 rounded-full bg-primary/10"></div>
          <div className="relative animate-pulse h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "app") {
    return (
      <div className="flex flex-col space-y-4 p-4 w-full h-full">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="circular" className="h-8 w-8" />
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton variant="text" className="h-4" />
          <Skeleton variant="text" className="h-4" />
          <Skeleton variant="text" className="h-4 w-3/4" />
        </div>
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full h-full p-6 items-center justify-center opacity-70 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70"></div>
      <div className="flex flex-col items-center space-y-2">
        <Skeleton variant="text" className="h-4 w-24" />
        <Skeleton variant="text" className="h-3 w-32" />
      </div>
    </div>
  );
}
