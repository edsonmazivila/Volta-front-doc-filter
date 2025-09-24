import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// No-op middleware: disabled gating for now
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {}


