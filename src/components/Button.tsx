import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'glass';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
        secondary: "bg-gray-700 text-white hover:bg-gray-600",
        glass: "glass hover:bg-white/20 text-white hover:text-white border border-white/20",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        />
    );
}
