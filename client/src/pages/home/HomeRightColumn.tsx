import { type Component } from 'solid-js';
import { TextBlock } from '../../uiLib/Text';

export const HomeRightColumn: Component = () => {
  return (
    <div class="flex flex-col gap-4">
      <h1 class="text-3xl font-semibold">Welcome to Concluder</h1>
      <TextBlock>
        Concluder is a Wikipedia-style tool for collaborative reasoning. Browse questions on the left,
        or add your own to kick off a structured chain of thought. Each question can be broken
        down into sub-questions, analysed, and concluded collaboratively.
      </TextBlock>
    </div>
  );
};
