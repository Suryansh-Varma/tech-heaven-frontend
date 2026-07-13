'use client';

interface Props {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ prompts, onSelect }: Props) {
  return (
    <div className="px-4 pb-3">
      <p className="text-xs text-gray-400 mb-2 font-medium">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-all duration-150 flex items-center gap-1.5"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
