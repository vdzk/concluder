import { Component, onCleanup, onMount, Show } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { btnClass, IconButton } from "../Buttons"
import { AddClaimSlide, IntroSlide, WritePremiseSlide, SecondArgumentSlide, SubmitArgumentSlide, WriteArgumentSlide, SubmitPremiseSlide, SecondPremiseSlide, SubArgumentSlide, ApolloSlide } from "./Slides"
import { Dynamic } from "solid-js/web"

const slides = [
  IntroSlide,
  AddClaimSlide,
  WriteArgumentSlide,
  SubmitArgumentSlide,
  SecondArgumentSlide,
  WritePremiseSlide,
  SubmitPremiseSlide,
  SecondPremiseSlide,
  SubArgumentSlide,
  ApolloSlide
]


export const Tutorial: Component = () => {
  const navigate = useNavigate()
  const params = useParams()
  const slideIndex = () => parseInt(params.page ?? '1') - 1

  onMount(() => {
    document.title = 'Tutorial'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && slideIndex() > 0) shiftPage(-1)
      else if (e.key === 'ArrowRight' && slideIndex() < slides.length - 1) shiftPage(1)
    }
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  const shiftPage = (delta: number) => navigate(
    `/tutorial/${slideIndex() + delta + 1}`
  )

  const onSkip = () => {
    localStorage.setItem('skipTutorial', 'true')
    navigate('/')
  }
  const isLast = () => slideIndex() === slides.length - 1
  return (
    <>
      <div class="flex-1 min-w-0 shrink overflow-y-auto [scrollbar-gutter:stable]">
        <main class="max-w-lg mx-auto px-1">
          <Dynamic component={slides[slideIndex()]} />
        </main>
      </div>
      <div class="w-lg max-w-full mx-auto px-1">
        <div class="flex">
          <button
            class={btnClass + 'uppercase px-2 py-1 text-lg'}
            onClick={onSkip}
          >
            <Show when={!isLast()}>
              Skip tutorial
            </Show>
            <Show when={isLast()}>
              Finish tutorial
            </Show>
          </button>
          <div class="flex-1" />
          <IconButton
            iconName="arrow-left"
            onClick={() => shiftPage(-1)}
            label="previous slide"
            disabled={slideIndex() === 0}
          />
          <div class="px-1 py-1 text-lg">
            {slideIndex() + 1}/{slides.length}
          </div>
          <Show when={!isLast()}>
            <IconButton
              iconName="arrow-right"
              label="next slide"
              onClick={() => shiftPage(1)}
            />
          </Show>
          <Show when={isLast()}>
            <IconButton
              iconName="finish"
              label="finish"
              onClick={onSkip}
            />
          </Show>
        </div>
      </div>
    </>
  )
}