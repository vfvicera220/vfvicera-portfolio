import React from 'react';

interface SectionHeaderProps {
  title: string;
  color?: {
    from: string;
    via: string;
    to: string;
  };
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, color }) => {
  const gradientStyles = {
    background: `linear-gradient(to right, ${color?.from ?? '#93C5FD'}, ${color?.via ?? '#60A5FA'}, ${color?.to ?? '#A78BFA'})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div className="text-center p-4">
      <h2
        style={gradientStyles}
        className="text-4xl sm:text-5xl font-extrabold tracking-normal"
      >
        {title}
      </h2>
    </div>
  );
};

export default SectionHeader;
