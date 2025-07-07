import { codeFrameColumns } from 'next/dist/compiled/babel/code-frame'
import isInternal from '../../shared/lib/is-internal'
import type { StackFrame } from '../../server/lib/parse-stack'

export type { StackFrame }

export interface IgnorableStackFrame extends StackFrame {
  ignored: boolean
}

export interface OriginalStackFramesRequest {
  frames: StackFrame[]
  isServer: boolean
  isEdgeServer: boolean
  isAppDirectory: boolean
}

export type OriginalStackFramesResponse = OriginalStackFrameResponseResult[]

export type OriginalStackFrameResponseResult =
  PromiseSettledResult<OriginalStackFrameResponse>

export interface OriginalStackFrameResponse {
  originalStackFrame?: (IgnorableStackFrame & { ignored: boolean }) | null
  originalCodeFrame?: string | null
}

/**
 * It looks up the code frame of the traced source.
 * @note It ignores Next.js/React internals, as these can often be huge bundled files.
 */
export function getOriginalCodeFrame(
  frame: IgnorableStackFrame,
  source: string | null,
  colors: boolean = process.stdout.isTTY
): string | null {
  if (!source || isInternal(frame.file)) {
    return null
  }

  return codeFrameColumns(
    source,
    {
      start: {
        // 1-based, but -1 means start line without highlighting
        line: frame.line1 ?? -1,
        // 1-based, but 0 means whole line without column highlighting
        column: frame.column1 ?? 0,
      },
    },
    { forceColor: colors }
  )
}
