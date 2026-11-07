/// <reference lib="webworker" />
import { runOperation, type OperationResult } from './operations'
import {
  computeDescriptors,
  detectKeypoints,
  matchDescriptors,
  ransacHomography
} from './features'

type Params = Record<string, number | string | boolean>

export type WorkerRequest =
  | { reqId: number; kind: 'base'; opId: string; source: ImageData; params: Params }
  | { reqId: number; kind: 'keypoints'; source: ImageData; maxCount: number; lowThreshold: number }
  | { reqId: number; kind: 'match'; sourceA: ImageData; sourceB: ImageData; ratio: number }
  | {
      reqId: number
      kind: 'ransac'
      src: [number, number][]
      dst: [number, number][]
      threshold: number
      iterations: number
    }

export type WorkerResponse = {
  reqId: number
  ok: boolean
  error?: string
  base?: OperationResult
  keypoints?: ReturnType<typeof detectKeypoints>
  matches?: {
    count: number
    pairs: { ax: number; ay: number; bx: number; by: number; distance: number }[]
  }
  ransac?: ReturnType<typeof ransacHomography>
}

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const req = ev.data
  try {
    if (req.kind === 'base') {
      const base = runOperation(req.opId, req.source, req.params)
      const response: WorkerResponse = { reqId: req.reqId, ok: true, base }
      ctx.postMessage(response, [base.imageData.data.buffer])
      return
    }
    if (req.kind === 'keypoints') {
      const keypoints = detectKeypoints(req.source, {
        maxCount: req.maxCount,
        lowThreshold: req.lowThreshold
      })
      ctx.postMessage({ reqId: req.reqId, ok: true, keypoints })
      return
    }
    if (req.kind === 'match') {
      const ka = detectKeypoints(req.sourceA, { maxCount: 120, lowThreshold: 1.5 })
      const kb = detectKeypoints(req.sourceB, { maxCount: 120, lowThreshold: 1.5 })
      const da = computeDescriptors(req.sourceA, ka.points)
      const db = computeDescriptors(req.sourceB, kb.points)
      const pairsRaw = matchDescriptors(da, db, req.ratio)
      const pairs = pairsRaw.map((p) => ({
        ax: p.a.point.x,
        ay: p.a.point.y,
        bx: p.b.point.x,
        by: p.b.point.y,
        distance: p.distance
      }))
      ctx.postMessage({
        reqId: req.reqId,
        ok: true,
        matches: { count: pairs.length, pairs }
      })
      return
    }
    const ransac = ransacHomography(req.src, req.dst, req.threshold, req.iterations)
    ctx.postMessage({ reqId: req.reqId, ok: true, ransac })
  } catch (error) {
    ctx.postMessage({
      reqId: req.reqId,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
