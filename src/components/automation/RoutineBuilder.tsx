import { useState, useEffect } from 'react';
import { Routine, RoutineStep } from '@/types/robot';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';

interface RoutineBuilderProps {
  routine: Routine | null;
  onSave: (routine: Routine) => void;
  onCancel: () => void;
}

const emptyRoutine: Routine = {
  id: '',
  name: '',
  description: '',
  steps: [],
  trigger: { type: 'manual' },
};

export const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ routine, onSave, onCancel }) => {
  const [currentRoutine, setCurrentRoutine] = useState<Routine>(emptyRoutine);

  useEffect(() => {
    setCurrentRoutine(routine ? { ...routine } : { ...emptyRoutine, id: `routine_${Date.now()}` });
  }, [routine]);

  const handleStepChange = (index: number, field: keyof RoutineStep, value: any) => {
    const newSteps = [...currentRoutine.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setCurrentRoutine({ ...currentRoutine, steps: newSteps });
  };

  const addStep = () => {
    const newStep: RoutineStep = { action: 'wait', duration: 1000 };
    setCurrentRoutine({ ...currentRoutine, steps: [...currentRoutine.steps, newStep] });
  };

  const removeStep = (index: number) => {
    const newSteps = currentRoutine.steps.filter((_, i) => i !== index);
    setCurrentRoutine({ ...currentRoutine, steps: newSteps });
  };

  const renderStepInputs = (step: RoutineStep, index: number) => {
    switch (step.action) {
      case 'move':
        return (
          <>
            <Select value={step.direction} onValueChange={(val) => handleStepChange(index, 'direction', val)}>
              <SelectTrigger><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forward">Forward</SelectItem>
                <SelectItem value="backward">Backward</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Duration (ms)" value={step.duration || ''} onChange={(e) => handleStepChange(index, 'duration', parseInt(e.target.value))} />
          </>
        );
      case 'buzzer':
        return <Select value={String(step.state)} onValueChange={(val) => handleStepChange(index, 'state', val === 'true')}><SelectTrigger><SelectValue placeholder="State" /></SelectTrigger><SelectContent><SelectItem value="true">On</SelectItem><SelectItem value="false">Off</SelectItem></SelectContent></Select>;
      case 'oled':
        return <Input placeholder="Text" value={step.text || ''} onChange={(e) => handleStepChange(index, 'text', e.target.value)} />;
      case 'expression':
        return <Input placeholder="Expression" value={step.expression || ''} onChange={(e) => handleStepChange(index, 'expression', e.target.value)} />;
      case 'wait':
        return <Input type="number" placeholder="Duration (ms)" value={step.duration || ''} onChange={(e) => handleStepChange(index, 'duration', parseInt(e.target.value))} />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-900/50 neon-border">
      <CardHeader>
        <CardTitle className="text-blue-400">{routine ? 'Edit Routine' : 'Create New Routine'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="routine-name">Routine Name</Label>
          <Input id="routine-name" value={currentRoutine.name} onChange={(e) => setCurrentRoutine({ ...currentRoutine, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="routine-desc">Description</Label>
          <Input id="routine-desc" value={currentRoutine.description} onChange={(e) => setCurrentRoutine({ ...currentRoutine, description: e.target.value })} />
        </div>
        <div>
          <Label>Steps</Label>
          <div className="space-y-2">
            {currentRoutine.steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                <Select value={step.action} onValueChange={(val) => handleStepChange(index, 'action', val)}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move">Move</SelectItem>
                    <SelectItem value="buzzer">Buzzer</SelectItem>
                    <SelectItem value="oled">OLED</SelectItem>
                    <SelectItem value="expression">Expression</SelectItem>
                    <SelectItem value="wait">Wait</SelectItem>
                  </SelectContent>
                </Select>
                {renderStepInputs(step, index)}
                <Button variant="ghost" size="icon" onClick={() => removeStep(index)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
              </div>
            ))}
            <Button variant="outline" onClick={addStep} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Step</Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(currentRoutine)}>Save Routine</Button>
      </CardFooter>
    </Card>
  );
};
