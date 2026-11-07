import type {
  BlankSpec,
  ChallengeValidator,
  Difficulty,
  KnowledgeSection,
  Level,
  PracticeMode
} from '../types'

/** 知识解析构建器：未提供的字段使用安全默认值，保证各关卡结构统一 */
export function knowledge(p: Partial<KnowledgeSection>): KnowledgeSection {
  return {
    overview: p.overview ?? '',
    lineExplanations: p.lineExplanations ?? [],
    pythonNotes: p.pythonNotes ?? [],
    apiDocs: p.apiDocs ?? [],
    formulas: p.formulas ?? [],
    flow: p.flow ?? [],
    scenarios: p.scenarios ?? [],
    research: p.research ?? [],
    pitfalls: p.pitfalls ?? [],
    related: p.related ?? []
  }
}

export interface LevelSeed {
  difficulty?: Difficulty
  estMinutes?: number
  mode?: PracticeMode
  code: string
  task: string
  know: KnowledgeSection
  blank?: BlankSpec
  validators?: ChallengeValidator[]
  labExperiment?: string
  tags?: string[]
}

export function lv(chapterId: string, index: number, title: string, seed: LevelSeed): Level {
  const seq = String(index).padStart(2, '0')
  return {
    id: `${chapterId}-l${seq}`,
    chapterId,
    index,
    title,
    difficulty: seed.difficulty ?? '基础',
    estMinutes: seed.estMinutes ?? 8,
    mode: seed.mode ?? 'follow',
    targetCode: seed.code,
    task: seed.task,
    blank: seed.blank,
    validators: seed.validators,
    knowledge: seed.know,
    quizIds: [`q-${chapterId}-l${seq}`],
    tags: seed.tags ?? [],
    labExperiment: seed.labExperiment
  }
}
