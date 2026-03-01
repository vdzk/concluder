import { Component, onMount } from "solid-js";
import { ClaimForm } from "../ClaimForm"
import { ArgumentForm } from "../ArgumentForm"
import { IconButton } from "../Buttons"
import { Statement } from "../argue/Statement"
import { Argument } from "../argue/Argument"
import { StatementForm } from "../StatementForm";

export const IntroSlide: Component = () => {
  return (
    <div class="sm:text-2xl text-xl pt-4 px-2">
      <span class="font-bold">Concluder</span> scores arguments <span class="whitespace-nowrap">semi-automatically</span> and judges which side is winning in a debate. Its conclusions are based on the arguments added so far.
      <div class="h-4" />
      <span class="font-bold">You</span> can add arguments and see the % certainty change. No registration is required (for now).
    </div>
  )
}

const claimText = 'Covid-19 was created in a lab.'
const argument1Text = 'There was a lab conducting coronavirus gain-of-function research just miles away from the outbreak.'
const argument2Text = 'Most published scientific studies say that COVID-19 shows signs of natural origin.'
const premise1Text = 'If most published scientific studies say something then it is true.'
const premise2Text = "If a virus shows signs of natural origin then it wasn't created in a lab."
const subArgument1Text = "Published scientific studies avoid conclusions that are politically sensitive."

export const AddClaimSlide: Component = () => {
  onMount(() => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) textarea.value = claimText
  })

  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        First, someone adds a claim.
      </div>
      <div class="h-4" />
      <ClaimForm
        saving={false}
        onSubmitClaim={() => { }}
      />
    </div>
  )
}

export const WriteArgumentSlide: Component = () => {
  onMount(() => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    const proSelect = document.querySelector('select') as HTMLSelectElement
    if (proSelect) proSelect.value = 'true'
    if (textarea) textarea.value = argument1Text
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    if (input) input.value = '80.0'
  })

  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        Then, an argument below it.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.5, hasArgument: false, editable: null }}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <ArgumentForm
        saving={false}
        onSubmitArgument={() => { }}
      />
      <div class="sm:text-lg pt-4 px-2">
        <span class="font-bold">Strength</span> of an argument is the degree to which it changes the confidence in its conclusion. The initial strength % is just a personal opinion. You will see how it will be replaced with a calculated value in later slides.
      </div>
    </div>
  )
}

export const SubmitArgumentSlide: Component = () => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        This updates the scores above.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.9, hasArgument: false, editable: null }}
        scoreDelta={0.4}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument1Text,
          pro: true,
          strength: 0.8,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add premise"
          onClick={() => { }}
        />
      </div>
      <div class="sm:text-lg pt-4 px-2">
        The new certainty in the claim is calculated based on the balance of strengths of pro and con arguments below it.
      </div>
    </div>
  )
}

export const SecondArgumentSlide: Component = () => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        Only one argument is shown at a time.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.614, hasArgument: false, editable: null }}
        scoreDelta={-0.286}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
        <IconButton
          iconName="arrow-left"
          label="prev. argument"
          onClick={() => { }}
        />
        <IconButton
          iconName="arrow-right"
          label="next argument"
          disabled
          onClick={() => { }}
        />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument2Text,
          pro: false,
          strength: 0.7,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add premise"
          onClick={() => { }}
        />
      </div>
      <div class="sm:text-lg pt-4 px-2">
        Every time a new argument is added the score above is updated. However only one argument is shown at a time (on each level). You can use arrows to switch between them.
      </div>
    </div>
  )
}

export const WritePremiseSlide: Component = props => {
  onMount(() => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) textarea.value = premise1Text
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    if (input) input.value = '60.0'
  })

  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        Question argument's premises.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.614, hasArgument: false, editable: null }}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument2Text,
          pro: false,
          strength: 0.7,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <StatementForm
        saving={false}
        onSubmitStatement={() => { }}
      />
      <div class="sm:text-lg pt-4 px-2">
        Assumptions that need to be true for the argument to work are called premises. Some premises can be found within the text of the argument. Others, like the premise above, are not stated explicitly but still are part of the argument.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        Premises should be worded as independent statements. They should not mention the argument above because they might end up being a part of multiple arguments.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        In this case, the confidence of 60% should be interpreted as <span class="italic">the rule stated in the premise works 60% of the time</span> rather than <span class="italic">there is a 60% chance that the rule is absolutely true</span>.
      </div>
    </div>
  )
}

