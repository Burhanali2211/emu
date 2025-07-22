import { useState } from 'react';
import { useRobot } from '@/context/RobotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoutineBuilder } from '@/components/automation/RoutineBuilder';
import { Routine } from '@/types/robot';
import { Play, Plus, Trash2 } from 'lucide-react';

const AutomationPage = () => {
  const { routines, saveRoutine, deleteRoutine, runRoutine } = useRobot();
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleNewRoutine = () => {
    setSelectedRoutine(null);
    setIsBuilderOpen(true);
  };

  const handleEditRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsBuilderOpen(true);
  };

  const handleSaveRoutine = (routine: Routine) => {
    saveRoutine(routine);
    setIsBuilderOpen(false);
    setSelectedRoutine(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="bg-slate-900/50 neon-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-400">My Routines</CardTitle>
            <Button size="sm" onClick={handleNewRoutine}><Plus className="mr-2 h-4 w-4" /> New</Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {routines.map(routine => (
                <li key={routine.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="font-medium">{routine.name}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => runRoutine(routine)}><Play className="h-4 w-4 text-green-400" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditRoutine(routine)}><Plus className="h-4 w-4 text-yellow-400" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteRoutine(routine.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                  </div>
                </li>
              ))}
              {routines.length === 0 && <p className="text-slate-500 text-center py-4">No routines created yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        {isBuilderOpen ? (
          <RoutineBuilder
            routine={selectedRoutine}
            onSave={handleSaveRoutine}
            onCancel={() => setIsBuilderOpen(false)}
          />
        ) : (
          <Card className="bg-slate-900/50 neon-border h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <h3 className="text-lg font-semibold">Automation Hub</h3>
              <p>Select a routine to edit or create a new one.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AutomationPage;
