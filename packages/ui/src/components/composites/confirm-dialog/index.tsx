import * as React from 'react'

import { Button } from '@cherrystudio/ui/components/primitives/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@cherrystudio/ui/components/primitives/dialog'

interface ConfirmDialogProps {
  /** Controls the open state of the dialog */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Dialog title */
  title: React.ReactNode
  /** Dialog description */
  description?: React.ReactNode
  /** Custom content below description */
  content?: React.ReactNode
  /** Confirm button text */
  confirmText?: string
  /** Confirm button style; defaults to `destructive`/`default` per the destructive flag. */
  confirmVariant?: 'default' | 'ghost' | 'outline' | 'destructive'
  /** Cancel button text */
  cancelText?: string
  /** Disabled state for cancel button */
  cancelDisabled?: boolean
  /** Return false to keep the dialog open; void or true closes it. */
  onConfirm?: () => boolean | void | Promise<boolean | void>
  /** Optional secondary action button text. When present the footer reads
   * [secondary] [confirm] [cancel] with cancel rightmost; without it the
   * default [cancel] [confirm] order is unchanged. */
  secondaryActionText?: string
  /** Return false to keep the dialog open; void or true closes it. */
  onSecondaryAction?: () => boolean | void | Promise<boolean | void>
  /** Whether this is a destructive action (e.g., delete) */
  destructive?: boolean
  /** Loading state for confirm button */
  confirmLoading?: boolean
  /** Disabled state for confirm button */
  confirmDisabled?: boolean
  /** Optional className for DialogContent */
  contentClassName?: string
  /** Optional className for DialogOverlay */
  overlayClassName?: string
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  cancelDisabled = false,
  onConfirm,
  secondaryActionText,
  onSecondaryAction,
  destructive = false,
  confirmLoading = false,
  confirmDisabled = false,
  contentClassName,
  overlayClassName
}: ConfirmDialogProps) {
  const handleConfirm = React.useCallback(async () => {
    const result = await onConfirm?.()
    if (result !== false) onOpenChange?.(false)
  }, [onConfirm, onOpenChange])

  const handleSecondaryAction = React.useCallback(async () => {
    const result = await onSecondaryAction?.()
    if (result !== false) onOpenChange?.(false)
  }, [onSecondaryAction, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        motion="fade-scale"
        showCloseButton={false}
        className={contentClassName}
        overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {/* min-w-0 stops wide custom content (e.g. full-width buttons) from
            stretching the grid track past the dialog's max width. */}
        {content && <div className="min-w-0">{content}</div>}
        {/* flex-wrap lets long localized labels flow to a second row instead of
            overflowing the dialog; min-w-0 lets buttons shrink below their text
            width so the wrap actually triggers. */}
        <DialogFooter className="flex-wrap [&_button]:max-w-full [&_button]:min-w-0">
          {secondaryActionText && onSecondaryAction ? (
            // Extended footer: [secondary] [confirm] [cancel] — cancel stays rightmost.
            <>
              <Button variant="ghost" onClick={handleSecondaryAction}>
                {secondaryActionText}
              </Button>
              <Button
                variant={confirmVariant ?? (destructive ? 'destructive' : 'default')}
                onClick={handleConfirm}
                loading={confirmLoading}
                disabled={confirmDisabled}>
                {confirmText}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" disabled={cancelDisabled}>
                  {cancelText}
                </Button>
              </DialogClose>
            </>
          ) : (
            // Stock footer: [cancel] [confirm].
            <>
              <DialogClose asChild>
                <Button variant="outline" disabled={cancelDisabled}>
                  {cancelText}
                </Button>
              </DialogClose>
              <Button
                variant={confirmVariant ?? (destructive ? 'destructive' : 'default')}
                onClick={handleConfirm}
                loading={confirmLoading}
                disabled={confirmDisabled}>
                {confirmText}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog, type ConfirmDialogProps }
