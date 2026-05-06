import { registerModel } from './modelCache'

export const COIN_MODEL_URL = '/models/about-coin-optimized.glb'

const entry = registerModel(COIN_MODEL_URL)

export const coinModelPromise = entry.promise
export const getCoinModelReady = entry.isReady
export const getCoinModelUrl = entry.getUrl
