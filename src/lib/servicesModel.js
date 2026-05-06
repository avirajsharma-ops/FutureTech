import { registerModel } from './modelCache'

export const SERVICES_MODEL_URL = '/models/services-tesseract-core-optimized.glb'

const entry = registerModel(SERVICES_MODEL_URL)

export const servicesModelPromise = entry.promise
export const getServicesModelReady = entry.isReady
export const getServicesModelUrl = entry.getUrl