import { Dynamic } from 'solid-js/web';
import type { Component } from 'solid-js';

interface Props {
  message: string;
  as?: 'p' | 'li' | 'span';
  size?: 'sm' | 'base';
}

export const EmptyState: Component<Props> = (props) => (
  <Dynamic
    component={props.as ?? 'p'}
    class={`text-gray-500 dark:text-gray-400${props.size === 'sm' ? ' text-sm' : ''}`}
  >
    {props.message}
  </Dynamic>
);
