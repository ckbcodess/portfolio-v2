"use client"

import React, { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"

interface CodeBlockCommandProps {
  mcp?: boolean
}

export function CodeBlockCommand({ mcp }: CodeBlockCommandProps) {
  const [copied, setCopied] = useState(false)
  
  const command = mcp 
    ? "npx @spell/mcp enable" 
    : "npm install @spell/ui"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-sm overflow-hidden shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal size={14} />
          <span className="text-xs uppercase tracking-widest font-semibold">Terminal</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Copy command"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 select-none">$</span>
        <code className="text-foreground">{command}</code>
      </div>
      
      {/* Aesthetic gradient edge */}
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none" />
    </div>
  )
}
