// PluginWidget Component
// Dynamic widget rendering with error boundary
// Follows DFD Section 10: Public Widget Rendering

'use client'

import { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react'
import Card from '@/components/common/Card'
import Skeleton from '@/components/common/Skeleton'
import type { PluginWidgetProps as BasePluginWidgetProps } from '@/types/plugin'

interface PluginWidgetProps extends BasePluginWidgetProps {
  pluginKey: string
  installationId: string
  merchantId: string
  profileId: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class PluginErrorBoundary extends Component<
  { children: ReactNode; pluginKey: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; pluginKey: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Plugin ${this.props.pluginKey} error:`, error, errorInfo)
    // In production, this could log to an error tracking service
  }

  render() {
    if (this.state.hasError) {
      // Fail silently - don't show broken plugins in public view
      // This follows FIS: Plugin widgets should not break the page
      return null
    }

    return this.props.children
  }
}

export default function PluginWidget({
  pluginKey,
  config,
  installationId,
  merchantId,
  profileId,
}: PluginWidgetProps) {
  const [PluginComponent, setPluginComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadWidget() {
      try {
        setIsLoading(true)
        setLoadError(null)

        // Load widget using plugin loader
        // In production, this would call an API endpoint that uses pluginLoader
        // For now, we'll use a client-side approach
        const response = await fetch(
          `/api/public/plugins/${installationId}/widget?merchantId=${merchantId}&profileId=${profileId}`
        )

        if (!response.ok) {
          throw new Error('Failed to load plugin widget')
        }

        // The API would return the component or component data
        // For now, we'll handle the case where plugins aren't fully implemented
        // This is a placeholder that will be replaced when plugins are available
        
        // In production, the response would contain the component module
        // and we would dynamically import it here
        
        if (mounted) {
          setPluginComponent(null) // Will be set when plugins are available
          setIsLoading(false)
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error as Error)
          setIsLoading(false)
        }
      }
    }

    loadWidget()

    return () => {
      mounted = false
    }
  }, [pluginKey, installationId, merchantId, profileId])

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <Skeleton className="h-32" />
      </Card>
    )
  }

  // Show error state (silently fail)
  if (loadError || !PluginComponent) {
    // Fail silently - don't show broken plugins
    // This follows FIS: Plugin widgets should not break the page
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

