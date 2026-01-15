import React from 'react';

interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  isEditing: boolean;
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  buttonLabel?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onChange,
  isEditing,
  onAddItem,
  onRemoveItem,
  buttonLabel = 'Add Item'
}) => {
  const handleItemChange = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (onRemoveItem) {
      onRemoveItem(index);
    } else {
      const updated = items.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem();
    } else {
      onChange([...items, '']);
    }
  };

  return isEditing ? (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-3 items-start">
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#202434] text-sm lg:text-base text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={() => handleRemoveItem(index)}
            className="text-slate-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ))}
      <button
        onClick={handleAddItem}
        className="text-primary hover:text-blue-700 font-medium text-sm mt-2 flex items-center gap-1"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
        {buttonLabel}
      </button>
    </div>
  ) : (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-sm lg:text-base text-slate-600 dark:text-slate-400">
          <span className="text-primary font-bold mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default EditableList;

