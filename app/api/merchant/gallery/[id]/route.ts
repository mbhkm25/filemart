 'use server'

import { NextRequest, NextResponse } from 'next/server'
import { logDeprecated } from '@/lib/deprecated-logger'

export async function GET(req: NextRequest) {
  await logDeprecated(req)
  return NextResponse.json(
    {
      error: 'deprecated',
      message: 'This endpoint is deprecated. Use /api/businesses/:businessId/* instead.',
      replacement: 'https://docs.filemart.app/api/business'
    },
    { status: 410, headers: { 'X-Deprecation-Warning': 'true' } }
  )
}

export const POST = GET
export const PUT = GET
export const PATCH = GET
export const DELETE = GET

