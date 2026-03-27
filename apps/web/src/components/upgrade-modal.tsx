import { Dialog as PrimitiveDialog } from "radix-ui";
import { CalendarIcon, LockIcon, XIcon } from "@phosphor-icons/react";

const CALENDLY_URL = "https://calendly.com/team-studentize/new-meeting";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureName = "this feature",
}: UpgradeModalProps) {
  return (
    <PrimitiveDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PrimitiveDialog.Portal>
        <PrimitiveDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut z-50" />
        <PrimitiveDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-2xl shadow-xl p-6 z-50 focus:outline-none data-[state=open]:animate-contentShow">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <XIcon className="size-5" />
          </button>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="size-8 text-blue-600" weight="duotone" />
            </div>

            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Book Your Free Consultation
            </h2>

            <p className="text-zinc-600 mb-6">
              To access {featureName}, schedule a free 1-on-1 consultation with the Studentize team.
              We'll help you get started on your college application journey.
            </p>

            <div className="space-y-3">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <CalendarIcon className="size-5" weight="bold" />
                  Schedule Free Consultation
                </span>
              </a>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-zinc-600 font-medium hover:text-zinc-900 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </PrimitiveDialog.Content>
      </PrimitiveDialog.Portal>
    </PrimitiveDialog.Root>
  );
}

interface LockedOverlayProps {
  onClick: () => void;
  message?: string;
}

export function LockedOverlay({
  onClick,
  message = "Premium Feature",
}: LockedOverlayProps) {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-colors z-10"
    >
      <div className="p-3 bg-zinc-100 rounded-full mb-2">
        <LockIcon className="size-5 text-zinc-500" weight="fill" />
      </div>
      <span className="text-sm font-medium text-zinc-600">{message}</span>
      <span className="text-xs text-blue-600 mt-1">Click to unlock</span>
    </div>
  );
}
