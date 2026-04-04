import { Dynamic } from 'solid-js/web';
import type { Component } from 'solid-js';

interface Props {
  message: string;
  as?: 'p' | 'li' | 'span';
}

export const EmptyState: Component<Props> = (props) => (
  <Dynamic
    component={props.as ?? 'p'}
    class="text-sm text-gray-500 dark:text-gray-400"
  >
    {props.message}
  </Dynamic>
);
