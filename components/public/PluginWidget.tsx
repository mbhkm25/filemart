// PluginWidget Component
// Dynamic widget rendering with error boundary

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import Card from '@/components/common/Card'

interface PluginWidgetProps {
  pluginKey: string
  config?: Record<string, any>
}

interface ErrorBoundaryState {
  hasError: boolean
}

class PluginErrorBoundary extends Component<
  { children: ReactNode; pluginKey: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; pluginKey: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Plugin ${this.props.pluginKey} error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null // Fail silently - don't show broken plugins
    }

    return this.props.children
  }
}

export default function PluginWidget({
  pluginKey,
  config,
}: PluginWidgetProps) {
  // Try to load plugin component dynamically
  let PluginComponent: React.ComponentType<{ config?: Record<string, any> }> | null = null

  try {
    // Dynamic import of plugin widget
    // This will be implemented when plugins are available
    // For now, return null to not break the UI
    PluginComponent = null
  } catch (error) {
    console.error(`Failed to load plugin ${pluginKey}:`, error)
  }

  // If plugin component is not available, return null (don't render anything)
  if (!PluginComponent) {
    return null
  }

  return (
    <PluginErrorBoundary pluginKey={pluginKey}>
      <Card className="w-full">
        <PluginComponent config={config} />
      </Card>
    </PluginErrorBoundary>
  )
}

