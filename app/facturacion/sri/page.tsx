import React from 'react'
import DropZone from './components/DropZone'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

const SriPage = () => {
    const steps = [
  {
    step: 1,
    title: "Primer Paso",
    description: "Cargar archivo de excel",
  },
  {
    step: 2,
    title: "Segundo Paso",
    description: "Completar los datos",
  },
//   {
//     step: 3,
//     title: "Tercer paso",
//     description: "Desc for step three",
//   },
];

  return (
    <div className="flex flex-col grow">
      {/* Stepper  */}
      <div className="space-y-8 text-center">
        <Stepper defaultValue={2}>
          {steps.map(({ step, title, description }) => (
            <StepperItem
              key={step}
              step={step}
              className="not-last:flex-1 max-md:items-start"
            >
              <StepperTrigger className="rounded max-md:flex-col">
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
      {/* DropZone */}
      <DropZone />
    </div>
  );
}

export default SriPage