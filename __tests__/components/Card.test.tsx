// Card Component Tests
// Test rendering and hover effects per FIS.md

import { render, screen } from '../helpers/test-utils'
import Card from '@/components/common/Card'

describe('Card Component', () => {
  test('should render children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    )
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  test('should apply default padding', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('p-4')
  })

  test('should apply radius variants', () => {
    const { rerender } = render(<Card radius="md">Content</Card>)
    let card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('rounded-md')

    rerender(<Card radius="lg">Content</Card>)
    card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('rounded-lg')
  })

  test('should apply shadow variants', () => {
    const { rerender } = render(<Card shadow="sm">Content</Card>)
    let card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('shadow-sm')

    rerender(<Card shadow="md">Content</Card>)
    card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('shadow-md')
  })

  test('should apply custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  test('should have hover effect classes', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content').closest('div')
    // Card should have transition classes for hover
    expect(card).toHaveClass('transition')
  })
})

