// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from '../index'

afterEach(cleanup)

describe('ConfirmDialog', () => {
  it('guards a disabled confirmation without blocking cancellation', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <ConfirmDialog
        open
        confirmDisabled
        title="Confirm action"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    )

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toBeDisabled()

    await user.click(confirmButton)

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeEnabled()

    await user.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables cancellation when requested', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<ConfirmDialog open cancelDisabled title="Confirm action" cancelText="Cancel" onOpenChange={onOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeDisabled()

    await user.click(cancelButton)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('uses fade-scale motion without directional translation', () => {
    render(
      <ConfirmDialog
        open
        title="Confirm action"
        description="This action needs your confirmation."
        onOpenChange={() => {}}
      />
    )

    const dialog = screen.getByRole('dialog', { name: 'Confirm action' })

    expect(dialog).toHaveClass('data-[state=open]:fade-in-0', 'data-[state=closed]:fade-out-0')
    expect(dialog).not.toHaveClass('data-[state=open]:zoom-in-99')
    expect(dialog).not.toHaveClass('data-[state=closed]:zoom-out-99')
    expect(dialog).not.toHaveClass(
      'data-[state=open]:slide-in-from-bottom-4',
      'data-[state=closed]:slide-out-to-bottom-4'
    )
  })

  it('stays open when confirmation resolves false', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn().mockResolvedValue(false)
    render(<ConfirmDialog open title="Confirm action" onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it.each([
    ['void', () => undefined],
    ['true', () => true]
  ])('closes when confirmation returns %s', async (_label, onConfirm) => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ConfirmDialog open title="Confirm action" onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not render the secondary action without text', () => {
    const onSecondaryAction = vi.fn()
    render(<ConfirmDialog open title="Confirm action" onSecondaryAction={onSecondaryAction} />)

    expect(screen.queryByRole('button', { name: 'Secondary' })).not.toBeInTheDocument()
    expect(onSecondaryAction).not.toHaveBeenCalled()
  })

  it('fires the secondary action and closes the dialog', async () => {
    const user = userEvent.setup()
    const onSecondaryAction = vi.fn()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Confirm action"
        secondaryActionText="Secondary"
        onSecondaryAction={onSecondaryAction}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Secondary' }))

    expect(onSecondaryAction).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps the default footer order with or without a secondary action', () => {
    const { rerender } = render(<ConfirmDialog open title="Confirm action" confirmText="Confirm" cancelText="Cancel" />)

    const footerButtons = () => screen.getByRole('dialog').querySelectorAll('[data-slot="dialog-footer"] button')
    // Default: [cancel] [confirm].
    expect(footerButtons()[0]).toHaveTextContent('Cancel')
    expect(footerButtons()[1]).toHaveTextContent('Confirm')

    rerender(
      <ConfirmDialog
        open
        title="Confirm action"
        confirmText="Confirm"
        cancelText="Cancel"
        secondaryActionText="Secondary"
        onSecondaryAction={() => undefined}
      />
    )
    // With a secondary action: [secondary] [confirm] [cancel] — cancel rightmost.
    expect(footerButtons()[0]).toHaveTextContent('Secondary')
    expect(footerButtons()[1]).toHaveTextContent('Confirm')
    expect(footerButtons()[2]).toHaveTextContent('Cancel')
  })

  it('honors confirmVariant for the confirm button', () => {
    render(<ConfirmDialog open title="Confirm action" confirmText="Confirm" confirmVariant="ghost" />)

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveClass('hover:bg-accent')
  })

  it('stacks actions vertically with a destructive cancel when layout="stack"', () => {
    render(
      <ConfirmDialog
        open
        title="Confirm action"
        confirmText="Confirm"
        cancelText="Cancel"
        secondaryActionText="Secondary"
        onSecondaryAction={() => undefined}
        layout="stack"
        cancelVariant="destructive"
      />
    )

    const footer = screen.getByRole('dialog').querySelector('[data-slot="dialog-footer"]')
    // Stacked: no horizontal row class, every button stretched full-width.
    expect(footer).toHaveClass('flex-col')
    expect(footer?.className).toContain('[&_button]:w-full')
    const buttons = footer?.querySelectorAll('button') ?? []
    expect(buttons[0]).toHaveTextContent('Secondary')
    expect(buttons[1]).toHaveTextContent('Confirm')
    expect(buttons[2]).toHaveTextContent('Cancel')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('bg-destructive')
  })
})
