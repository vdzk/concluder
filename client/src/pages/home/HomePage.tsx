import { createEffect, type Component } from 'solid-js';
import { TwoColumnLayout } from '../../uiLib/TwoColumnLayout';
import { HomeLeftColumn } from './HomeLeftColumn';
import { HomeRightColumn } from './HomeRightColumn';

export const HomePage: Component = () => {
  createEffect(() => { document.title = 'Concluder | Home'; });

  return (
    <TwoColumnLayout
      leftLabel="Questions"
      rightLabel="About"
      leftClass="gap-6 px-4 py-6 lg:px-10 lg:py-10"
      rightClass="justify-between gap-6 px-4 py-6 lg:px-10 lg:py-10"
      left={<HomeLeftColumn />}
      right={<HomeRightColumn />}
    />
  );
};
