export const LEARNING_PATHS = [
  {
    id: 'greetings',
    name: 'Greetings',
    icon: '👋',
    desc: 'Daily greetings & courtesy',
    tokens: ['NAMASTE', 'HELLO', 'GOOD', 'MORNING', 'EVENING', 'THANK_YOU', 'PLEASE', 'YES', 'NO', 'HELP', 'FRIEND', 'YOU', 'ME', 'HOW', 'WHAT', 'NAME']
  },
  {
    id: 'stem-basics',
    name: 'STEM Basics',
    icon: '🔬',
    desc: 'Core science & math concepts',
    tokens: ['ATOM', 'MOLECULE', 'CELL', 'DNA', 'GRAVITY', 'FORCE', 'ENERGY', 'LIGHT', 'MOTION', 'VELOCITY', 'ACCELERATION', 'MASS', 'NUMBER', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'EQUAL', 'CIRCLE', 'TRIANGLE', 'ANGLE']
  },
  {
    id: 'daily',
    name: 'Daily Conversation',
    icon: '💬',
    desc: 'Everyday phrases',
    tokens: ['HELLO', 'HOW', 'YOU', 'GOOD', 'THANK_YOU', 'PLEASE', 'HELP', 'WATER', 'FOOD', 'TIME', 'FRIEND', 'LEARN', 'WORK', 'LOVE', 'OK', 'STOP']
  },
  {
    id: 'alphabet',
    name: 'Alphabet A-Z',
    icon: '🔤',
    desc: 'Fingerspelling all 26 letters',
    tokens: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  },
  {
    id: 'numbers',
    name: 'Numbers 0-9',
    icon: '🔢',
    desc: 'ISL numerical signs',
    tokens: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  },
  {
    id: 'biology',
    name: 'Biology & Life',
    icon: '🧬',
    desc: 'Life science vocabulary',
    tokens: ['CELL', 'DNA', 'HEART', 'BRAIN', 'PLANT', 'ATOM', 'MOLECULE', 'ELEMENT']
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: '💻',
    desc: 'Tech vocabulary',
    tokens: ['COMPUTER', 'CODE', 'ALGORITHM', 'DATA', 'NETWORK', 'ENERGY', 'LIGHT']
  },
  {
    id: 'physics',
    name: 'Physics & Energy',
    icon: '⚛',
    desc: 'Physics concepts',
    tokens: ['MOTION', 'FORCE', 'GRAVITY', 'ENERGY', 'LIGHT', 'WAVE', 'VELOCITY', 'ACCELERATION', 'MASS']
  }
];
