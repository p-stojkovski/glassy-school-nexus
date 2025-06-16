import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            'group toast backdrop-blur-md border rounded-xl shadow-xl p-4 min-w-80 transition-all duration-300 ease-in-out group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-white/10 group-[.toaster]:to-white/5',
          description: 'group-[.toast]:text-white/80 mt-1',
          actionButton:
            'group-[.toast]:bg-blue-500 group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-blue-600',
          cancelButton:
            'group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:hover:bg-white/20',
          title:
            'group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-base',
          closeButton:
            'group-[.toast]:text-white/60 group-[.toast]:hover:text-white group-[.toast]:transition-colors',
          // Custom styles for different toast types
          success:
            'border-green-500/30 from-green-500/20 to-green-500/10 shadow-green-500/5',
          error:
            'border-red-500/30 from-red-500/20 to-red-500/10 shadow-red-500/5',
          warning:
            'border-yellow-500/30 from-yellow-500/20 to-yellow-500/10 shadow-yellow-500/5',
          info: 'border-blue-500/30 from-blue-500/20 to-blue-500/10 shadow-blue-500/5',
          // Add loading animation
          loading:
            'border-purple-500/30 from-purple-500/20 to-purple-500/10 shadow-purple-500/5',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
