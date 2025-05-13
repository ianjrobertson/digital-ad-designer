import { useState } from 'react';
import styled from 'styled-components';
import { DesignCanvas } from './components/Canvas/DesignCanvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import type { Tool } from './components/Toolbar/Toolbar';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Header = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #333;
`;

function App() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [currentColor, setCurrentColor] = useState('#000000');

  return (
    <AppContainer>
      <Header>
        <Title>Advark</Title>
        <Toolbar
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          currentColor={currentColor}
          onColorChange={setCurrentColor}
        />
      </Header>
      <DesignCanvas 
        width={900} 
        height={600}
        activeTool={activeTool}
        currentColor={currentColor}
      />
    </AppContainer>
  );
}

export default App;
