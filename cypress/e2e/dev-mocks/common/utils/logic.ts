export const assertContent = (
  request,
  propsToAssert: Record<string, any>,
  stepIndex: number[],
) => {
  const steps = request.body.tasks_definitions[0].task_config.logic_steps;
  //[0].nodes[0].content;
  const step = stepIndex.reduce((last, index) => {
    return last?.nodes ? last.nodes[index] : last[index];
  }, steps);
  Object.entries(propsToAssert).forEach(([key, value]) =>
    expect(step.content).to.have.property(key, value),
  );
};
