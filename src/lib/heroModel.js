import { registerModel } from './modelCache'

export const HERO_MODEL_URL = '/models/mwft-hero-optimized.glb'

const entry = registerModel(HERO_MODEL_URL)

export const heroModelPromise = entry.promise
export const getHeroModelReady = entry.isReady
export const getHeroModelUrl = entry.getUrl
