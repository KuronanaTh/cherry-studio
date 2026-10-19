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
  /** Cancel button style; defaults to `outline`. */
  cancelVariant?: 'outline' | 'destructive' | 'ghost' | 'default'
  /** Disabled state for cancel button */
  cancelDisabled?: boolean
  /** `row` (default) keeps the stock horizontal footer; `stack` lays every
   * action out as a full-width row top-to-bottom — long localized labels
   * never overflow. */
  layout?: 'row' | 'stack'
  /** Return false to keep the dialog open; void or true closes it. */
  onConfirm?: () => boolean | void | Promise<boolean | void>
  /** Optional secondary action button text. When present the footer reads
   * [secondary] [confirm] [cancel] with cancel rightmost; without it the
   * default [cancel] [confirm] order is unchanged. */
  secondaryActionText?: string
  /** Secondary button style; defaults to `ghost`. */
  secondaryVariant?: 'default' | 'ghost' | 'outline' | 'destructive'
  /** Return false to keep the dialog open; void or true closes it. */
  onSecondaryAction?: () => boolean | void | Promise<boolean | void>
  /** Optional extra action appended after the confirm button (used by stacked
   * layouts that offer more than two choices). */
  extraAction?: { text: string; onAction: () => boolean | void | Promise<boolean | void> }
  /** Extra action button style; defaults to `ghost`. */
  extraVariant?: 'default' | 'ghost' | 'outline' | 'destructive'
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
  cancelVariant = 'outline',
  cancelDisabled = false,
  layout = 'row',
  onConfirm,
  secondaryActionText,
  secondaryVariant = 'ghost',
  onSecondaryAction,
  extraAction,
  extraVariant = 'ghost',
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

  const handleExtraAction = React.useCallback(async () => {
    const result = await extraAction?.onAction()
    if (result !== false) onOpenChange?.(false)
  }, [extraAction, onOpenChange])

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
        {/* Stack layout: one full-width action per row, top-to-bottom. */}
        <DialogFooter className={layout === 'stack' ? 'flex-col sm:flex-col [&_button]:w-full' : undefined}>
          {secondaryActionText && onSecondaryAction ? (
            // Extended footer: [secondary] [confirm] [extra?] [cancel].
            <>
              <Button variant={secondaryVariant} onClick={handleSecondaryAction}>
                {secondaryActionText}
              </Button>
              <Button
                variant={confirmVariant ?? (destructive ? 'destructive' : 'default')}
                onClick={handleConfirm}
                loading={confirmLoading}
                disabled={confirmDisabled}>
                {confirmText}
              </Button>
              {extraAction && (
                <Button variant={extraVariant} onClick={handleExtraAction}>
                  {extraAction.text}
                </Button>
              )}
              <DialogClose asChild>
                <Button variant={cancelVariant} disabled={cancelDisabled}>
                  {cancelText}
                </Button>
              </DialogClose>
            </>
          ) : (
            // Stock footer: [cancel] [confirm] [extra?].
            <>
              <DialogClose asChild>
                <Button variant={cancelVariant} disabled={cancelDisabled}>
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
              {extraAction && (
                <Button variant={extraVariant} onClick={handleExtraAction}>
                  {extraAction.text}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog, type ConfirmDialogProps }
