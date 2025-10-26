import { ButtonHTMLAttributes } from 'react';

type ControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export default function ControlButton({ label, ...props }: ControlButtonProps) {
  return (
    <button
      {...props}
      className={`px-3 py-2 bg-[#E7DBFD] hover:bg-white disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed
        text-black font-normal rounded-lg transition-all text-xs md:text-sm flex-1 min-w-[120px]
        hover:-translate-y-0.5 hover:shadow-lg ${props.className ?? ''}`}
    >
      {label}
    </button>
  );
}
