/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export type TemplateData = Record<string, unknown>

export interface TemplateEntry<TData extends TemplateData = TemplateData> {
  component: React.ComponentType<TData>
  subject: string | ((data: TData) => string)
  to?: string
  displayName?: string
  previewData?: TData
}

import { template as circleInvitation } from './circle-invitation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'circle-invitation': circleInvitation,
}
