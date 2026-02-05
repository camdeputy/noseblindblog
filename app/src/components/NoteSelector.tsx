'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { searchNotes } from '@/lib/api';
import { FragranceNote, NoteAssignment } from '@/types/fragrance';

interface NoteSelectorProps {
  notes: NoteAssignment[];
  onChange: (notes: NoteAssignment[]) => void;
}

const POSITIONS = ['top', 'middle', 'base'] as const;
const POSITION_LABELS: Record<string, string> = {
  top: 'Top Notes',
  middle: 'Middle Notes',
  base: 'Base Notes',
};

export default function NoteSelector({ notes, onChange }: NoteSelectorProps) {
  return (
    <div className="space-y-6">
      {POSITIONS.map((position) => (
        <NotePositionSection
          key={position}
          position={position}
          label={POSITION_LABELS[position]}
          notes={notes.filter((n) => n.position === position)}
          onAdd={(note) => {
            const positionNotes = notes.filter((n) => n.position === position);
            onChange([
              ...notes,
              { ...note, position, sort_order: positionNotes.length },
            ]);
          }}
          onRemove={(noteId, noteName) => {
            onChange(
              notes.filter(
                (n) => !(n.position === position && (n.note_id === noteId || n.note_name === noteName))
              )
            );
          }}
        />
      ))}
    </div>
  );
}

interface NotePositionSectionProps {
  position: 'top' | 'middle' | 'base';
  label: string;
  notes: NoteAssignment[];
  onAdd: (note: Omit<NoteAssignment, 'position' | 'sort_order'>) => void;
  onRemove: (noteId: string, noteName: string) => void;
}

function NotePositionSection({ position, label, notes, onAdd, onRemove }: NotePositionSectionProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FragranceNote[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchNotes(query);
        // Filter out notes already added in this position
        const existingIds = new Set(notes.map((n) => n.note_id));
        const existingNames = new Set(notes.map((n) => n.note_name.toLowerCase()));
        setSuggestions(
          results.filter((r) => !existingIds.has(r.id) && !existingNames.has(r.name.toLowerCase()))
        );
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, notes]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectExisting(note: FragranceNote) {
    onAdd({ note_id: note.id, note_name: note.name });
    setQuery('');
    setShowSuggestions(false);
  }

  function handleAddNew() {
    if (!query.trim()) return;
    onAdd({ note_id: '', note_name: query.trim() });
    setQuery('');
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectExisting(suggestions[0]);
      } else if (query.trim()) {
        handleAddNew();
      }
    }
  }

  const positionColors = {
    top: 'bg-accent/20 text-primary border-accent/30',
    middle: 'bg-secondary/10 text-primary border-secondary/20',
    base: 'bg-tertiary text-primary border-tertiary',
  };

  return (
    <div>
      <p className="text-sm font-medium text-primary mb-2">{label}</p>

      {/* Existing notes as chips */}
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {notes.map((note, i) => (
            <span
              key={`${note.note_id || note.note_name}-${i}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${positionColors[position]}`}
            >
              {note.note_name}
              <button
                type="button"
                onClick={() => onRemove(note.note_id, note.note_name)}
                className="hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search/add input */}
      <div ref={containerRef} className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={`Search or add ${position} note...`}
            className="flex-1 px-3 py-1.5 text-sm border border-secondary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={handleAddNew}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-secondary/20 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => handleSelectExisting(note)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-tertiary/30 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="font-medium text-primary">{note.name}</span>
                {note.description && (
                  <span className="text-primary/50 ml-2">{note.description}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
