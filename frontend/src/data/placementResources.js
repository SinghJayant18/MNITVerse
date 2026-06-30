export const PLACEMENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'dsa', label: 'DSA' },
  { id: 'cp', label: 'CP' },
  { id: 'core', label: 'Core Subjects' },
  { id: 'interview', label: 'Interview Prep' },
]

export const PLACEMENT_RESOURCES = [
  {
    id: 'blind-75',
    title: 'Blind 75',
    description: 'Curated 75 LeetCode problems covering essential DSA patterns for interviews.',
    url: 'https://neetcode.io/practice/practice/blind75',
    category: 'dsa',
    source: 'NeetCode',
  
  },
  {
    id: 'neetcode-150',
    title: 'NeetCode 150',
    description: '150 hand-picked problems organized by topic for structured interview prep.',
    url: 'https://neetcode.io/practice/practice/neetcode150',
    category: 'dsa',
    source: 'NeetCode',
    
  },
  {
    id: 'neetcode-250',
    title: 'NeetCode 250',
    description: 'Extended problem set with deeper coverage for strong DSA preparation.',
    url: 'https://neetcode.io/practice/practice/neetcode250',
    category: 'dsa',
    source: 'NeetCode',

  },
  {
    id: 'neetcode-all',
    title: 'NeetCode All Problems',
    description: 'Full NeetCode problem library — browse every question in one place.',
    url: 'https://neetcode.io/practice/practice/allNC',
    category: 'dsa',
    source: 'NeetCode',
  
  },
  {
    id: 'striver-a2z',
    title: 'Striver A2Z DSA Sheet',
    description: 'Complete A-to-Z DSA roadmap from basics to advanced topics.',
    url: 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z',
    category: 'dsa',
    source: 'TakeUForward',
  
  },
  {
    id: 'striver-sde',
    title: 'Striver SDE Sheet',
    description: 'Top coding interview problems for SDE roles at product companies.',
    url: 'https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems',
    category: 'interview',
    source: 'TakeUForward',
   
  },
  {
    id: 'striver-core',
    title: 'DBMS / CN / OS Interview Sheet',
    description: 'Must-do core CS subject questions for SDE interviews.',
    url: 'https://takeuforward.org/interviews/must-do-questions-for-dbms-cn-os-interviews-sde-core-sheet',
    category: 'core',
    source: 'TakeUForward',
    icon: '🖥️',
  },
  {
    id: 'striver-cp',
    title: 'Striver CP Sheet',
    description: 'Competitive programming sheet for contests and coding battles.',
    url: 'https://takeuforward.org/competitive-programming/strivers-cp-sheet',
    category: 'cp',
    source: 'TakeUForward',
    
  },
  {
    id: 'striver-os',
    title: 'OS Interview Questions',
    description: 'Most asked operating system interview questions with explanations.',
    url: 'https://takeuforward.org/operating-system/most-asked-operating-system-interview-questions',
    category: 'interview',
    source: 'TakeUForward',
   
  },
]