export const SubmitPremiseSlide: Component = props => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        Scores update up the chain.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.692, hasArgument: false, editable: null }}
        scoreDelta={0.078}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument2Text,
          pro: false,
          strength: 0.6,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
        scoreDelta={-0.1}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
        <IconButton
          iconName="plus"
          label="add premise"
          onClick={() => { }}
        />
      </div>
      <Statement
        step={{ index: 0, statementId: 0 }}
        statement={{ id: 0, text: premise1Text, likelihood: 0.6, hasArgument: false, editable: null }}
        parentPremiseIndex={0}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <div class="sm:text-lg pt-4 px-2">
        Now the argument strength that was previously set manually is replaced by a calculated value. It's determined by multiplying the certainties of its premises. There's only one for now, but more will be added.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        The certainty of the premise was set manually, reflecting the opinion of the person who created it. However, it too will be replaced with a calculated value once someone, adds one or more arguments below it.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        In general, only the bottom level entries have their scores set manually. If there is a significant disagreement we can always dig even deeper until a common ground is reached.
      </div>
    </div>
  )
}

export const SecondPremiseSlide: Component = props => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        Adding a second premise.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.729, hasArgument: false, editable: null }}
        scoreDelta={0.037}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
        <IconButton
          iconName="arrow-left"
          label="prev. argument"
          onClick={() => { }}
        />
        <IconButton
          iconName="arrow-right"
          label="next argument"
          disabled
          onClick={() => { }}
        />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument2Text,
          pro: false,
          strength: 0.54,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
        scoreDelta={-0.06}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
        <IconButton
          iconName="arrow-left"
          onClick={() => { }}
          label="prev. premise"
        />
        <IconButton
          iconName="arrow-right"
          onClick={() => { }}
          disabled
          label="next premise"
        />
        <IconButton
          iconName="plus"
          label="add premise"
          onClick={() => { }}
        />
      </div>
      <Statement
        step={{ index: 0, statementId: 0 }}
        statement={{ id: 0, text: premise2Text, likelihood: 0.9, hasArgument: false, editable: null }}
        parentPremiseIndex={1}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add argument"
          onClick={() => { }}
        />
      </div>
      <div class="sm:text-lg pt-4 px-2">
        As with arguments, only one premise is shown at a time (on each level). Certainties of the two premises 60% and 90% are multiplied 0.6×0.9=0.54 to give the new argument strength of 54%. This in turn causes recalculation of the certainty in the claim.
      </div>
    </div>
  )
}

export const SubArgumentSlide: Component = props => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl px-2">
        It's pro / con / premise of the entry that is <span class="font-bold">immediately</span> above it.
      </div>
      <div class="h-4" />
      <Statement
        step={{ index: 0, statementId: 0, isClaim: true }}
        statement={{ id: 0, text: claimText, likelihood: 0.809, hasArgument: false, editable: null }}
        scoreDelta={0.08}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: argument2Text,
          pro: false,
          strength: 0.36,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
        scoreDelta={-0.18}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <Statement
        step={{ index: 0, statementId: 0 }}
        statement={{ id: 0, text: premise1Text, likelihood: 0.4, hasArgument: false, editable: null }}
        parentPremiseIndex={0}
        scoreDelta={-0.2}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="chevron-up"
          label="hide arguments"
          onClick={() => { }}
        />
      </div>
      <Argument
        argument={{
          id: 0,
          claim_id: 0,
          text: subArgument1Text,
          pro: false,
          strength: 0.2,
          hasPremise: false,
          editable: false,
        }}
        sideIndex={0}
      />
      <div class="flex">
        <div class="w-[calc(50%-18px)]" />
        <IconButton
          iconName="plus"
          label="add premise"
          onClick={() => { }}
        />
      </div>
      <div class="sm:text-lg pt-4 px-2">
        The last entry is an argument against the entry immediately above it. It relates to the original claim only through a series of steps and in the end actually plays in the claim's favour.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        Once the argument was added, the certainty in the premise which was previously set manually was replaced with an auto-calculated value triggering a chain of score updates.
      </div>
      <div class="sm:text-lg pt-2 px-2">
        This chain has a repeating structure of statement-argument-statement-argument-... etc. where a statement can play a role of a claim or a premise. Given that there can be multiple statements / arguments on the same level, the underlying structure is actually a network. But only a single path through it is displayed at any one time.
      </div>
      <img
        class="rounded block mx-auto my-4"
        src="/argument_structure.png"
      />
    </div>
  )
}

export const ApolloSlide: Component = () => {
  return (
    <div class="w-full pt-4">
      <div class="sm:text-2xl text-xl font-bold px-2">
        This is not the limit.
      </div>
      <div class="sm:text-lg pt-4 px-2">
        Concluder is too simple to handle many of the complications that arise in a course of a disagreement. Its calculations are too crude to reach accurate conclusions reliably. <a
          href="https://mindofapollo.org/about"
          class="text-sky-700 dark:text-sky-400 hover:underline"
        >
          Mind of Apollo
        </a> is the project that aims at overcoming these problems. However it requires a lot more work to mature. So, for now, please enjoy its fun and simple version - Concluder. 
      </div>
    </div>
  )
}