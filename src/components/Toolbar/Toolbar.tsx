import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDownLeftRight, faSquare, faCircle, faTextHeight, faImage } from '@fortawesome/free-solid-svg-icons';

const ToolbarContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 5px;
  padding: 5px;
  border-right: 1px solid #eee;
  
  &:last-child {
    border-right: none;
  }
`;

const ToolButton = styled.button<{ active?: boolean }>`
  padding: 8px;
  border: 1px solid ${props => props.active ? '#1a73e8' : '#ddd'};
  background: ${props => props.active ? '#e8f0fe' : 'white'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

export type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'image';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  currentColor: string;
}

export const Toolbar = ({ activeTool, onToolSelect, onColorChange, currentColor }: ToolbarProps) => {
  return (
    <ToolbarContainer>
      <ToolGroup>
        <ToolButton 
          active={activeTool === 'select'} 
          onClick={() => onToolSelect('select')}
          title="Bananas"
        >
          <FontAwesomeIcon icon={faArrowsUpDownLeftRight} style={{ color: 'black'}}/>
        </ToolButton>
      </ToolGroup>
      
      <ToolGroup>
        <ToolButton 
          active={activeTool === 'rectangle'} 
          onClick={() => onToolSelect('rectangle')}
          title="Rectangle"
        >
          <FontAwesomeIcon icon={faSquare} style={{ color: 'black'}}/>
        </ToolButton>
        <ToolButton 
          active={activeTool === 'circle'} 
          onClick={() => onToolSelect('circle')}
          title="Circle"
        >
          <FontAwesomeIcon icon={faCircle} style={{ color: 'black'}}/>
        </ToolButton>
      </ToolGroup>
      
      <ToolGroup>
        <ToolButton 
          active={activeTool === 'text'} 
          onClick={() => onToolSelect('text')}
          title="Text"
        >
          <FontAwesomeIcon icon={faTextHeight} style={{ color: 'black'}}/>
        </ToolButton>
        <ToolButton 
          active={activeTool === 'image'} 
          onClick={() => onToolSelect('image')}
          title="Image"
        >
          <FontAwesomeIcon icon={faImage} style={{ color: 'black'}}/>
        </ToolButton>
      </ToolGroup>
      
      <ToolGroup>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          title="Color Picker"
          style={{ width: '40px', height: '34px', padding: '0', border: '1px solid #ddd' }}
        />
      </ToolGroup>
    </ToolbarContainer>
  );
};
