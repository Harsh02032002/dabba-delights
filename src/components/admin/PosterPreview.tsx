import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Settings, Image as ImageIcon, Type } from "lucide-react";

interface PosterPreviewProps {
  planData: any;
  onCustomFieldAdd?: (field: any) => void;
}

// Available field definitions with auto-population
const AVAILABLE_FIELDS = [
  { id: 'title', label: 'Plan Name', description: 'Main plan title', required: true },
  { id: 'badge', label: 'Badge', description: 'POPULAR, BEST VALUE etc.', required: false },
  { id: 'price', label: 'Price', description: 'Total amount', required: true },
  { id: 'duration', label: 'Duration', description: 'Number of days', required: true },
  { id: 'perDay', label: 'Per Day', description: 'Daily value', required: true },
  { id: 'features', label: 'Features', description: 'Plan features list', required: true },
  { id: 'seller', label: 'Seller', description: 'Assigned seller info', required: false },
  { id: 'footer', label: 'Footer', description: 'Dabba Delights branding', required: false }
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

export default function PosterPreview({ planData, onCustomFieldAdd }: PosterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFields, setSelectedFields] = useState<any[]>([]);
  const [extraImages, setExtraImages] = useState<any[]>([]);
  const [customTexts, setCustomTexts] = useState<any[]>([]);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  // Initialize fields with auto-population
  useEffect(() => {
    const initialFields = AVAILABLE_FIELDS.map(field => {
      const existingField = planData.poster_selected_fields?.find((f: any) => f.id === field.id);
      return existingField || {
        id: field.id,
        label: field.label,
        show: field.required || true, // Auto-show required fields
        x: 200,
        y: 80 + (AVAILABLE_FIELDS.indexOf(field) * 60),
        fontSize: field.id === 'title' ? 32 : field.id === 'price' ? 42 : 18,
        color: field.id === 'badge' ? '#ef4444' : field.id === 'price' ? '#059669' : '#1f2937',
        bgColor: 'transparent',
        fontWeight: field.id === 'title' || field.id === 'price' ? 'bold' : 'normal',
        fontStyle: 'normal',
        fontFamily: 'Arial',
        textDirection: 'ltr',
        isCustom: false,
        required: field.required
      };
    });
    
    // Add custom fields if they exist
    if (planData.poster_custom_fields) {
      planData.poster_custom_fields.forEach((field: any) => {
        initialFields.push({
          ...field,
          isCustom: true,
          show: true
        });
      });
    }
    
    setSelectedFields(initialFields);
    
    // Initialize extra images
    if (planData.poster_extra_images) {
      setExtraImages(planData.poster_extra_images.map((img: any, index: number) => ({
        id: `img_${index}`,
        url: img.url,
        x: 50 + (index * 100),
        y: 50 + (index * 50),
        width: 100,
        height: 100,
        opacity: 1
      })));
    }
  }, [planData]);

  // Draw poster on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = planData.poster_width || 400;
    canvas.height = planData.poster_height || 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (planData.poster_bg_image) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawAllElements(ctx);
      };
      img.src = planData.poster_bg_image;
    } else {
      // Solid color background
      ctx.fillStyle = planData.poster_bg_color || '#6366f1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawAllElements(ctx);
    }
  }, [planData, selectedFields, extraImages, customTexts]);

  const drawAllElements = (ctx: CanvasRenderingContext2D) => {
    // Draw extra images
    extraImages.forEach((img) => {
      if (img.url) {
        const image = new Image();
        image.onload = () => {
          ctx.globalAlpha = img.opacity || 1;
          ctx.drawImage(image, img.x || 0, img.y || 0, img.width || 100, img.height || 100);
          ctx.globalAlpha = 1;
        };
        image.src = img.url;
      }
    });

    // Draw all fields
    selectedFields.forEach((field) => {
      if (!field.show) return;
      
      let text = '';
      switch (field.id) {
        case 'title': text = planData.plan_name || 'Plan Name'; break;
        case 'badge': text = planData.badge || 'POPULAR'; break;
        case 'price': text = `₹${planData.total_amount || '0'}`; break;
        case 'duration': text = `${planData.total_days || '0'} Days`; break;
        case 'perDay': text = `₹${planData.per_day_value || '0'}/day`; break;
        case 'features': text = planData.features || 'Features'; break;
        case 'seller': text = planData.seller_name || 'Dabba Delights'; break;
        case 'footer': text = '© Dabba Delights'; break;
        default: text = field.text || ''; break;
      }
      
      drawField(ctx, field, text);
    });

    // Draw custom texts
    customTexts.forEach((text) => {
      drawField(ctx, text, text.content);
    });
  };

  const drawField = (ctx: CanvasRenderingContext2D, field: any, text: string) => {
    const x = field.x || 200;
    const y = field.y || 100;
    const fontSize = field.fontSize || 16;
    const color = field.color || '#1f2937';
    const bgColor = field.bgColor || 'transparent';
    const fontWeight = field.fontWeight || 'normal';
    const fontStyle = field.fontStyle || 'normal';
    const fontFamily = field.fontFamily || 'Arial';
    const textDirection = field.textDirection || 'ltr';

    // Set text direction
    ctx.direction = textDirection;

    // Draw background if not transparent
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      const metrics = ctx.measureText(text);
      const padding = 8;
      const bgX = x - metrics.width / 2 - padding;
      const bgY = y - fontSize - padding;
      const bgWidth = metrics.width + padding * 2;
      const bgHeight = fontSize + padding * 2;
      
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
      ctx.fill();
    }

    // Draw text
    ctx.fillStyle = color;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a field
    const clickedField = selectedFields.find(field => {
      if (!field.show) return false;
      const fieldX = field.x || 200;
      const fieldY = field.y || 100;
      const fontSize = field.fontSize || 16;
      return Math.abs(x - fieldX) < 50 && Math.abs(y - fieldY) < fontSize;
    });

    if (clickedField) {
      setDraggedItem(clickedField);
    } else {
      // Check if clicking on an image
      const clickedImage = extraImages.find(img => {
        const imgX = img.x || 0;
        const imgY = img.y || 0;
        const imgWidth = img.width || 100;
        const imgHeight = img.height || 100;
        return x >= imgX && x <= imgX + imgWidth && y >= imgY && y <= imgY + imgHeight;
      });

      if (clickedImage) {
        setDraggedItem(clickedImage);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedItem.text !== undefined) {
      // It's a text field
      const updatedFields = selectedFields.map(field => 
        field.id === draggedItem.id 
          ? { ...field, x, y }
          : field
      );
      setSelectedFields(updatedFields);
    } else if (draggedItem.url !== undefined) {
      // It's an image
      const updatedImages = extraImages.map(img => 
        img.id === draggedItem.id 
          ? { ...img, x, y }
          : img
      );
      setExtraImages(updatedImages);
    }
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const toggleField = (fieldId: string) => {
    const updatedFields = selectedFields.map(field => 
      field.id === fieldId 
        ? { ...field, show: !field.show }
        : field
    );
    setSelectedFields(updatedFields);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = selectedFields.filter(field => field.id !== fieldId);
    setSelectedFields(updatedFields);
  };

  const addCustomText = () => {
    const newText = {
      id: `text_${Date.now()}`,
      content: 'Custom Text',
      x: 200,
      y: 300,
      fontSize: 18,
      color: '#1f2937',
      bgColor: 'transparent',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontFamily: 'Arial',
      textDirection: 'ltr',
      isCustom: true
    };
    setCustomTexts([...customTexts, newText]);
    onCustomFieldAdd?.(newText);
  };

  const deleteCustomText = (textId: string) => {
    const updatedTexts = customTexts.filter(text => text.id !== textId);
    setCustomTexts(updatedTexts);
  };

  const addExtraImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: `img_${Date.now()}`,
          url: event.target?.result as string,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          opacity: 1,
          file: file
        };
        setExtraImages([...extraImages, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteExtraImage = (imageId: string) => {
    const updatedImages = extraImages.filter(img => img.id !== imageId);
    setExtraImages(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Poster Controls (Auto-Fields & Drag-Drop)</h3>
        
        {/* Field Selection */}
        <div className="space-y-2 mb-4">
          <Label>Available Fields (Auto-populated)</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {selectedFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={field.show}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <span className="text-sm">{field.label}</span>
                  {field.required && <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Required</span>}
                  {field.textDirection === 'rtl' && <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">RTL</span>}
                </div>
                <div className="flex gap-1">
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
                  {!field.required && (
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button onClick={addCustomText} size="sm" variant="outline">
            <Type className="w-4 h-4 mr-1" />
            Add Text
          </Button>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={addExtraImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button size="sm" variant="outline">
              <ImageIcon className="w-4 h-4 mr-1" />
              Add Image
            </Button>
          </div>
        </div>

        {/* Extra Elements */}
        {(extraImages.length > 0 || customTexts.length > 0) && (
          <div className="space-y-2">
            <Label>Extra Elements</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {extraImages.map((img) => (
                <div key={img.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">Image</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExtraImage(img.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {customTexts.map((text) => (
                <div key={text.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{text.content}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCustomText(text.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Canvas with Drag & Drop */}
      <Card className="p-4">
        <Label className="mb-2 block">Poster Preview (Drag & Drop to position)</Label>
        <canvas
          ref={canvasRef}
          className="border-2 border-dashed border-gray-300 rounded cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </Card>

      {/* Field Settings Panel */}
      {showFieldSettings && selectedFieldId && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">Field Settings</Label>
            <Button variant="ghost" onClick={() => setShowFieldSettings(false)}>
              ×
            </Button>
          </div>
          
          {(() => {
            const field = selectedFields.find(f => f.id === selectedFieldId);
            if (!field) return null;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={field.x || 0}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, x: Number(e.target.value) }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={field.y || 0}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, y: Number(e.target.value) }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      value={field.fontSize || 16}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, fontSize: Number(e.target.value) }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Font Family</Label>
                    <select
                      value={field.fontFamily || 'Arial'}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, fontFamily: e.target.value }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                      className="w-full p-2 border rounded"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Font Weight</Label>
                    <select
                      value={field.fontWeight || 'normal'}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, fontWeight: e.target.value }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div>
                    <Label>Font Style</Label>
                    <select
                      value={field.fontStyle || 'normal'}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, fontStyle: e.target.value }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="oblique">Oblique</option>
                    </select>
                  </div>
                  <div>
                    <Label>Text Direction</Label>
                    <select
                      value={field.textDirection || 'ltr'}
                      onChange={(e) => {
                        const updatedFields = selectedFields.map(f => 
                          f.id === selectedFieldId 
                            ? { ...f, textDirection: e.target.value }
                            : f
                        );
                        setSelectedFields(updatedFields);
                      }}
                      className="w-full p-2 border rounded"
                    >
                      {TEXT_DIRECTIONS.map(dir => (
                        <option key={dir.value} value={dir.value}>{dir.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={field.color || '#1f2937'}
                        onChange={(e) => {
                          const updatedFields = selectedFields.map(f => 
                            f.id === selectedFieldId 
                              ? { ...f, color: e.target.value }
                              : f
                          );
                          setSelectedFields(updatedFields);
                        }}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={field.color || '#1f2937'}
                        onChange={(e) => {
                          const updatedFields = selectedFields.map(f => 
                            f.id === selectedFieldId 
                              ? { ...f, color: e.target.value }
                              : f
                          );
                          setSelectedFields(updatedFields);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={field.bgColor === 'transparent' ? '#ffffff' : field.bgColor || '#ffffff'}
                        onChange={(e) => {
                          const updatedFields = selectedFields.map(f => 
                            f.id === selectedFieldId 
                              ? { ...f, bgColor: e.target.value }
                              : f
                          );
                          setSelectedFields(updatedFields);
                        }}
                        className="w-12 h-10 rounded border"
                      />
                      <Input
                        value={field.bgColor || 'transparent'}
                        onChange={(e) => {
                          const updatedFields = selectedFields.map(f => 
                            f.id === selectedFieldId 
                              ? { ...f, bgColor: e.target.value }
                              : f
                          );
                          setSelectedFields(updatedFields);
                        }}
                        placeholder="transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
