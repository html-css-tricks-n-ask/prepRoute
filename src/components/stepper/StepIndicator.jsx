
export default function StepIndicator({ activeStep, testId, navigate }) {
  const steps = [
    { number: 1, label: 'Test Details', path: testId ? `/test/edit/${testId}` : null },
    { number: 2, label: 'Add Questions', path: testId ? `/test/${testId}/questions` : null },
    { number: 3, label: 'Preview & Publish', path: testId ? `/test/${testId}/preview` : null }
  ];

  const handleStepClick = (step) => {
    // Only navigate to previous/completed steps or if we have step.path and are allowed to navigate
    if (navigate && step.path && step.number < activeStep) {
      navigate(step.path);
    }
  };

  return (
    <div className="steps-indicator">
      {steps.map((step) => {
        const isActive = step.number === activeStep;
        const isCompleted = step.number < activeStep;
        
        let nodeClass = 'step-node';
        if (isActive) nodeClass += ' active';
        if (isCompleted) nodeClass += ' completed';

        const style = isCompleted && navigate && step.path ? { cursor: 'pointer' } : {};

        return (
          <div 
            key={step.number} 
            className={nodeClass} 
            onClick={() => handleStepClick(step)}
            style={style}
          >
            {step.number}
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
