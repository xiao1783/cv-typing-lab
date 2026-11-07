/* ============ 课程领域类型 ============ */

export type Difficulty = '入门' | '基础' | '进阶' | '挑战'
export type PracticeMode = 'follow' | 'blank' | 'challenge'

export interface ApiParam {
  name: string
  type: string
  desc: string
  default?: string
}

export interface ApiDoc {
  name: string
  signature: string
  returns?: string
  params: ApiParam[]
}

export interface LineExplain {
  code: string
  explain: string
}

export interface Formula {
  title: string
  latex: string
}

export interface Pitfall {
  problem: string
  fix: string
}

export interface KnowledgeSection {
  overview: string
  lineExplanations: LineExplain[]
  pythonNotes: string[]
  apiDocs: ApiDoc[]
  formulas: Formula[]
  flow: string[]
  scenarios: string[]
  research: string[]
  pitfalls: Pitfall[]
  related: string[]
}

/* 代码填空：以 {{1}} {{2}} 占位，answers 为每个空可接受的答案集合（去空格后比较） */
export interface BlankSpec {
  template: string
  answers: string[][]
  hints: string[]
  analysis: string[]
}

/* 实战模式的结构化校验规则（不执行 Python，不使用 eval） */
export type ValidatorType =
  | 'import'
  | 'function_call'
  | 'call_argument'
  | 'keyword'
  | 'for_loop'
  | 'assign'
  | 'structure_count'

export interface ChallengeValidator {
  type: ValidatorType
  description: string
  module?: string
  name?: string
  argPosition?: number
  expect?: string | number
  min?: number
}

export interface Level {
  id: string
  chapterId: string
  index: number
  title: string
  difficulty: Difficulty
  estMinutes: number
  mode: PracticeMode
  targetCode: string
  task: string
  blank?: BlankSpec
  validators?: ChallengeValidator[]
  knowledge: KnowledgeSection
  quizIds: string[]
  tags: string[]
  labExperiment?: string
}

export interface Chapter {
  id: string
  index: number
  title: string
  subtitle: string
  intro: string
  objectives: string[]
  icon: string
  levels: Level[]
}

/* ============ 测验类型 ============ */

export type QuizType = 'single' | 'multiple' | 'judge' | 'codeBlank' | 'param' | 'result'

export interface QuizQuestion {
  id: string
  type: QuizType
  levelId: string
  topic: string
  stem: string
  code?: string
  options?: { key: string; text: string }[]
  answer: string[]
  acceptable?: string[]
  explanation: string
  mistakeReason: string
  reviewLevelId: string
}

export interface QuizSet {
  id: string
  levelId: string
  title: string
  questions: QuizQuestion[]
}
