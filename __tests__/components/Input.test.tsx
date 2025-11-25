// Input Component Tests
// Test types, validation, and error states per FIS.md

import { render, screen, fireEvent } from '../helpers/test-utils'
import Input from '@/components/common/Input'

describe('Input Component', () => {
  test('should render with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  test('should render all input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />)
    expect(screen.getByPlaceholderText('Text')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')

    rerender(<Input type="number" placeholder="Number" />)
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number')

    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
  })

  test('should display label when provided', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  test('should display error message', () => {
    render(<Input error="Error message" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toHaveClass('text-red-600')
  })

  test('should handle value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test')
  })

  test('should handle disabled state', () => {
    render(<Input disabled placeholder="Disabled" />)
    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()
  })

  test('should apply focus styles', () => {
    render(<Input placeholder="Focus test" />)
    const input = screen.getByPlaceholderText('Focus test')
    
    fireEvent.focus(input)
    expect(input).toHaveFocus()
  })
})

