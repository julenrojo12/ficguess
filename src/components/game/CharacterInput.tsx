import { useState, useRef, useEffect } from 'react';
import type { Character } from '../../types/game.types';
import styles from './CharacterInput.module.css';

interface CharacterInputProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CharacterInput({
  characters,
  onSelect,
  disabled = false,
  placeholder = 'Escribe el nombre de un personaje...',
}: CharacterInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filteredCharacters = query
    ? characters.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = isOpen && filteredCharacters.length > 0;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCharacters.length]);

  const handleSelect = (character: Character) => {
    onSelect(character);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCharacters.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCharacters[highlightedIndex]) {
          handleSelect(filteredCharacters[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={styles.input}
          autoComplete="off"
        />
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {showDropdown && (
        <ul ref={listRef} className={styles.dropdown}>
          {filteredCharacters.map((character, index) => (
            <li
              key={character.id}
              className={`${styles.option} ${
                index === highlightedIndex ? styles.highlighted : ''
              }`}
              onClick={() => handleSelect(character)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {character.image_url ? (
                <img
                  src={character.image_url}
                  alt=""
                  className={styles.optionImage}
                />
              ) : (
                <div className={styles.optionImagePlaceholder}>
                  {character.name.charAt(0)}
                </div>
              )}
              <span className={styles.optionName}>{character.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
