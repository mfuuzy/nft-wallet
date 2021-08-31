/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Card } from '../../components/Card'
import { IS_WEXIN, NFT_EXPLORER_URL, PER_ITEM_LIMIT } from '../../constants'
import { useWalletModel } from '../../hooks/useWallet'
import { NFTToken, Query, TransactionStatus } from '../../models'
import { Empty } from './empty'
import { Loading } from '../../components/Loading'
import { Redirect, useHistory, useParams } from 'react-router'
import { RoutePath } from '../../routes'
import { ReactComponent as ShareSvg } from '../../assets/svg/share-new.svg'
import { ReactComponent as ProfileSvg } from '../../assets/svg/menu.svg'
import { Share } from '../../components/Share'
import { useTranslation } from 'react-i18next'
import { HiddenBar } from '../../components/HiddenBar'
import classNames from 'classnames'
import { DrawerImage } from '../Profile/DrawerImage'
import { useLocation, useRouteMatch } from 'react-router-dom'
import { SetUsername } from '../Profile/SetUsername'
import { SetDesc } from '../Profile/setDesc'
import { useRouteQuery } from '../../hooks/useRouteQuery'
import { useScrollRestoration } from '../../hooks/useScrollRestoration'
import { isVerticalScrollable } from '../../utils'
import { ProfilePath } from './User'
import { Container } from './styled'
import { DrawerMenu } from './DrawerMenu'
import { Intro } from '../../components/Intro'
import { IssuerList } from './IssuerList'
import { ReactComponent as BackSvg } from '../../assets/svg/back.svg'
import { Appbar, HEADER_HEIGHT } from '../../components/Appbar'
import { Info } from './info'

