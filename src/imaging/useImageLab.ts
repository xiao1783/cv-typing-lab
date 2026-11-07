import { onBeforeUnmount, ref, shallowRef } from 'vue'
import ImageWorker from './worker?worker'
import type { WorkerRequest, WorkerResponse } from './worker'

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never
type SendPayload = DistributiveOmit<WorkerRequest, 'reqId'>

function cloneImageData(src: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height)
}

export function useImageLab() {
  const worker = new ImageWorker()
  const running = ref(false)
  const elapsedMs = ref(0)
  const result = shallowRef<ImageData | null>(null)
  const kernel = shallowRef<number[][] | null>(null)
  const explanation = ref('')
  const lastResponse = shallowRef<WorkerResponse | null>(null)

  let seq = 0
  const pending = new Map<number, (resp: WorkerResponse) => void>()
  worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
    const resolve = pending.get(ev.data.reqId)
    if (resolve) {
      pending.delete(ev.data.reqId)
      resolve(ev.data)
    }
  }

  function send(payload: SendPayload): Promise<WorkerResponse> {
    const reqId = ++seq
    return new Promise((resolve) => {
      pending.set(reqId, resolve)
      const req = { ...payload, reqId } as WorkerRequest
      if (req.kind === 'base') {
        worker.postMessage(req, [req.source.data.buffer])
      } else {
        worker.postMessage(req)
      }
    })
  }

  async function runBase(
    opId: string,
    source: ImageData,
    params: Record<string, number | string | boolean>
  ): Promise<WorkerResponse> {
    running.value = true
    const t0 = performance.now()
    // 响应式 Proxy 无法结构化克隆，参数值均为原始类型，浅展开得到普通对象
    const plainParams = Object.fromEntries(Object.entries(params))
    const resp = await send({ kind: 'base', opId, source: cloneImageData(source), params: plainParams })
    elapsedMs.value = Math.round(performance.now() - t0)
    running.value = false
    lastResponse.value = resp
    if (resp.ok && resp.base) {
      result.value = resp.base.imageData
      kernel.value = resp.base.kernel ?? null
      explanation.value = resp.base.explanation
    }
    return resp
  }

  async function runCustom(payload: SendPayload): Promise<WorkerResponse> {
    running.value = true
    const t0 = performance.now()
    const resp = await send(payload)
    elapsedMs.value = Math.round(performance.now() - t0)
    running.value = false
    lastResponse.value = resp
    return resp
  }

  onBeforeUnmount(() => worker.terminate())

  return {
    running,
    elapsedMs,
    result,
    kernel,
    explanation,
    lastResponse,
    runBase,
    runCustom
  }
}
