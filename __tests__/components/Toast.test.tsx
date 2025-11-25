// Toast Component Tests
// Test display, auto-dismiss, and types per FIS.md

import { render, screen, waitFor } from '../helpers/test-utils'
import { ToastProvider, useToast } from '@/components/common/Toast'
import { act } from 'react'

function TestComponent() {
  const { showToast } = useToast()

  return (
    <div>
      <button onClick={() => showToast('success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => showToast('error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => showToast('warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => showToast('info', 'Info message')}>
        Show Info
      </button>
    </div>
  )
}

describe('Toast Component', () => {
  test('should display success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Success')
    await act(async () => {
      button.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })
  })

  test('should display error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Error')
    await act(async () => {
      button.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  test('should display warning toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Warning')
    await act(async () => {
      button.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })
  })

  test('should display info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Info')
    await act(async () => {
      button.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument()
    })
  })

  test('should auto-dismiss after 3 seconds', async () => {
    jest.useFakeTimers()
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const button = screen.getByText('Show Success')
    await act(async () => {
      button.click()
    })

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })
})

