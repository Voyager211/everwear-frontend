import { homeModules } from '../data/home'
import { HeroBanner, HomeModules, OfferStrip } from '../components/home/HomeSections'

export function HomePage() {
  return (
    <>
      <HeroBanner />
      <OfferStrip />
      <HomeModules modules={homeModules} />
    </>
  )
}
