'use client';

import {
  ELEMENT_COLORS,
  ELEMENT_DESCRIPTIONS,
  ELEMENT_NAMES,
} from '@/lib/element-system';
import { ElementType } from '@/types/game';
import React from 'react';
import styled from 'styled-components';

interface ElementButtonProps {
  element: ElementType;
  isSelected: boolean;
  onClick: () => void;
}

const Button = styled.button<{ $color: string; $isSelected: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${(props) => (props.$isSelected ? '#ffd700' : '#8B4513')};
  background: linear-gradient(
    135deg,
    ${(props) => props.$color}dd,
    ${(props) => props.$color}bb
  );
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: ${(props) =>
    props.$isSelected
      ? `0 0 20px ${props.$color}88, 0 8px 16px rgba(0,0,0,0.2)`
      : '0 4px 8px rgba(0,0,0,0.1)'};

  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 0 30px ${(props) => props.$color}88,
      0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: #ffd700;
  }

  &:active {
    transform: scale(0.95);
  }

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, #ffd700, transparent, #ffd700);
    opacity: ${(props) => (props.$isSelected ? 1 : 0)};
    animation: ${(props) =>
      props.$isSelected ? 'runeGlow 2s infinite' : 'none'};
    z-index: -1;
  }

  @keyframes runeGlow {
    0%,
    100% {
      opacity: 0.3;
      transform: rotate(0deg);
    }
    50% {
      opacity: 0.8;
      transform: rotate(180deg);
    }
  }
`;

const Tooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  max-width: 200px;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
  transition: all 0.2s ease;
  z-index: 10;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.9);
  }
`;

const ElementSymbol = styled.span`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

export function ElementButton({
  element,
  isSelected,
  onClick,
}: ElementButtonProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        $color={ELEMENT_COLORS[element]}
        $isSelected={isSelected}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <ElementSymbol>{ELEMENT_NAMES[element]}</ElementSymbol>
      </Button>

      <Tooltip $visible={showTooltip}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {ELEMENT_NAMES[element]} ({element})
        </div>
        <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
          {ELEMENT_DESCRIPTIONS[element]}
        </div>
      </Tooltip>
    </div>
  );
}
