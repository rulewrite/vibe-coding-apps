'use client';

import { ElementType } from '@/types/game';
import React, { useState } from 'react';
import styled from 'styled-components';
import { ElementButton } from './ElementButton';

interface PlayerFormProps {
  onSubmit: (
    name: string,
    element: ElementType | null,
    isRandom: boolean
  ) => void;
}

const FormContainer = styled.div`
  background: rgba(139, 69, 19, 0.1);
  border: 2px solid #8b4513;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h3`
  color: #8b4513;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #8b4513;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #8b4513;
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  &::placeholder {
    color: #999;
  }
`;

const ElementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  justify-items: center;
`;

const RandomCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: #8b4513;
  }

  label {
    color: #8b4513;
    font-size: 14px;
    cursor: pointer;
  }
`;

const SubmitButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 14px 20px;
  background: ${(props) =>
    props.$disabled
      ? 'linear-gradient(135deg, #ccc, #999)'
      : 'linear-gradient(135deg, #8B4513, #A0522D)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const elements: ElementType[] = [
  'fire',
  'water',
  'wood',
  'metal',
  'earth',
  'wind',
];

export function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );
  const [isRandom, setIsRandom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), selectedElement, isRandom);
      setName('');
      setSelectedElement(null);
      setIsRandom(false);
    }
  };

  const isValid = name.trim() && (selectedElement || isRandom);

  return (
    <FormContainer>
      <Title>연금술사 등록</Title>

      <form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="playerName">이름</Label>
          <NameInput
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="연금술사의 이름을 입력하세요"
            maxLength={12}
          />
        </InputGroup>

        <InputGroup>
          <Label>원소 선택</Label>
          <ElementGrid>
            {elements.map((element) => (
              <ElementButton
                key={element}
                element={element}
                isSelected={selectedElement === element && !isRandom}
                onClick={() => {
                  setSelectedElement(element);
                  setIsRandom(false);
                }}
              />
            ))}
          </ElementGrid>
        </InputGroup>

        <RandomCheckbox>
          <input
            type="checkbox"
            id="randomElement"
            checked={isRandom}
            onChange={(e) => {
              setIsRandom(e.target.checked);
              if (e.target.checked) {
                setSelectedElement(null);
              }
            }}
          />
          <label htmlFor="randomElement">무작위 원소 선택</label>
        </RandomCheckbox>

        <SubmitButton type="submit" $disabled={!isValid}>
          참가하기
        </SubmitButton>
      </form>
    </FormContainer>
  );
}
