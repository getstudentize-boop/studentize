/**
 * Official interest areas for aptitude test
 */
export const OFFICIAL_INTEREST_AREAS = [
  "Management",
  "Engineering",
  "Computers and Data Science",
  "Design",
  "Finance and Banking",
  "Law",
  "Humanities and Social Sciences",
  "Sciences",
  "Medicine and Pharma",
  "Performing and Creative Arts",
  "Media and Journalism",
  "Hospitality and Tourism",
  "Marketing and Advertising",
  "Sports and Nutrition",
  "Architecture",
] as const;

export type InterestArea = (typeof OFFICIAL_INTEREST_AREAS)[number];

/**
 * Career type definition
 */
export type Career = {
  title: string;
  emoji: string;
  major: string;
  category: string;
};

/**
 * Careers organized by interest area
 */
export const CAREERS_BY_INTEREST: Record<string, Career[]> = {
  Management: [
    {
      title: "Management Consultant",
      emoji: "👔",
      major: "Business Administration",
      category: "Management",
    },
    {
      title: "Project Manager",
      emoji: "📊",
      major: "Business Management",
      category: "Management",
    },
    {
      title: "Operations Manager",
      emoji: "🏢",
      major: "Business Administration",
      category: "Management",
    },
  ],
  "Finance and Banking": [
    {
      title: "Financial Analyst",
      emoji: "💰",
      major: "Finance",
      category: "Finance and Banking",
    },
    {
      title: "Investment Banker",
      emoji: "📈",
      major: "Finance or Economics",
      category: "Finance and Banking",
    },
    {
      title: "Financial Advisor",
      emoji: "💼",
      major: "Finance",
      category: "Finance and Banking",
    },
  ],
  "Computers and Data Science": [
    {
      title: "Data Scientist",
      emoji: "💻",
      major: "Computer Science or Data Science",
      category: "Computers and Data Science",
    },
    {
      title: "Software Engineer",
      emoji: "⌨️",
      major: "Computer Science",
      category: "Computers and Data Science",
    },
    {
      title: "Machine Learning Engineer",
      emoji: "🤖",
      major: "Computer Science or Statistics",
      category: "Computers and Data Science",
    },
  ],
  Sciences: [
    {
      title: "Research Scientist",
      emoji: "🔬",
      major: "Physics, Chemistry, or Biology",
      category: "Sciences",
    },
    {
      title: "Data Analyst",
      emoji: "📊",
      major: "Statistics or Mathematics",
      category: "Sciences",
    },
    {
      title: "Laboratory Technician",
      emoji: "🧪",
      major: "Chemistry or Biology",
      category: "Sciences",
    },
  ],
  Engineering: [
    {
      title: "Mechanical Engineer",
      emoji: "⚙️",
      major: "Mechanical Engineering",
      category: "Engineering",
    },
    {
      title: "Civil Engineer",
      emoji: "🏗️",
      major: "Civil Engineering",
      category: "Engineering",
    },
    {
      title: "Electrical Engineer",
      emoji: "⚡",
      major: "Electrical Engineering",
      category: "Engineering",
    },
  ],
  Design: [
    {
      title: "UX Designer",
      emoji: "🎨",
      major: "Design or Human-Computer Interaction",
      category: "Design",
    },
    {
      title: "Product Designer",
      emoji: "📱",
      major: "Design",
      category: "Design",
    },
    {
      title: "Graphic Designer",
      emoji: "🖌️",
      major: "Graphic Design",
      category: "Design",
    },
    {
      title: "UX Researcher",
      emoji: "🔍",
      major: "Human-Computer Interaction or Psychology",
      category: "Design",
    },
    {
      title: "Design Project Manager",
      emoji: "📋",
      major: "Design Management",
      category: "Design",
    },
    {
      title: "Content Designer",
      emoji: "📝",
      major: "Communication Design or Information Architecture",
      category: "Design",
    },
  ],
  "Medicine and Pharma": [
    {
      title: "Pharmacist",
      emoji: "💊",
      major: "Pharmacy",
      category: "Medicine and Pharma",
    },
    {
      title: "Medical Researcher",
      emoji: "🧬",
      major: "Biochemistry or Molecular Biology",
      category: "Medicine and Pharma",
    },
    {
      title: "Healthcare Administrator",
      emoji: "🏥",
      major: "Health Administration",
      category: "Medicine and Pharma",
    },
    {
      title: "Medical Writer",
      emoji: "📝",
      major: "Medical Communication or Journalism",
      category: "Medicine and Pharma",
    },
    {
      title: "Patient Advocate",
      emoji: "🗣️",
      major: "Health Services or Public Health",
      category: "Medicine and Pharma",
    },
    {
      title: "Medical Sales Representative",
      emoji: "🩺",
      major: "Pharmaceutical Sciences or Business",
      category: "Medicine and Pharma",
    },
  ],
  "Humanities and Social Sciences": [
    {
      title: "Policy Analyst",
      emoji: "📜",
      major: "Political Science",
      category: "Humanities and Social Sciences",
    },
    {
      title: "Social Researcher",
      emoji: "👥",
      major: "Sociology",
      category: "Humanities and Social Sciences",
    },
    {
      title: "Human Resources Specialist",
      emoji: "👤",
      major: "Psychology or Human Resources",
      category: "Humanities and Social Sciences",
    },
  ],
  "Performing and Creative Arts": [
    {
      title: "Art Director",
      emoji: "🎭",
      major: "Fine Arts or Design",
      category: "Performing and Creative Arts",
    },
    {
      title: "Music Producer",
      emoji: "🎵",
      major: "Music Production",
      category: "Performing and Creative Arts",
    },
    {
      title: "Theater Director",
      emoji: "🎬",
      major: "Theater Arts",
      category: "Performing and Creative Arts",
    },
    {
      title: "Arts Administrator",
      emoji: "📋",
      major: "Arts Management",
      category: "Performing and Creative Arts",
    },
    {
      title: "Talent Agent",
      emoji: "🌟",
      major: "Arts Management or Business",
      category: "Performing and Creative Arts",
    },
    {
      title: "Creative Project Manager",
      emoji: "📅",
      major: "Arts Management or Project Management",
      category: "Performing and Creative Arts",
    },
  ],
  "Hospitality and Tourism": [
    {
      title: "Hotel Manager",
      emoji: "🏨",
      major: "Hospitality Management",
      category: "Hospitality and Tourism",
    },
    {
      title: "Tourism Consultant",
      emoji: "✈️",
      major: "Tourism Management",
      category: "Hospitality and Tourism",
    },
    {
      title: "Event Planner",
      emoji: "🎪",
      major: "Event Management",
      category: "Hospitality and Tourism",
    },
  ],
  "Media and Journalism": [
    {
      title: "Journalist",
      emoji: "📰",
      major: "Journalism",
      category: "Media and Journalism",
    },
    {
      title: "Public Relations Specialist",
      emoji: "🎤",
      major: "Communications",
      category: "Media and Journalism",
    },
    {
      title: "Media Producer",
      emoji: "📹",
      major: "Media Studies",
      category: "Media and Journalism",
    },
  ],
  "Marketing and Advertising": [
    {
      title: "Marketing Manager",
      emoji: "📣",
      major: "Marketing",
      category: "Marketing and Advertising",
    },
    {
      title: "Brand Strategist",
      emoji: "🎯",
      major: "Marketing or Business",
      category: "Marketing and Advertising",
    },
    {
      title: "Digital Marketer",
      emoji: "📱",
      major: "Digital Marketing",
      category: "Marketing and Advertising",
    },
  ],
  "Sports and Nutrition": [
    {
      title: "Sports Coach",
      emoji: "🏋️",
      major: "Sports Science",
      category: "Sports and Nutrition",
    },
    {
      title: "Nutritionist",
      emoji: "🥗",
      major: "Nutrition Science",
      category: "Sports and Nutrition",
    },
    {
      title: "Athletic Trainer",
      emoji: "🏃",
      major: "Kinesiology",
      category: "Sports and Nutrition",
    },
    {
      title: "Sports Marketing Specialist",
      emoji: "📣",
      major: "Sports Management or Marketing",
      category: "Sports and Nutrition",
    },
    {
      title: "Team Operations Coordinator",
      emoji: "📋",
      major: "Sports Management",
      category: "Sports and Nutrition",
    },
    {
      title: "Sports Media Specialist",
      emoji: "🎥",
      major: "Sports Communication or Journalism",
      category: "Sports and Nutrition",
    },
  ],
  Architecture: [
    {
      title: "Architect",
      emoji: "🏛️",
      major: "Architecture",
      category: "Architecture",
    },
    {
      title: "Urban Planner",
      emoji: "🏙️",
      major: "Urban Planning",
      category: "Architecture",
    },
    {
      title: "Interior Designer",
      emoji: "🪑",
      major: "Interior Design",
      category: "Architecture",
    },
    {
      title: "Architectural Project Coordinator",
      emoji: "📋",
      major: "Architecture or Construction Management",
      category: "Architecture",
    },
    {
      title: "Heritage Conservation Specialist",
      emoji: "🏰",
      major: "Historic Preservation or Conservation Studies",
      category: "Architecture",
    },
    {
      title: "Sustainable Development Consultant",
      emoji: "♻️",
      major: "Sustainable Design or Environmental Studies",
      category: "Architecture",
    },
  ],
  Law: [
    {
      title: "Lawyer",
      emoji: "⚖️",
      major: "Law",
      category: "Law",
    },
    {
      title: "Legal Consultant",
      emoji: "📜",
      major: "Law",
      category: "Law",
    },
    {
      title: "Paralegal",
      emoji: "📋",
      major: "Paralegal Studies",
      category: "Law",
    },
  ],
};

/**
 * Get careers for a specific interest area
 */
export function getCareersForInterest(interest: string): Career[] {
  return CAREERS_BY_INTEREST[interest] || [];
}

/**
 * Get match percentage color based on the percentage value
 */
export function getMatchColor(percentage: number): string {
  if (percentage >= 85) return "#4CAF50"; // Strong match (Green)
  if (percentage >= 70) return "#8BC34A"; // Good match (Light Green)
  if (percentage >= 50) return "#FFC107"; // Moderate match (Amber)
  if (percentage >= 30) return "#FF9800"; // Weak match (Orange)
  return "#F44336"; // Poor match (Red)
}
