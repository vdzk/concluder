import { type Component } from 'solid-js';
import { useParams } from '@solidjs/router';
import { DefinitionsPage } from './DefinitionsPage';

export const DefinitionPage: Component = () => {
  const params = useParams<{ id: string }>();
  return <DefinitionsPage initialId={Number(params.id)} />;
};