export const NFTs: React.FC = () => {
  const params = useParams<{ address?: string }>()
  const { api, isLogined, address: localAddress } = useWalletModel()
  const address = useMemo(
    () => (params.address ? params.address : localAddress),
    [localAddress, params.address]
  )
  const isHolder = useMemo(() => Boolean(params.address), [params.address])
  const { t } = useTranslation('translations')
  const history = useHistory()
  const [showAvatarAction, setShowAvatarAction] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  useScrollRestoration()
  const { data: user, isLoading: isUserLoading } = useQuery(
    [Query.Profile, address, api],
    async () => await api.getProfile(address),
    {
      enabled: !!address,
    }
  )

  const location = useLocation()
  const isLiked = !!useRouteQuery<string>('liked', '')
  const isFollow = !!useRouteQuery<string>('follow', '')
  const isOwned = location.search === ''

  const getRemoteData = useCallback(
    async ({ pageParam = 1 }) => {
      if (isLiked) {
        const { data } = await api.getUserLikesClassList(pageParam, { address })
        return {
          meta: data.meta,
          token_list: data.class_list.map<NFTToken>((c) => ({
            class_name: c.name,
            class_bg_image_url: c.bg_image_url,
            class_uuid: c.uuid,
            class_description: c.description,
            class_total: c.total,
            token_uuid: '',
            issuer_avatar_url: c.issuer_info?.avatar_url,
            issuer_name: c.issuer_info?.name,
            issuer_uuid: c.issuer_info?.uuid,
            tx_state: TransactionStatus.Committed,
            is_class_banned: false,
            is_issuer_banned: false,
            n_token_id: 0,
            verified_info: c.verified_info,
            renderer_type: c.renderer_type,
            card_back_content_exist: c.card_back_content_exist,
            card_back_content: c.card_back_content,
          })),
        }
      }
      const { data } = await api.getNFTs(pageParam, { address })
      return data
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLiked, api, address]
  )

  const {
    data,
    status,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(
    [`${Query.NFTList}${isLiked.toString()}`, address, isLiked],
    getRemoteData,
    {
      getNextPageParam: (lastPage) => {
        if (lastPage?.meta == null) {
          return undefined
        }
        const { meta } = lastPage
        const current = meta.current_page
        const total = meta.total_count
        if (total <= current * PER_ITEM_LIMIT) {
          return undefined
        }
        return meta.current_page + 1
      },
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: !isFollow,
    }
  )

  const [isRefetching, setIsRefetching] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefetching(true)
    await refetch()
    setIsRefetching(false)
  }, [refetch])

  const dataLength = useMemo(() => {
    return (
      data?.pages.reduce((acc, token) => token.token_list.length + acc, 0) ?? 0
    )
  }, [data])

  const explorerURL = useMemo(() => {
    return `${NFT_EXPLORER_URL}/holder/tokens/${address}`
  }, [address])

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const matchDesc = useRouteMatch(ProfilePath.Description)
  const matchUsername = useRouteMatch(ProfilePath.Username)

  const [alwayShowTabbar, setAlwaysShowTabbar] = useState(false)

  useEffect(() => {
    setAlwaysShowTabbar(!isVerticalScrollable())
  }, [data])

  const showGuide = useMemo(() => {
    if (isUserLoading) {
      return false
    }
    return !user?.guide_finished
  }, [user, isUserLoading])

  if (!isLogined) {
    return <Redirect to={RoutePath.Explore} />
  }

  const filters = [
    {
      value: 'nfts.owned',
      fn() {
        if (!isOwned) {
          history.replace(history.location.pathname)
        }
      },
      isActive: () => isOwned,
    },
    {
      value: 'nfts.liked',
      fn() {
        if (!isLiked) {
          history.replace(history.location.pathname + '?liked=true')
        }
      },
      isActive: () => isLiked,
    },
    {
      value: 'follow.follow',
      fn() {
        if (!isFollow) {
          history.replace(history.location.pathname + '?follow=true')
        }
      },
      isActive: () => isFollow,
    },
  ]

  return (
    <Container id="main">
      {isHolder && (
        <Appbar
          title={t('holder.title')}
          left={<BackSvg onClick={() => history.goBack()} />}
          right={<ShareSvg onClick={() => setIsShareDialogOpen(true)} />}
        />
      )}
      <Info
        isLoading={isUserLoading}
        user={user}
        setShowAvatarAction={setShowAvatarAction}
        closeMenu={() => setShowMenu(false)}
        isHolder={isHolder}
        address={address}
      />
      <section className="list">
        <div
          className="filters"
          style={{ top: `${isHolder ? HEADER_HEIGHT : 0}px` }}
        >
          {filters.map((filter, i) => (
            <div
              className={classNames('filter', { active: filter.isActive() })}
              key={i}
              onClick={filter.fn}
            >
              {t(filter.value)}
              {filter.isActive() ? <span className="active-line" /> : null}
            </div>
          ))}
        </div>
        {isFollow ? (
          <IssuerList isFollow={isFollow} address={address} />
        ) : (
          <>
            {isRefetching ? <Loading /> : null}
            {data === undefined && status === 'loading' ? (
              <Loading />
            ) : (
              <InfiniteScroll
                pullDownToRefresh={!IS_WEXIN}
                refreshFunction={refresh}
                pullDownToRefreshContent={
                  <h4>&#8595; {t('common.actions.pull-down-refresh')}</h4>
                }
                pullDownToRefreshThreshold={80}
                releaseToRefreshContent={
                  <h4>&#8593; {t('common.actions.release-refresh')}</h4>
                }
                dataLength={dataLength}
                next={fetchNextPage}
                hasMore={hasNextPage === true}
                scrollThreshold="250px"
                loader={<Loading />}
                endMessage={
                  <h4 className="end">
                    {dataLength <= 5 ? ' ' : t('common.actions.pull-to-down')}
                  </h4>
                }
              >
                {data?.pages?.map((group, i) => {
                  return (
                    <React.Fragment key={i}>
                      {group.token_list.map((token, j: number) => (
                        <Card
                          className={i === 0 && j === 0 ? 'first' : ''}
                          token={token}
                          key={token.token_uuid || `${i}.${j}`}
                          address={address}
                          isClass={isLiked}
                        />
                      ))}
                    </React.Fragment>
                  )
                })}
                {status === 'success' && dataLength === 0 ? <Empty /> : null}
              </InfiniteScroll>
            )}
          </>
        )}
      </section>
      <Share
        displayText={explorerURL}
        copyText={explorerURL}
        closeDialog={() => setIsShareDialogOpen(false)}
        isDialogOpen={isShareDialogOpen}
      />
      {!isHolder && (
        <>
          <div className="account" onClick={() => setShowMenu(true)}>
            <ProfileSvg />
          </div>
          <div className="share" onClick={() => setIsShareDialogOpen(true)}>
            <ShareSvg />
            {t('nfts.share')}
          </div>
          <DrawerImage
            showAvatarAction={showAvatarAction}
            setShowAvatarAction={setShowAvatarAction}
          />
          <DrawerMenu
            close={() => setShowMenu(false)}
            isDrawerOpen={showMenu}
            user={user}
            setShowAvatarAction={setShowAvatarAction}
          />
          <SetUsername
            username={user?.nickname}
            open={!!matchUsername?.isExact}
            close={() => history.goBack()}
          />
          <SetDesc
            desc={user?.description}
            open={!!matchDesc?.isExact}
            close={() => history.goBack()}
          />
          <Intro show={showGuide} />
          <HiddenBar alwaysShow={alwayShowTabbar} />
        </>
      )}
    </Container>
  )
}
