import { Button, Image } from '@mibao-ui/components'
import {
  Box,
  Center,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Image as RowImage,
  useClipboard,
} from '@chakra-ui/react'
import CopyLinkPath from '../../assets/share/icons/copy-link.svg'
import CreatePosterPath from '../../assets/share/icons/create-poster.svg'
import LoadingPath from '../../assets/share/icons/loading.svg'
import DownloadPath from '../../assets/share/icons/download.svg'
import MorePath from '../../assets/share/icons/more.svg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Nft, NftProps } from './components/posters/nft'
import { useHtml2Canvas } from '../../hooks/useHtml2Canvas'
import { useTranslation } from 'react-i18next'
import { downloadImage } from '../../utils'
import { useToast } from '../../hooks/useToast'
import { Issuer, IssuerProps } from './components/posters/issuer'
import { Holder, HolderProps } from './components/posters/holder'

enum PosterState {
  None,
  Creating,
  Created,
}

export enum PosterType {
  Nft = 'nft',
  Issuer = 'issuer',
  Holder = 'holder',
}

export interface NftPoster {
  type: PosterType.Nft
  data: NftProps
}

export interface IssuerPoster {
  type: PosterType.Issuer
  data: IssuerProps
}

export interface HolderPoster {
  type: PosterType.Holder
  data: HolderProps
}

export interface ShareProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  poster?: NftPoster | IssuerPoster | HolderPoster
}

export const Share: React.FC<ShareProps> = ({
  isOpen,
  onClose,
  shareUrl,
  poster,
}) => {
  const { t } = useTranslation('translations')
  const [posterState, setPosterState] = useState(PosterState.None)
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const { imgSrc } = useHtml2Canvas(el, {
    enable: posterState === PosterState.Creating,
  })
  useEffect(() => {
    if (imgSrc) {
      setPosterState(PosterState.Created)
    }
  }, [imgSrc])
  const toast = useToast()
  const { onCopy } = useClipboard(shareUrl)
  const onDownload = useCallback(() => {
    if (imgSrc) {
      downloadImage(imgSrc, 'poster.png')
    }
  }, [imgSrc])
  const onCopyShareUrl = useCallback(() => {
    onCopy()
    toast(t('common.share.copied'))
  }, [onCopy, t, toast])
  const onShare = useCallback(() => {
    if (!navigator?.share) return
    navigator.share({
      url: shareUrl,
    })
  }, [shareUrl])
  const { posterIcon, posterText, posterAction } = useMemo(() => {
    if (posterState === PosterState.None) {
      return {
        posterIcon: CreatePosterPath,
        posterText: t('common.share.icons.create-poster'),
        posterAction: () => setPosterState(PosterState.Creating),
      }
    }
    if (posterState === PosterState.Creating) {
      return {
        posterIcon: LoadingPath,
        posterText: t('common.share.icons.creating'),
        posterAction: undefined,
      }
    }
    return {
      posterIcon: DownloadPath,
      posterText: t('common.share.icons.download'),
      posterAction: onDownload,
    }
  }, [onDownload, posterState, t])
  const items = useMemo(
    () =>
      [
        {
          icon: posterIcon,
          text: posterText,
          action: posterAction,
        },
        {
          icon: CopyLinkPath,
          text: t('common.share.icons.copy'),
          action: onCopyShareUrl,
        },
      ].concat(
        navigator?.share !== undefined
          ? [
              {
                icon: MorePath,
                text: t('common.share.icons.more'),
                action: onShare,
              },
            ]
          : []
      ),
    [onCopyShareUrl, onShare, posterAction, posterIcon, posterText, t]
  )
  const showPosterEl = poster && posterState === PosterState.Creating
  const showPoster =
    posterState === PosterState.Creating || posterState === PosterState.Created

  return (
    <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent bg="rgba(0, 0, 0, 0)" maxH="unset" h="100%">
        {showPosterEl ? (
          <Box position="fixed" top="0" left="0" opacity="0">
            {poster.type === PosterType.Nft && (
              <Nft {...poster.data} shareUrl={shareUrl} onLoaded={setEl} />
            )}
            {poster.type === PosterType.Issuer && (
              <Issuer {...poster.data} shareUrl={shareUrl} onLoaded={setEl} />
            )}
            {poster.type === PosterType.Holder && (
              <Holder {...poster.data} shareUrl={shareUrl} onLoaded={setEl} />
            )}
          </Box>
        ) : null}

        {showPoster ? (
          <Center
            position="absolute"
            bottom="211px"
            maxW="500px"
            left="50%"
            transform="translateX(-50%)"
            h="calc(100% - 231px)"
            zIndex={'calc(var(--chakra-zIndices-modal) + 1)'}
            p="20px"
            w="100%"
          >
            <Image
              src={imgSrc}
              m="auto"
              h="auto"
              w="auto"
              maxW="100%"
              objectFit="contain"
              rounded="20px"
              containerProps={{
                w: '100%',
                h: '100%',
                display: 'flex',
              }}
            />
          </Center>
        ) : null}

        <Flex
          bg="rgba(255, 255, 255, 0.7)"
          backdropFilter="blur(15px)"
          w="full"
          maxW="500px"
          mx="auto"
          rounded="22px 22px 0 0"
          py="30px"
          direction="column"
          mt="auto"
        >
          <Flex overflowX="auto" overflowY="hidden" shrink={0}>
            {items.map((item, i) => (
              <Flex
                direction="column"
                ml="10px"
                minW="56px"
                key={i}
                onClick={item.action}
                w="80px"
                cursor="pointer"
              >
                <RowImage
                  w="56px"
                  h="56px"
                  bg="white"
                  rounded="8px"
                  p="12px"
                  src={item.icon}
                  mx="auto"
                />
                <Box
                  fontSize="12px"
                  whiteSpace="nowrap"
                  color="#777E90"
                  mt="8px"
                  textAlign="center"
                >
                  {item.text}
                </Box>
              </Flex>
            ))}
          </Flex>

          <Button
            isFullWidth
            mt="25px"
            variant="solid"
            size="lg"
            bg="white"
            rounded="44px"
            h="44px"
            fontSize="18px"
            fontWeight="normal"
            onClick={onClose}
            mx="20px"
            w="calc(100% - 40px)"
          >
            {t('common.share.cancel')}
          </Button>
        </Flex>
      </DrawerContent>
    </Drawer>
  )
}
