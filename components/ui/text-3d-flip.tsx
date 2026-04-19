"use client"

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ElementType,
} from "react"
import {
  useAnimate,
  type AnimationOptions,
  type ValueAnimationTransition,
} from "motion/react"

import { cn } from "@/lib/utils"

const HAS_SEGMENTER = typeof Intl !== "undefined" && "Segmenter" in Intl

const splitIntoCharacters = (text: string): string[] => {
  if (HAS_SEGMENTER) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

const extractTextFromChildren = (children: React.ReactNode): string => {
  if (children == null) return ""
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("")
  }

  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>
    const childText = props.children as React.ReactNode
    if (childText != null) {
      return extractTextFromChildren(childText)
    }
  }

  return ""
}

const ROTATION_MAP = {
  top: "rotateX(90deg)",
  right: "rotateY(90deg)",
  bottom: "rotateX(-90deg)",
  left: "rotateY(-90deg)",
} as const

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
}

interface Text3DFlipProps {
  children: React.ReactNode
  as?: ElementType
  className?: string
  textClassName?: string
  flipTextClassName?: string
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number | "random"
  transition?: ValueAnimationTransition | AnimationOptions
  rotateDirection?: "top" | "right" | "bottom" | "left"
  triggerOnMount?: boolean
}

import { motion, Variants } from "motion/react"

const Text3DFlip = ({
  children,
  className,
  textClassName,
  flipTextClassName,
  transition = DEFAULT_TRANSITION,
  rotateDirection = "top",
  ...props
}: Omit<Text3DFlipProps, 'as'>) => {
  const text = useMemo(() => {
    try {
      return extractTextFromChildren(children)
    } catch {
      return ""
    }
  }, [children])

  const characters = useMemo(() => {
    const words = text.split(" ")
    return words.map((word, i) => ({
      characters: splitIntoCharacters(word),
      needsSpace: i !== words.length - 1,
    }))
  }, [text])

  const charOffsets = useMemo(() => {
    const offsets = [0]
    for (const word of characters) {
      offsets.push(offsets.at(-1)! + word.characters.length)
    }
    return offsets
  }, [characters])

  // Framer Motion variants for the entrance and exit of EACH character
  // Since we want them to enter/exit at the exact same time, we don't use stagger in the variants,
  // we just let them all animate concurrently based on the parent's AnimatePresence.
  const charVariants: Variants = {
    initial: { 
      rotateX: -90, 
      opacity: 0
    },
    animate: { 
      rotateX: 0, 
      opacity: 1
    },
    exit: { 
      rotateX: 90, 
      opacity: 0
    }
  }

  return (
    <motion.div
      className={cn("relative flex flex-wrap", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>

      {characters.map((wordObj, wordIndex) => (
        <span key={wordIndex} className="inline-flex">
          {wordObj.characters.map((char, charIndex) => (
            <motion.span
              key={charOffsets[wordIndex] + charIndex}
              variants={charVariants}
              transition={transition}
              className="inline-block transform-3d"
              style={{ transformOrigin: "center" }}
            >
              <CharBox
                char={char}
                textClassName={textClassName}
                flipTextClassName={flipTextClassName}
                rotateDirection={rotateDirection}
              />
            </motion.span>
          ))}
          {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
        </span>
      ))}
    </motion.div>
  )
}

interface CharBoxProps {
  char: string
  textClassName?: string
  flipTextClassName?: string
  rotateDirection: "top" | "right" | "bottom" | "left"
}

const SECOND_FACE_TRANSFORMS = {
  top: "rotateX(-90deg) translateZ(0.5lh)",
  right:
    "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
  bottom: "rotateX(90deg) translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)",
} as const

const FRONT_FACE_TRANSFORMS = {
  top: "translateZ(0.5lh)",
  bottom: "translateZ(0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(-90deg) translateX(50%) rotateY(90deg)",
} as const

const CONTAINER_TRANSFORMS = {
  top: "translateZ(-0.5lh)",
  bottom: "translateZ(-0.5lh)",
  left: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
  right: "rotateY(90deg) translateX(50%) rotateY(-90deg)",
} as const

const CharBox = memo(
  ({
    char,
    textClassName,
    flipTextClassName,
    rotateDirection,
  }: CharBoxProps) => {
    // We use a simplified initial transform for the entrance to prevent flickering
    // It's technically the reverse of the rotation direction
    const initialTransform = ROTATION_MAP[rotateDirection];

    return (
      <span
        className="text-3d-flip-char inline-block transform-3d"
        style={{ 
          transform: CONTAINER_TRANSFORMS[rotateDirection],
          // We don't set the rotated transform here via style because useAnimate handles it,
          // but we can set opacity to 0 until the sequence starts if we really wanted to.
          // For now, let's keep it simple.
        }}
      >
        <span
          className={cn("relative h-[1lh] backface-hidden block", textClassName)}
          style={{ transform: FRONT_FACE_TRANSFORMS[rotateDirection] }}
        >
          {char}
        </span>
        <span
          className={cn(
            "absolute top-0 left-0 h-[1lh] backface-hidden block",
            flipTextClassName
          )}
          style={{ transform: SECOND_FACE_TRANSFORMS[rotateDirection] }}
        >
          {char}
        </span>
      </span>
    )
  }
)

CharBox.displayName = "CharBox"
Text3DFlip.displayName = "Text3DFlip"

export default Text3DFlip
