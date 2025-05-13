import { Stage, Layer, Rect, Circle, Text, Image } from 'react-konva';
import { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Tool } from '../Toolbar/Toolbar';
import { loadImage } from '../../utils/imageUtils';
import Konva from 'konva';

const CanvasContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;

interface DesignElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  text?: string;
  imageElement?: HTMLImageElement;
}

interface DesignCanvasProps {
  width: number;
  height: number;
  activeTool: Tool;
  currentColor: string;
}

export const DesignCanvas = ({ width, height, activeTool, currentColor }: DesignCanvasProps) => {
  const [scale, setScale] = useState(1);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: pointer.x / oldScale - stage.x() / oldScale,
      y: pointer.y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: -(mousePointTo.x - pointer.x / newScale) * newScale,
      y: -(mousePointTo.y - pointer.y / newScale) * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    setStartPos(pos);

    if (activeTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        setElements(prev => [...prev, {
          id: Date.now().toString(),
          type: 'text' as const,
          x: pos.x,
          y: pos.y,
          fill: currentColor,
          text
        }]);
      }
      setIsDrawing(false);
    } else if (activeTool === 'image') {
      fileInputRef.current?.click();
      setIsDrawing(false);
    }
  }, [activeTool, currentColor]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || activeTool === 'select' || activeTool === 'text') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setElements(prev => {
      const lastElement = prev[prev.length - 1];
      if (!lastElement) return prev;

      const newElements = [...prev];
      if (activeTool === 'rectangle') {
        newElements[prev.length - 1] = {
          ...lastElement,
          width: pos.x - startPos.x,
          height: pos.y - startPos.y
        };
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        newElements[prev.length - 1] = {
          ...lastElement,
          radius
        };
      }
      return newElements;
    });
  }, [isDrawing, activeTool, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || activeTool === 'select') return;
    setIsDrawing(false);
  }, [isDrawing, activeTool]);

  const initializeShape = useCallback((): DesignElement | null => {
    if (activeTool === 'rectangle') {
      return {
        id: Date.now().toString(),
        type: 'rectangle' as const,
        x: startPos.x,
        y: startPos.y,
        width: 0,
        height: 0,
        fill: currentColor
      };
    } else if (activeTool === 'circle') {
      return {
        id: Date.now().toString(),
        type: 'circle' as const,
        x: startPos.x,
        y: startPos.y,
        radius: 0,
        fill: currentColor
      };
    }
    return null;
  }, [startPos, currentColor, activeTool]);

  const handleStageMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    handleMouseDown(e);
    if (activeTool !== 'select' && activeTool !== 'text') {
      const newShape = initializeShape();
      if (newShape) {
        setElements(prev => [...prev, newShape]);
      }
    }
  }, [handleMouseDown, activeTool, initializeShape]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const img = await loadImage(file);
      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition() || { x: 50, y: 50 };
      const aspectRatio = img.width / img.height;
      const width = 200;
      const height = width / aspectRatio;

      setElements(prev => [...prev, {
        id: Date.now().toString(),
        type: 'image' as const,
        x: pos.x,
        y: pos.y,
        width,
        height,
        fill: 'transparent',
        imageElement: img
      }]);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const stageRef = useRef<Konva.Stage>(null);

  return (
    <CanvasContainer>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        draggable={activeTool === 'select'}
        scale={{ x: scale, y: scale }}
      >
        <Layer>
          {elements.map((element) => {
            if (element.type === 'rectangle') {
              return (
                <Rect
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width || 0}
                  height={element.height || 0}
                  fill={element.fill}
                  draggable={activeTool === 'select'}
                />
              );
            } else if (element.type === 'circle') {
              return (
                <Circle
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  radius={element.radius || 0}
                  fill={element.fill}
                  draggable={activeTool === 'select'}
                />
              );
            } else if (element.type === 'text') {
              return (
                <Text
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  text={element.text || ''}
                  fill={element.fill}
                  fontSize={20}
                  draggable={activeTool === 'select'}
                />
              );
            } else if (element.type === 'image' && element.imageElement) {
              return (
                <Image
                  key={element.id}
                  x={element.x}
                  y={element.y}
                  image={element.imageElement}
                  width={element.width}
                  height={element.height}
                  draggable={activeTool === 'select'}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </CanvasContainer>
  );
};
