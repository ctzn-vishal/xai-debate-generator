'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, CheckCircle, AlertCircle, Lightbulb, GraduationCap } from 'lucide-react';

interface PersonaInfo {
  id: string;
  displayName: string;
  characterName: string;
  politicalLeaning: string;
  expertiseLevel: string;
  description: string;
  socialMediaHandle: string;
  keyInfluences: string[];
}

interface PersonaSelectorProps {
  personas: PersonaInfo[];
  validCombinations: string[][];
  selectedPersona1: string;
  selectedPersona2: string;
  onPersona1Change: (personaId: string) => void;
  onPersona2Change: (personaId: string) => void;
}

export default function PersonaSelector({
  personas,
  validCombinations,
  selectedPersona1,
  selectedPersona2,
  onPersona1Change,
  onPersona2Change,
}: PersonaSelectorProps) {
  const [activeSelection, setActiveSelection] = useState<'persona1' | 'persona2' | null>(null);

  const getPersonaColor = (politicalLeaning: string) => {
    return politicalLeaning.toLowerCase().includes('liberal')
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
  };

  const getPersonaIcon = (expertiseLevel: string) => {
    return expertiseLevel.toLowerCase().includes('expert')
      ? <GraduationCap className="h-4 w-4" />
      : <Lightbulb className="h-4 w-4" />;
  };

  const isValidCombination = (persona1: string, persona2: string) => {
    if (!persona1 || !persona2) return true; // Allow partial selection
    return validCombinations.some(combo =>
      (combo[0] === persona1 && combo[1] === persona2) ||
      (combo[0] === persona2 && combo[1] === persona1)
    );
  };

  const getAvailablePersonas = (forSlot: 'persona1' | 'persona2') => {
    const otherPersona = forSlot === 'persona1' ? selectedPersona2 : selectedPersona1;

    if (!otherPersona) return personas; // All personas available if other slot is empty

    return personas.filter(persona =>
      isValidCombination(persona.id, otherPersona)
    );
  };

  const handlePersonaSelect = (personaId: string) => {
    if (activeSelection === 'persona1') {
      onPersona1Change(personaId);
    } else if (activeSelection === 'persona2') {
      onPersona2Change(personaId);
    }
    setActiveSelection(null);
  };

  const selectedPersona1Info = personas.find(p => p.id === selectedPersona1);
  const selectedPersona2Info = personas.find(p => p.id === selectedPersona2);

  return (
    <div className="space-y-6">
      {/* Selection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Persona 1 Slot */}
        <Card
          className={`cursor-pointer transition-all ${
            activeSelection === 'persona1'
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
              : selectedPersona1
                ? 'bg-green-50 dark:bg-green-950'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          onClick={() => setActiveSelection(activeSelection === 'persona1' ? null : 'persona1')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Liberal Perspective
              </span>
              {selectedPersona1 && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPersona1Info ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={getPersonaColor(selectedPersona1Info.politicalLeaning)}>
                      {selectedPersona1Info.characterName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{selectedPersona1Info.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPersona1Info.characterName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getPersonaIcon(selectedPersona1Info.expertiseLevel)}
                    <span className="ml-1">{selectedPersona1Info.expertiseLevel}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedPersona1Info.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to select liberal persona</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Persona 2 Slot */}
        <Card
          className={`cursor-pointer transition-all ${
            activeSelection === 'persona2'
              ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950'
              : selectedPersona2
                ? 'bg-green-50 dark:bg-green-950'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          onClick={() => setActiveSelection(activeSelection === 'persona2' ? null : 'persona2')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Conservative Perspective
              </span>
              {selectedPersona2 && <CheckCircle className="h-5 w-5 text-green-600" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPersona2Info ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={getPersonaColor(selectedPersona2Info.politicalLeaning)}>
                      {selectedPersona2Info.characterName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{selectedPersona2Info.displayName}</h4>
                    <p className="text-sm text-muted-foreground">{selectedPersona2Info.characterName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getPersonaIcon(selectedPersona2Info.expertiseLevel)}
                    <span className="ml-1">{selectedPersona2Info.expertiseLevel}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedPersona2Info.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to select conservative persona</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Status */}
      {selectedPersona1 && selectedPersona2 && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
          {isValidCombination(selectedPersona1, selectedPersona2) ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Valid debate combination selected
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                These personas are from the same political side. Please select opposing perspectives.
              </span>
            </>
          )}
        </div>
      )}

      {/* Persona Selection Grid */}
      {activeSelection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Choose {activeSelection === 'persona1' ? 'Liberal' : 'Conservative'} Persona
            </CardTitle>
            <CardDescription>
              Select a persona to represent the {activeSelection === 'persona1' ? 'liberal' : 'conservative'} perspective in this debate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const availablePersonas = getAvailablePersonas(activeSelection)
                  .filter(persona => persona && persona.id && persona.politicalLeaning)
                  .filter(persona => {
                    const isLiberal = persona.politicalLeaning.toLowerCase().includes('liberal');
                    return activeSelection === 'persona1' ? isLiberal : !isLiberal;
                  });

                if (availablePersonas.length === 0) {
                  return (
                    <div className="col-span-full text-center py-8">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No {activeSelection === 'persona1' ? 'liberal' : 'conservative'} personas available
                      </p>
                    </div>
                  );
                }

                return availablePersonas.map((persona) => (
                  <Card
                    key={persona.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handlePersonaSelect(persona.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className={getPersonaColor(persona.politicalLeaning)}>
                              {persona.characterName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{persona.displayName}</h4>
                            <p className="text-sm text-muted-foreground truncate">{persona.characterName}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPersonaColor(persona.politicalLeaning)}`}
                          >
                            {persona.politicalLeaning}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getPersonaIcon(persona.expertiseLevel)}
                            <span className="ml-1">{persona.expertiseLevel}</span>
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {persona.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>

            {activeSelection && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setActiveSelection(null)}
                >
                  Cancel Selection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}