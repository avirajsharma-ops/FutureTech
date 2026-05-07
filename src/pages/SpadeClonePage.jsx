import { useEffect } from 'react'
import FutureScrollReveal from '../components/FutureScrollReveal'

export default function SpadeClonePage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'MW Futuretech Scroll Reveal'

    return () => {
      document.title = previousTitle
    }
  }, [])

  return <FutureScrollReveal />
}