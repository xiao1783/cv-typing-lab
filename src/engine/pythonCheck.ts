import type { ChallengeValidator } from '@/data/types'

export interface CheckResult {
  description: string
  passed: boolean
  detail: string
}

interface CallInfo {
  name: string
  args: string[]
}

/** 移除注释并保留字符串占位，避免字符串/注释内容干扰静态判断 */
function stripComments(source: string): string {
  let out = ''
  let i = 0
  let quote: string | null = null
  while (i < source.length) {
    const ch = source[i]
    if (quote) {
      out += ch
      if (ch === '\\') {
        out += source[i + 1] ?? ''
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i++
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      out += ch
      i++
      continue
    }
    if (ch === '#') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    out += ch
    i++
  }
  return out
}

function splitTopLevel(raw: string): string[] {
  const args: string[] = []
  let depth = 0
  let quote: string | null = null
  let current = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (quote) {
      current += ch
      if (ch === '\\') {
        current += raw[i + 1] ?? ''
        i++
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      current += ch
      continue
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++
    if (ch === ')' || ch === ']' || ch === '}') depth--
    if (ch === ',' && depth === 0) {
      args.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim() !== '') args.push(current.trim())
  return args
}

/** 提取源码中的函数调用（不执行代码），支持嵌套与关键字参数 */
export function findCalls(source: string): CallInfo[] {
  const code = stripComments(source)
  const calls: CallInfo[] = []
  const nameRegex = /[A-Za-z_]\w*(\.[A-Za-z_]\w*)*/y
  let i = 0
  let quote: string | null = null
  while (i < code.length) {
    const ch = code[i]
    if (quote) {
      if (ch === '\\') i += 2
      else {
        if (ch === quote) quote = null
        i++
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      i++
      continue
    }
    nameRegex.lastIndex = i
    const m = nameRegex.exec(code)
    if (m) {
      let j = i + m[0].length
      while (j < code.length && (code[j] === ' ' || code[j] === '\t')) j++
      if (code[j] === '(') {
        let depth = 1
        let k = j + 1
        let innerQuote: string | null = null
        while (k < code.length && depth > 0) {
          const c = code[k]
          if (innerQuote) {
            if (c === '\\') k++
            else if (c === innerQuote) innerQuote = null
          } else if (c === '"' || c === "'") innerQuote = c
          else if (c === '(') depth++
          else if (c === ')') depth--
          k++
        }
        const inner = code.slice(j + 1, k - 1)
        calls.push({ name: m[0], args: splitTopLevel(inner) })
        i = k
        continue
      }
      i += m[0].length
      continue
    }
    i++
  }
  return calls
}

function hasImport(source: string, module: string): boolean {
  const code = stripComments(source)
  const direct = new RegExp(`^\\s*import\\s+${module.replace(/\./g, '\\.')}(\\s|$)`, 'm')
  const from = new RegExp(`^\\s*from\\s+${module.replace(/\./g, '\\.')}\\s+import\\b`, 'm')
  return direct.test(code) || from.test(code)
}

function argMatches(arg: string, expect: string | number): boolean {
  const normalized = arg.replace(/\s+/g, '')
  if (typeof expect === 'number') return normalized === String(expect)
  // 支持位置参数与关键字参数两种写法
  return normalized === String(expect) || normalized.endsWith('=' + String(expect))
}

export function runChallengeChecks(source: string, validators: ChallengeValidator[]): CheckResult[] {
  const code = stripComments(source)
  const calls = findCalls(code)
  return validators.map((v) => {
    let passed = false
    let detail = ''
    switch (v.type) {
      case 'import':
        passed = hasImport(code, v.module ?? '')
        detail = passed ? '已检测到对应导入' : `未检测到对 ${v.module} 的导入`
        break
      case 'function_call':
        passed = calls.some((c) => c.name === v.name)
        detail = passed ? '已检测到函数调用' : `未检测到 ${v.name}() 调用`
        break
      case 'call_argument': {
        const call = calls.find((c) => c.name === v.name)
        if (call && v.argPosition != null) {
          const arg = call.args[v.argPosition]
          passed = arg != null && v.expect != null && argMatches(arg, v.expect)
          detail = passed ? '参数取值符合要求' : `期望第 ${v.argPosition + 1} 个参数为 ${v.expect}`
        } else {
          detail = '未找到目标函数调用'
        }
        break
      }
      case 'keyword':
        passed = new RegExp(`\\b${v.name}\\b`).test(code)
        detail = passed ? '关键字结构存在' : `缺少关键字 ${v.name}`
        break
      case 'for_loop':
        passed = /\bfor\s+[A-Za-z_]\w*\s+in\b/.test(code)
        detail = passed ? '已检测到 for 循环' : '未检测到 for 循环'
        break
      case 'assign':
        passed = new RegExp(`\\b${v.name}\\s*=(?!=)`).test(code)
        detail = passed ? '已检测到赋值' : `未检测到变量 ${v.name} 的赋值`
        break
      case 'structure_count': {
        const count = calls.filter((c) => c.name === v.name).length
        passed = v.min != null && count >= v.min
        detail = `检测到 ${count} 次 ${v.name}() 调用，要求至少 ${v.min ?? 0} 次`
        break
      }
    }
    return { description: v.description, passed, detail }
  })
}
