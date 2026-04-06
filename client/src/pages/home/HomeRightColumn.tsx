import { type Component } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { Text, TextBlock } from '../../uiLib/Text';
import { InlineLink } from '../../uiLib/InlineLink';


const SECTIONS: { heading: string; body: string | string[] }[] = [
  {
    heading: 'What is this?',
    body: "Concluder is a Wikipedia-style tool for collaborative reasoning. It focuses on controversial topics and can be seen as a new form of structured debate. It is still in an early stage of development. On the left, you can browse a list of conclusions, explore or edit the reasoning behind them, or start a new topic. No registration is required for now.",
  },
  {
    heading: 'How is it different from Wikipedia?',
    body: 'Wikipedia has a "no original research" rule. This means that Wikipedia articles can only cite third party sources. The articles cannot contain crowdsourced reasoning based on that information or come to any conclusion. That\'s where Concluder comes in. Every page contains three sections: question, analysis and conclusion. Anyone can edit them but there are rules about how this should be done.',
  },
  {
    heading: 'What are the rules for editing?',
    body: [
      "Naturally there are different opinions about how a particular question should be answered but only one answer will be shown on Concluder at any given time. So how is this conflict managed?",
      "The conclusion has to follow from the analysis. When editing an analysis of certain question the editor cannot just erase the points that they don't like. Instead the new version has to address them, it needs to explain why they are a weak or irrelevant. Entirely new arguments and reasoning can also be added to the analysis to justify the new conclusion.",
      "People from different perspectives iteratively edit the analysis, both collaboratively and adversarially. This process makes the analysis more comprehensive and refined, increasing the likelihood of reaching a correct conclusion. At least that's the idea.",
    ],
  },
  {
    heading: 'What if the analysis grows too large?',
    body: 'An analysis can be broken down into multiple sub-questions. This can be done at any level and repeated any number of times, creating a hierarchical structure of reasoning. One of the editing rules is that the assumptions that the analysis makes cannot contradict conclusions of the sub-questions that are linked to it. When two sides disagree, they can break the issue down into deeper sub-questions to identify the root of the disagreement. Once a lower-level issue is resolved, its conclusions propagate upward, influencing all higher-level questions that depend on it.',
  },
  {
    heading: 'What do you get out of this?',
    body: "One reason to participate is to compete to shape the platform's conclusions. If your reasoning is stronger than others', your view becomes the one that stands. You are not just arguing, you are showing that your analysis holds up better under scrutiny. It is a more meaningful kind of victory, not winning by rhetoric, but by building an argument that others cannot break. There are also other reasons to take part, such as improving your thinking, exploring difficult questions, and contributing to a shared understanding.",
  },
];

export const HomeRightColumn: Component = () => {
  const [searchParams] = useSearchParams<{ section?: string; tab?: string }>();
  const index = () => Math.min(Math.max(parseInt(searchParams.section ?? '0') || 0, 0), SECTIONS.length - 1);
  const tabParam = () => searchParams.tab ? `&tab=${searchParams.tab}` : '';

  return (
    <>
      <Text size="xl" bold>Welcome to Concluder</Text>

      <div class="mt-5">
        <div>
          <Text size="lg" bold class="mb-1 block">{SECTIONS[index()].heading}</Text>
          {Array.isArray(SECTIONS[index()].body)
            ? (SECTIONS[index()].body as string[]).map(p => <TextBlock class="mb-2 last:mb-0">{p}</TextBlock>)
            : <TextBlock>{SECTIONS[index()].body as string}</TextBlock>
          }
        </div>

        <div class="flex mt-4">
          {index() > 0 && (
            <InlineLink variant="nav" href={`/?section=${index() - 1}${tabParam()}`}>Back</InlineLink>
          )}
          <div class="flex-1" />
          {index() < SECTIONS.length - 1 && (
            <InlineLink variant="nav" href={`/?section=${index() + 1}${tabParam()}`}>
              {SECTIONS[index() + 1].heading}
            </InlineLink>
          )}
        </div>
      </div>
    </>
  );
};
