import { NextResponse } from 'next/server'

const EMPTY_SOURCE_MAP = '{"version":3,"sources":[],"mappings":""}'

export function middleware() {
  return new NextResponse(EMPTY_SOURCE_MAP, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = {
  matcher: ['/_next/static/chunks/:path*.map'],
}
