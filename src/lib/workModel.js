import { registerModel } from './modelCache'

export const WORK_MODEL_URL = '/models/work-cobalt-cortex-optimized.glb'

const entry = registerModel(WORK_MODEL_URL)

export const workModelPromise = entry.promise
export const getWorkModelReady = entry.isReady
export const getWorkModelUrl = entry.getUrl