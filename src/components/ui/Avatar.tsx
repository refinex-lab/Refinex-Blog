type AvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
};

export const Avatar = ({ src, alt, fallback }: AvatarProps) => {
  return (
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/80 text-xl font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};
