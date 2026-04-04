import { createSignal, type JSX, Show } from 'solid-js';

type Props = {
  left: JSX.Element;
  right: JSX.Element;
  leftClass?: string;
  rightClass?: string;
  leftLabel?: string;
  rightLabel?: string;
  showRight?: boolean;
  onShowRightChange?: (v: boolean) => void;
};

export const TwoColumnLayout = (props: Props) => {
  const [_showRight, _setShowRight] = createSignal(false);

  const showRight = () => props.showRight !== undefined ? props.showRight : _showRight();
  const setShowRight = (v: boolean) => {
    if (props.onShowRightChange) props.onShowRightChange(v);
    else _setShowRight(v);
  };

  const leftColClass = () => [
    showRight() ? 'hidden lg:flex' : 'flex',
    'flex-col overflow-y-auto w-full lg:w-1/2',
    props.leftClass,
  ].filter(Boolean).join(' ');

  const rightColClass = () => [
    showRight() ? 'flex' : 'hidden lg:flex',
    'flex-col overflow-y-auto w-full lg:w-1/2',
    props.rightClass,
  ].filter(Boolean).join(' ');

  return (
    <div class="flex h-full relative">
      <div class={leftColClass()}>
        {props.left}
      </div>

      <div class="hidden lg:block w-px bg-gray-400 dark:bg-gray-600 self-stretch" />

      <div class={rightColClass()}>
        {props.right}
      </div>

      <button
        class="lg:hidden fixed bottom-5 right-5 z-10 h-10 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium"
        onClick={() => setShowRight(!showRight())}
      >
        <Show when={showRight()} fallback={<>
          <span>{props.rightLabel ?? 'Right'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </>}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{props.leftLabel ?? 'Left'}</span>
        </Show>
      </button>
    </div>
  );
};
