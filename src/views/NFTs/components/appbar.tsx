/* eslint-disable prettier/prettier */
import { useDisclosure } from '@chakra-ui/react'
import {
  AppbarSticky,
  Appbar as RowAppbar,
  AppbarButton,
} from '../../../components/Appbar'
import { useHistoryBack } from '../../../hooks/useHistoryBack'
import { ReactComponent as BackSvg } from '../../../assets/svg/back.svg'
import { ReactComponent as ShareSvg } from '../../../assets/svg/share.svg'
import { AvatarType, UserResponse } from '../../../models/user'
import { PosterType } from '../../../components/Share/share.interface'
import { DrawerMenu } from '../DrawerMenu'
import { ReactComponent as SettingsSvg } from '../../../assets/svg/settings.svg'
import { useTranslation } from 'react-i18next'
import { addParamsToUrl } from '../../../utils'
import { lazy } from 'react'
import { LoadableComponent } from '../../../components/GlobalLoader'
import { useQuery } from 'react-query'
import { Query } from '../../../models'
import { useAPI } from '../../../hooks/useAccount'

const Share = lazy(async () => await import('../../../components/Share'))

export const Appbar: React.FC<{
  user?: UserResponse
  isHolder?: boolean
  address?: string
}> = ({ user, isHolder, address }) => {
  const api = useAPI()
  const { t, i18n } = useTranslation('translations')
  const goBack = useHistoryBack()
  const {
    isOpen: isOpenShare,
    onOpen: onOpenShare,
    onClose: onCloseShare,
  } = useDisclosure()
  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure()
  const shareAvatarUrl =
    user?.avatar_type === AvatarType.Token && user?.avatar_url
      ? addParamsToUrl(user?.avatar_url, {
        tid: `${user?.avatar_tid ?? ''}`,
        locale: i18n.language,
      })
      : user?.avatar_url

  const { data } = useQuery([Query.NFTList, address, 'owned'], async () => {
    const { data } = await api.getNFTs(1, { address })
    return { pages: [data] }
  }, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return (
    <>
      <AppbarSticky position={isHolder ? 'sticky' : 'relative'}>
        <RowAppbar
          left={
            <AppbarButton
              onClick={isHolder ? goBack : openDrawer}
              className={isHolder ? '' : 'setting'}
            >
              {isHolder ? <BackSvg /> : <SettingsSvg />}
            </AppbarButton>
          }
          right={
            <AppbarButton transparent onClick={onOpenShare}>
              <ShareSvg />
            </AppbarButton>
          }
        />
      </AppbarSticky>
      <DrawerMenu close={closeDrawer} isDrawerOpen={isDrawerOpen} />
      {user ? (
        <LoadableComponent>
          <Share
            isOpen={isOpenShare}
            onClose={onCloseShare}
            shareUrl={`https://${window.location.pathname}/holder/${
              address ?? ''
            }`}
            poster={{
              type: PosterType.Holder,
              data: {
                username: user.nickname ?? t('holder.user-name-empty'),
                avatarUrl: shareAvatarUrl ?? '',
                collectionCount: data?.pages?.[0]?.meta?.total_count ?? 0,
                desc: user.description,
                coverImage: data?.pages?.[0]?.token_list?.[0]?.class_bg_image_url ?? '',
                isNftAvatar: user.avatar_type === AvatarType.Token,
                isHolder,
              },
            }}
          />
        </LoadableComponent>
      ) : null}
    </>
  )
}
