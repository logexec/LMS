"use client";

import React from 'react'
import DropZone from './components/DropZone'
import PartialDataTable from './components/PartialDataTable'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { SriProvider, useSri } from '@/contexts/SriContext'

// Componente interior que usa el contexto
const SriPageContent = () => {
  const { state, actions } = useSri();
  const { currentStep } = state;
  const { setStep } = actions;

  const steps = [
    {
      step: 1,
      title: "Cargar Archivo",
      description: "Seleccionar archivo de Excel",
    },
    {
      step: 2,
      title: "Completar Datos",
      description: "Asociar información necesaria",
    },
    {
      step: 3,
      title: "Visualización",
      description: "Ver resultados finales",
    },
  ];

  // Renderizar el componente correspondiente según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <DropZone />;
      case 2:
        return <PartialDataTable />;
      case 3:
        // Futuro paso, por implementar
        return (
          <div className="py-8 text-center">
            <h3 className="text-lg font-medium mb-4">Visualización Final</h3>
            <p className="text-muted-foreground">Este paso está pendiente de implementación.</p>
          </div>
        );
      default:
        return <DropZone />;
    }
  };

  return (
    <div className="flex flex-col gap-8 mx-auto p-4">
      {/* Stepper  */}
      <div className="space-y-6">
        <Stepper value={currentStep} onValueChange={(value) => setStep(value)}>
          {steps.map(({ step, title, description }) => (
            <StepperItem
              key={step}
              step={step}
              className="not-last:flex-1 max-md:items-start"
            >
              <StepperTrigger 
                className="rounded max-md:flex-col"
                disabled={step > currentStep}
              >
                <StepperIndicator />
                <div className="text-center md:text-left">
                  <StepperTitle>{title}</StepperTitle>
                  <StepperDescription className="max-sm:hidden">
                    {description}
                  </StepperDescription>
                </div>
              </StepperTrigger>
              {step < steps.length && (
                <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
              )}
            </StepperItem>
          ))}
        </Stepper>
      </div>

      {/* Contenido del paso actual */}
      <div className="border rounded-xl p-4 bg-card shadow-sm">
        {renderStepContent()}
      </div>
    </div>
  );
};

// Componente wrapper que provee el contexto
const SriPage = () => {
  return (
    <SriProvider>
      <SriPageContent />
    </SriProvider>
  );
};

export default SriPage