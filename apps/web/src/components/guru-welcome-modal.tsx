import { CheckIcon, XIcon, BrainIcon, SparkleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const GURU_WELCOME_SEEN_KEY = "guru-welcome-seen";

interface GuruWelcomeModalProps {
  onClose: () => void;
}

export const GuruWelcomeModal = ({ onClose }: GuruWelcomeModalProps) => {
  const handleClose = () => {
    localStorage.setItem(GURU_WELCOME_SEEN_KEY, "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#BCFAF9]/30 to-[#BCFAF9]/50 px-6 py-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-3">
            <BrainIcon className="size-6 text-[#0d9488]" weight="fill" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900">Meet Guru</h2>
          <p className="text-sm text-zinc-600 mt-1">Your personal academic AI assistant</p>
        </div>

        {/* Intro */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
            <SparkleIcon className="size-5 text-[#0d9488] flex-shrink-0 mt-0.5" weight="fill" />
            <p className="text-sm text-zinc-600 leading-relaxed">
              Guru knows your profile, tracks your session history, and understands where you are in your application journey. Ask anything about your progress.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {/* Can do */}
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">What Guru can do</p>
            <div className="space-y-2">
              {[
                "Answer questions about your progress",
                "Review and give feedback on your essays",
                "Track deadlines and next steps",
                "Research universities and programs",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckIcon className="size-3 text-green-600" weight="bold" />
                  </div>
                  <span className="text-sm text-zinc-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2" />

            {/* Cannot do */}
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">What Guru won't do</p>
            <div className="space-y-2">
              {[
                "Write essays or application content for you",
                "Help with cheating or academic dishonesty",
                "Answer off-topic questions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <XIcon className="size-3 text-red-600" weight="bold" />
                  </div>
                  <span className="text-sm text-zinc-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export const useGuruWelcome = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(GURU_WELCOME_SEEN_KEY);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => setShowWelcome(false);

  return { showWelcome, closeWelcome };
};
