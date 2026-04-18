import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Move, Eye, EyeOff, Settings, RotateCw } from "lucide-react";

interface PosterFieldBuilderProps {
  selectedFields: any[];
  onFieldsChange: (fields: any[]) => void;
  posterWidth: number;
  posterHeight: number;
  onSizeChange: (width: number, height: number) => void;
}

// Available field definitions
const AVAILABLE_FIELDS = [
  { id: 'title', label: 'Plan Name', description: 'Main plan title' },
  { id: 'badge', label: 'Badge', description: 'POPULAR, BEST VALUE etc.' },
  { id: 'price', label: 'Price', description: 'Total amount' },
  { id: 'duration', label: 'Duration', description: 'Number of days' },
  { id: 'perDay', label: 'Per Day', description: 'Daily value' },
  { id: 'features', label: 'Features', description: 'Plan features list' },
  { id: 'seller', label: 'Seller', description: 'Assigned seller info' },
  { id: 'footer', label: 'Footer', description: 'Dabba Delights branding' }
];

// Font families
const FONT_FAMILIES = [
  'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
];

// Text directions
const TEXT_DIRECTIONS = [
  { value: 'ltr', label: 'Left to Right (LTR)' },
  { value: 'rtl', label: 'Right to Left (RTL)' }
];

export default function PosterFieldBuilder({ 
  selectedFields, 
  onFieldsChange, 
  posterWidth, 
  posterHeight, 
  onSizeChange 
}: PosterFieldBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showFieldSettings, setShowFieldSettings] = useState(false);

  const selectedField = selectedFields.find(f => f.id === selectedFieldId);

  const toggleField = (fieldId: string) => {
    const updatedFields = selectedFields.map(field => 
      field.id === fieldId 
        ? { ...field, show: !field.show }
        : field
    );
    onFieldsChange(updatedFields);
  };

  const updateFieldProperty = (property: string, value: any) => {
    if (!selectedFieldId) return;
    
    const updatedFields = selectedFields.map(field => 
      field.id === selectedFieldId 
        ? { ...field, [property]: value }
        : field
    );
    onFieldsChange(updatedFields);
  };

  const addCustomField = () => {
    const newField = {
      id: `custom_${Date.now()}`,
      label: 'Custom Field',
      show: true,
      x: posterWidth / 2,
      y: posterHeight / 2,
      fontSize: 16,
      color: '#1f2937',
      bgColor: 'transparent',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontFamily: 'Arial',
      textDirection: 'ltr',
      isCustom: true
    };
    onFieldsChange([...selectedFields, newField]);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = selectedFields.filter(field => field.id !== fieldId);
    onFieldsChange(updatedFields);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
      setShowFieldSettings(false);
    }
  };

  const arrangeFields = (layout: 'horizontal' | 'vertical' | 'grid') => {
    const visibleFields = selectedFields.filter(f => f.show && !f.isCustom);
    const spacing = 60;
    
    if (layout === 'horizontal') {
      const startX = 50;
      const y = posterHeight / 2;
      visibleFields.forEach((field, index) => {
        updateFieldProperty('x', startX + (index * spacing));
        updateFieldProperty('y', y);
      });
    } else if (layout === 'vertical') {
      const x = posterWidth / 2;
      const startY = 80;
      visibleFields.forEach((field, index) => {
        updateFieldProperty('x', x);
        updateFieldProperty('y', startY + (index * spacing));
      });
    } else if (layout === 'grid') {
      const cols = 2;
      visibleFields.forEach((field, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = (posterWidth / (cols + 1)) * (col + 1);
        const y = 100 + (row * spacing);
        updateFieldProperty('x', x);
        updateFieldProperty('y', y);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Poster Size Settings */}
      <Card className="p-4">
        <Label className="mb-3 block">Poster Size</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Width (px)</Label>
            <Input
              type="number"
              value={posterWidth}
              onChange={(e) => onSizeChange(Number(e.target.value), posterHeight)}
              min="300"
              max="1200"
            />
          </div>
          <div>
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={posterHeight}
              onChange={(e) => onSizeChange(posterWidth, Number(e.target.value))}
              min="400"
              max="1600"
            />
          </div>
        </div>
      </Card>

      {/* Quick Arrange Fields */}
      <Card className="p-4">
        <Label className="mb-3 block">Quick Arrange Fields</Label>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => arrangeFields('horizontal')}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Horizontal
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => arrangeFields('vertical')}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Vertical
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => arrangeFields('grid')}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Grid 2x2
          </Button>
        </div>
      </Card>

      {/* Field Selection */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Select Fields to Display</Label>
          <Button onClick={addCustomField} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Add Custom
          </Button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={field.show}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {field.label || field.id}
                    {field.isCustom && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>}
                    {field.textDirection === 'rtl' && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">RTL</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {AVAILABLE_FIELDS.find(f => f.id === field.id)?.description || field.text}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFieldId(field.id);
                    setShowFieldSettings(true);
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {field.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteField(field.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Field Settings Panel */}
      {showFieldSettings && selectedField && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">
              Field Settings: {selectedField.label || selectedField.id}
            </Label>
            <Button variant="ghost" onClick={() => setShowFieldSettings(false)}>
              ×
            </Button>
          </div>
          
          <div className="space-y-4">
            {/* Custom Field Text */}
            {selectedField.isCustom && (
              <div>
                <Label>Text Content</Label>
                <Input
                  value={selectedField.text || ''}
                  onChange={(e) => updateFieldProperty('text', e.target.value)}
                  placeholder="Enter text..."
                />
              </div>
            )}

            {/* Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={selectedField.x || 0}
                  onChange={(e) => updateFieldProperty('x', Number(e.target.value))}
                  min="0"
                  max={posterWidth}
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={selectedField.y || 0}
                  onChange={(e) => updateFieldProperty('y', Number(e.target.value))}
                  min="0"
                  max={posterHeight}
                />
              </div>
            </div>

            {/* Font Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Font Size (px)</Label>
                <Input
                  type="number"
                  value={selectedField.fontSize || 16}
                  onChange={(e) => updateFieldProperty('fontSize', Number(e.target.value))}
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <Label>Font Family</Label>
                <Select
                  value={selectedField.fontFamily || 'Arial'}
                  onValueChange={(value) => updateFieldProperty('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Font Weight</Label>
                <Select
                  value={selectedField.fontWeight || 'normal'}
                  onValueChange={(value) => updateFieldProperty('fontWeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Font Style</Label>
                <Select
                  value={selectedField.fontStyle || 'normal'}
                  onValueChange={(value) => updateFieldProperty('fontStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="italic">Italic</SelectItem>
                    <SelectItem value="oblique">Oblique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Text Direction</Label>
                <Select
                  value={selectedField.textDirection || 'ltr'}
                  onValueChange={(value) => updateFieldProperty('textDirection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_DIRECTIONS.map(dir => (
                      <SelectItem key={dir.value} value={dir.value}>{dir.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedField.color || '#1f2937'}
                    onChange={(e) => updateFieldProperty('color', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={selectedField.color || '#1f2937'}
                    onChange={(e) => updateFieldProperty('color', e.target.value)}
                    placeholder="#1f2937"
                  />
                </div>
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedField.bgColor === 'transparent' ? '#ffffff' : selectedField.bgColor || '#ffffff'}
                    onChange={(e) => updateFieldProperty('bgColor', e.target.value)}
                    className="w-12 h-10 rounded border"
                  />
                  <Input
                    value={selectedField.bgColor || 'transparent'}
                    onChange={(e) => updateFieldProperty('bgColor', e.target.value)}
                    placeholder="transparent"
                  />
                </div>
              </div>
            </div>

            {/* Quick Position Templates */}
            <div>
              <Label>Quick Position</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFieldProperty('x', posterWidth / 2);
                    updateFieldProperty('y', 50);
                  }}
                >
                  Top Center
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFieldProperty('x', posterWidth / 2);
                    updateFieldProperty('y', posterHeight / 2);
                  }}
                >
                  Center
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFieldProperty('x', posterWidth / 2);
                    updateFieldProperty('y', posterHeight - 50);
                  }}
                >
                  Bottom Center
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
