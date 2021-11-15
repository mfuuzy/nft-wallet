import { MainContainer } from '../../styles'
import { HiddenBar, HiddenBarFill } from '../../components/HiddenBar'
import { NftSortOrKindList } from '../../components/NftSortOrKindList'
import { useScrollRestoration } from '../../hooks/useScrollRestoration'

export const ExploreAll: React.FC = () => {
  useScrollRestoration()
  return (
    <MainContainer px="20px">
      <NftSortOrKindList isFirstOpenScrollToTop />
      <HiddenBar />
      <HiddenBarFill />
    </MainContainer>
  )
}
