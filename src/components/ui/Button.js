export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  useCustomClasses = false,
  style = {}
}) {
  // If useCustomClasses is true, only use base classes and custom className
  if (useCustomClasses) {
    const baseClasses = '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
    return (
      <button
        type={type}
        className={`${baseClasses} ${disabledClasses} ${className}`}
        onClick={onClick}
        disabled={disabled}
        style={style}
      >
        {children}
      </button>
    );
  }

  // Default behavior with variants and sizes
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#103358] text-white hover:bg-[#0a2544] focus:ring-[#103358] shadow-sm hover:shadow-md border border-[#103358]',
    secondary: 'bg-white text-[#103358] border border-[#103358] hover:bg-[#E3F3FF] focus:ring-[#103358] shadow-sm hover:shadow-md',
    outline: 'bg-transparent text-[#103358] border border-[#103358] hover:bg-[#103358] hover:text-white focus:ring-[#103358]',
    ghost: 'bg-transparent text-[#103358] hover:bg-[#E3F3FF] focus:ring-[#103358]',
    google: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300 shadow-sm hover:shadow-md',
    apple: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 shadow-sm hover:shadow-md'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs h-6',
    small: 'px-3 py-2 text-sm h-8',
    default: 'px-4 py-2 text-sm h-10',
    large: 'px-6 py-3 text-base h-12',
    xl: 'px-8 py-4 text-lg h-14'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}