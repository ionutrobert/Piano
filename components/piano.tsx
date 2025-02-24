"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import * as Tone from "tone"

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const START_OCTAVE = 3
const END_OCTAVE = 5

const KEYBOARD_MAP: { [key: string]: string } = {
  z: "C3",
  s: "C#3",
  x: "D3",
  d: "D#3",
  c: "E3",
  v: "F3",
  g: "F#3",
  b: "G3",
  h: "G#3",
  n: "A3",
  j: "A#3",
  m: "B3",
  q: "C4",
  "2": "C#4",
  w: "D4",
  "3": "D#4",
  e: "E4",
  r: "F4",
  "5": "F#4",
  t: "G4",
  "6": "G#4",
  y: "A4",
  "7": "A#4",
  u: "B4",
}

interface PianoKeyProps {
  note: string
  octave: number
  keyBinding?: string
  isBlack?: boolean
  sampler: Tone.Sampler | null
}

const PianoKey = ({ note, octave, keyBinding, isBlack, sampler }: PianoKeyProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const playNote = useCallback(() => {
    if (sampler) {
      sampler.triggerAttack(`${note}${octave}`)
      setIsPressed(true)
    }
  }, [note, octave, sampler])

  const stopNote = useCallback(() => {
    if (sampler) {
      sampler.triggerRelease(`${note}${octave}`)
      setIsPressed(false)
    }
  }, [note, octave, sampler])

  useEffect(() => {
    if (keyBinding) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === keyBinding && !e.repeat) {
          playNote()
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === keyBinding) {
          stopNote()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)

      return () => {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
    }
  }, [keyBinding, playNote, stopNote])

  const keyLabel = keyBinding ? `${note}${octave}${keyBinding ? ` (${keyBinding})` : ""}` : `${note}${octave}`

  return (
    <div className={cn("relative select-none", isBlack ? "w-8 h-32 -mx-4 z-10" : "w-12 h-48")}>
      <button
        onTouchStart={(e) => {
          e.preventDefault()
          playNote()
        }}
        onTouchEnd={() => stopNote()}
        onMouseDown={() => playNote()}
        onMouseUp={() => stopNote()}
        onMouseLeave={() => isPressed && stopNote()}
        className={cn(
          "absolute w-full h-full rounded-b-md transition-colors duration-100",
          isBlack
            ? "bg-black hover:bg-gray-800 active:bg-gray-700"
            : "bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-300",
          isPressed && (isBlack ? "bg-gray-700" : "bg-gray-200"),
        )}
      >
        <span
          className={cn(
            "absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] leading-tight text-center",
            isBlack ? "text-white" : "text-gray-400",
          )}
        >
          {keyLabel}
        </span>
      </button>
    </div>
  )
}

export default function Piano() {
  const [isLoading, setIsLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const samplerRef = useRef<Tone.Sampler | null>(null)

  useEffect(() => {
    const loadPiano = async () => {
      setIsLoading(true)
      if (samplerRef.current) {
        await samplerRef.current.dispose()
      }

      const newSampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
      }).toDestination()

      await Tone.loaded()
      samplerRef.current = newSampler
      setIsLoading(false)
    }
    loadPiano()
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault()
          container.scrollLeft += e.deltaY
        }
      }
      container.addEventListener("wheel", handleWheel)
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const allKeys = []
  for (let octave = START_OCTAVE; octave <= END_OCTAVE; octave++) {
    for (const note of NOTES) {
      const keyBinding = Object.entries(KEYBOARD_MAP).find(([_, value]) => value === `${note}${octave}`)?.[0]
      allKeys.push({ note, octave, keyBinding, isBlack: note.includes("#") })
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-white">Grand Piano</h1>

      {isLoading ? (
        <div className="text-white">Loading piano samples...</div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
        >
          <div className="flex min-w-min px-4">
            {allKeys.map(({ note, octave, keyBinding, isBlack }) => (
              <PianoKey
                key={`${note}${octave}`}
                note={note}
                octave={octave}
                keyBinding={keyBinding}
                isBlack={isBlack}
                sampler={samplerRef.current}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

