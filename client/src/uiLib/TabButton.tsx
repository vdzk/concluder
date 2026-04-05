import type { Component, JSX } from 'solid-js';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: JSX.Element;
}

export const TabButton: Component<TabButtonProps> = (props) => (
  <button
    onClick={props.onClick}
    class={`px-3 py-1.5 rounded text-xl font-medium cursor-pointer ${props.active ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
  >
    {props.children}
  </button>
);
