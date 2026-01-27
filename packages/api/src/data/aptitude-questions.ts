/**
 * Predefined aptitude test questions with their options, weights, and category mappings
 */

export type PredefinedQuestion = {
  question: string;
  options: string[];
  emoji: string;
  weight: number;
  mappedCategories: Record<number, string[]>;
};

export const PREDEFINED_QUESTIONS: PredefinedQuestion[] = [
  // Q1: Broad personality/work-style question
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
    weight: 2,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science"],
      1: ["Sciences", "Medicine and Pharma"],
      2: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      3: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      4: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
    },
  },

  // Q2: Problem-solving approach
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
    weight: 1,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science"],
      1: ["Sciences", "Medicine and Pharma"],
      2: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      3: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      4: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
    },
  },

  // Q3: Learning environment preference
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
    weight: 1,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science"],
      1: ["Sciences", "Medicine and Pharma"],
      2: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      3: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      4: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
    },
  },

  // Q4: Skills development preference
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
    weight: 1,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science"],
      1: ["Sciences", "Medicine and Pharma"],
      2: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      3: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      4: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
    },
  },

  // Q5: Career impact preference
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
    weight: 1,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science"],
      1: ["Sciences", "Medicine and Pharma"],
      2: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      3: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      4: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
    },
  },

  // Q6: Project-style interest
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
    weight: 1,
    mappedCategories: {
      0: [
        "Engineering",
        "Computers and Data Science",
        "Sciences",
        "Medicine and Pharma",
      ],
      1: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      2: ["Management", "Finance and Banking", "Marketing and Advertising", "Law"],
      3: [
        "Humanities and Social Sciences",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
      4: ["Sciences", "Engineering", "Humanities and Social Sciences", "Law"],
    },
  },

  // Q7: Learning/working style
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
    weight: 1,
    mappedCategories: {
      0: ["Engineering", "Sciences", "Medicine and Pharma"],
      1: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
        "Humanities and Social Sciences",
      ],
      2: [
        "Management",
        "Marketing and Advertising",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
      3: ["Finance and Banking", "Law", "Computers and Data Science"],
      4: ["Sciences", "Medicine and Pharma", "Engineering", "Law"],
    },
  },

  // Q8: Future ambition/goal
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
    weight: 2,
    mappedCategories: {
      0: ["Engineering", "Computers and Data Science", "Sciences"],
      1: [
        "Design",
        "Performing and Creative Arts",
        "Media and Journalism",
        "Architecture",
      ],
      2: [
        "Humanities and Social Sciences",
        "Medicine and Pharma",
        "Hospitality and Tourism",
        "Sports and Nutrition",
      ],
      3: ["Management", "Finance and Banking", "Law", "Marketing and Advertising"],
      4: [
        "Sciences",
        "Engineering",
        "Medicine and Pharma",
        "Computers and Data Science",
      ],
    },
  },
];

/**
 * Get a specific question with its options and mappings
 */
export function getQuestion(questionNumber: number) {
  if (questionNumber < 1 || questionNumber > PREDEFINED_QUESTIONS.length) {
    throw new Error(`Invalid question number: ${questionNumber}`);
  }

  const baseTemplate = PREDEFINED_QUESTIONS[questionNumber - 1];

  return {
    question: baseTemplate.question,
    options: baseTemplate.options,
    emoji: baseTemplate.emoji,
    weight: baseTemplate.weight,
    mappedCategories: baseTemplate.mappedCategories,
  };
}

/**
 * Get the total number of questions
 */
export function getTotalQuestions(): number {
  return PREDEFINED_QUESTIONS.length;
}

/**
 * Subject comfort level categories
 */
export const SUBJECT_COMFORT_CATEGORIES = [
  "mathematics",
  "sciences",
  "humanities",
  "languages",
  "arts",
] as const;

export type SubjectComfortCategory = (typeof SUBJECT_COMFORT_CATEGORIES)[number];

/**
 * Map interest areas to required subjects with comfort level requirements
 */
export const INTEREST_AREA_REQUIRED_SUBJECTS: Record<string, string[]> = {
  Design: ["art", "arts", "drawing", "design"],
  "Performing and Creative Arts": ["art", "arts", "music", "design"],
  Architecture: ["drawing", "design", "art", "mathematics"],
  "Media and Journalism": ["writing", "communication", "english"],
  Engineering: ["mathematics", "physics", "science"],
  "Computers and Data Science": [
    "mathematics",
    "programming",
    "statistics",
    "computer science",
  ],
  "Finance and Banking": [
    "mathematics",
    "economics",
    "accounting",
    "statistics",
    "business",
  ],
  Sciences: ["mathematics", "physics", "chemistry", "biology", "science"],
  "Medicine and Pharma": ["biology", "chemistry", "mathematics", "science"],
  "Humanities and Social Sciences": [
    "writing",
    "history",
    "philosophy",
    "psychology",
    "english",
    "humanities",
  ],
  Law: ["writing", "history", "government", "english", "humanities"],
  "Hospitality and Tourism": ["geography", "communication", "business"],
  "Marketing and Advertising": [
    "communication",
    "psychology",
    "art",
    "english",
    "humanities",
  ],
  "Sports and Nutrition": [
    "biology",
    "health",
    "physiology",
    "science",
    "sports",
  ],
  Management: ["business", "economics", "communication", "humanities"],
};
