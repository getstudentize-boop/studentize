import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type { AptitudeTestSession } from "@student/db/src/schema/aptitude";

// Predefined questions - should match API data
const QUESTIONS = [
  {
    question: "Q1: What kind of tasks do you enjoy the most?",
    options: [
      "Technical/Analytical tasks",
      "Scientific/Medical tasks",
      "Creative/Expressive tasks",
      "Business/Strategic tasks",
      "People/Service tasks",
    ],
    emoji: "🧠",
  },
  {
    question: "Q2: How do you prefer to solve problems?",
    options: [
      "Using data and technical solutions",
      "Through methodical research and investigation",
      "With creative and innovative approaches",
      "By developing effective strategies and plans",
      "Through collaboration and discussion with others",
    ],
    emoji: "🔍",
  },
  {
    question: "Q3: In what environment do you learn best?",
    options: [
      "Technical labs with equipment and technology",
      "Scientific research spaces with experimentation",
      "Creative studios where I can express myself",
      "Professional environments with clear structures",
      "Community settings with lots of interaction",
    ],
    emoji: "🏫",
  },
  {
    question: "Q4: Which skills would you most like to develop?",
    options: [
      "Technical and digital skills",
      "Scientific research and analytical skills",
      "Creative and artistic expression",
      "Leadership and strategic thinking",
      "Communication and interpersonal skills",
    ],
    emoji: "💪",
  },
  {
    question: "Q5: What impact would you like your career to have?",
    options: [
      "Advancing technology and innovation",
      "Making scientific discoveries and progress",
      "Creating meaningful cultural or artistic works",
      "Building successful businesses and organizations",
      "Helping people and improving communities",
    ],
    emoji: "🌟",
  },
  {
    question: "Q6: You're given a project. Which sounds most fun to you?",
    options: [
      "Build a technical or scientific solution",
      "Design and create artistic content",
      "Develop a business or strategic plan",
      "Organize community or service programs",
      "Research and analyze complex problems",
    ],
    emoji: "🚀",
  },
  {
    question: "Q7: How do you like to work or learn?",
    options: [
      "Hands-on / Trial-and-error",
      "Open-ended creative exploration",
      "Team collaboration",
      "Competitive / Goal-oriented",
      "Structured / Methodical approach",
    ],
    emoji: "📚",
  },
  {
    question: "Q8: What would make you feel most proud in 10 years?",
    options: [
      "Built something used by millions",
      "Inspired, entertained, or moved someone",
      "Created change or improved lives",
      "Built or led a major business",
      "Discovered or innovated something significant",
    ],
    emoji: "🏆",
  },
];

type QuestionsStepProps = {
  session: AptitudeTestSession;
  updateSession: (data: {
    questionsResponses?: { questions: string[]; answers: string[] };
  }) => Promise<unknown>;
  onNext: () => void;
  onPrevious: () => void;
  readOnly?: boolean;
};

export function QuestionsStep({
  session,
  updateSession,
  onNext,
  onPrevious,
  readOnly = false,
}: QuestionsStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    session.questionsResponses?.answers || []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync with session data
  useEffect(() => {
    setAnswers(session.questionsResponses?.answers || []);
  }, [session.questionsResponses]);

  // Start from first unanswered question
  useEffect(() => {
    const firstUnanswered = answers.findIndex((a) => !a);
    if (firstUnanswered !== -1) {
      setCurrentQuestionIndex(firstUnanswered);
    } else if (answers.length < QUESTIONS.length) {
      setCurrentQuestionIndex(answers.length);
    }
  }, []);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const answeredCount = answers.filter((a) => a).length;
  const allAnswered = answeredCount === totalQuestions;

  const selectAnswer = async (answer: string) => {
    if (readOnly) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    // Save progress
    setIsSaving(true);
    try {
      await updateSession({
        questionsResponses: {
          questions: QUESTIONS.map((q) => q.question),
          answers: newAnswers,
        },
      });

      // Auto-advance to next question after short delay
      if (currentQuestionIndex < totalQuestions - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 300);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleFinish = async () => {
    if (!allAnswered) return;
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-600">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-zinc-600">
            {answeredCount} answered
          </span>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question dots for navigation */}
      <div className="flex justify-center gap-2 mb-6">
        {QUESTIONS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              index === currentQuestionIndex
                ? "bg-blue-600 scale-125"
                : answers[index]
                  ? "bg-green-500"
                  : "bg-zinc-300"
            )}
          />
        ))}
      </div>

      {/* Current question */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">{currentQuestion.emoji}</span>
          <h2 className="text-xl font-semibold text-zinc-900">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(option)}
              disabled={readOnly || isSaving}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                currentAnswer === option
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                readOnly && "cursor-default"
              )}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (currentQuestionIndex > 0) {
              setCurrentQuestionIndex((prev) => prev - 1);
            } else {
              onPrevious();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          {currentQuestionIndex > 0 ? "Previous" : "Back"}
        </button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={!currentAnswer}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-zinc-600 transition-colors",
              currentAnswer ? "hover:text-zinc-900" : "opacity-50 cursor-not-allowed"
            )}
          >
            Next
            <ArrowRightIcon className="size-4" />
          </button>
        ) : readOnly ? (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            Back to Results
            <ArrowRightIcon className="size-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!allAnswered || isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all",
              allAnswered
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isSaving ? "Saving..." : "See Results"}
            <ArrowRightIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
