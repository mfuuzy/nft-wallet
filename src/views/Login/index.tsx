import React, { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as ImtokenSvg } from '../../assets/svg/imtoken.svg'
import { RoutePath } from '../../routes'
import {
  CONTAINER_MAX_WIDTH,
  IS_DESKTOP,
  IS_IMTOKEN,
  IS_MOBILE_ETH_WALLET,
  IS_WEBKIT,
} from '../../constants'
import { ReactComponent as QuestionSvg } from '../../assets/svg/question.svg'
import detectEthereumProvider from '@metamask/detect-provider'
import { Redirect, useHistory, useLocation, Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { getHelpUnipassUrl } from '../../data/help'
import { getLicenseUrl } from '../../data/license'
import { UnipassConfig } from '../../utils'
import { useToast } from '../../hooks/useToast'
import { useAccountStatus, useLogin, WalletType } from '../../hooks/useAccount'
import { ReactComponent as FullLogo } from '../../assets/svg/full-logo.svg'
import { Appbar, AppbarButton } from '../../components/Appbar'
import { ReactComponent as BackSvg } from '../../assets/svg/back.svg'
import {
  Drawer,
  useDisclosure,
  Center,
  Text,
  Stack,
  Flex,
  Heading,
} from '@mibao-ui/components'
import { AspectRatio, Box, Checkbox } from '@chakra-ui/react'
import { useConfirmDialog } from '../../hooks/useConfirmDialog'
import { LoginButton } from '../../components/LoginButton'
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js'
import { Autoplay } from 'swiper'
import Slide1 from '../../assets/img/login/slide-1.png'
import Slide2 from '../../assets/img/login/slide-2.png'
import Slide3 from '../../assets/img/login/slide-3.png'
import classNames from 'classnames'
import {
  trackLabels,
  useTrackEvent,
  useTrackDidMount,
} from '../../hooks/useTrack'
import { RainbowBackground } from '../../components/RainbowBackground'
import { useInnerSize } from '../../hooks/useInnerSize'

const Container = styled(RainbowBackground)`
  justify-content: flex-start;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-x: hidden;
  min-height: 100vh;

  .close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 20px;
    top: 20px;
    cursor: pointer;
  }

  @media (min-width: 500px) {
    .close {
      left: calc(50% - 250px);
    }
  }

  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }

  .header {
    width: 100%;
    z-index: 2;
    position: relative;
  }
  .logo {
    margin-top: 15px;
    margin-bottom: 15px;
    max-width: 100%;
    padding: 0 24px;
    z-index: 2;
    position: relative;
  }

  .desc {
    margin: 0;
    padding: 0;
    font-size: 20px;
    color: #191919;
    line-height: 26px;
  }

  .connect {
    border: 1px solid #d2d2d2;
    border-radius: 25px;
    width: calc(100% - 150px);
    margin-left: 50px;
    margin-right: 50px;
    margin-top: 12px;

    .imtoken {
      margin: 0 4px;
    }

    &:disabled {
      color: rgb(214, 214, 214) !important;
      background-color: white !important;

      svg {
        g {
          fill: rgb(214, 214, 214);
        }
      }
    }
    &.MuiButton-text {
      padding-top: 12px;
      padding-bottom: 12px;
      text-transform: none;
    }
    &.recommend {
      background: #2b454e;
      width: calc(100% - 100px);
      color: white;
      margin-top: 15px;
      font-size: 16px;
    }
  }

  .license {
    font-size: 12px;
  }

  .beian {
    position: fixed;
    bottom: 20px;
    display: flex;
    align-items: center;
    margin-top: 12px;
    color: #000000;
    opacity: 0.4;

    &.normal {
      margin-top: 20px;
      margin-bottom: 20px;
      position: initial;
    }
    a {
      text-decoration: none;
      font-size: 10px;
      color: #000000;
      &:visited {
        color: #000000;
      }
    }
  }
`

const CheckBoxStyled = styled(Checkbox)`
  .chakra-checkbox__control:not([data-checked]) {
    border: 1px solid #23262f;
    border-radius: 1px;
  }
`

enum ErrorMsg {
  NotSupport = 'not-support',
  Imtoken = 'refuse',
}

export const Login: React.FC = () => {
  const { login } = useLogin()
  const { isLogined } = useAccountStatus()
  const { t, i18n } = useTranslation('translations')
  const onConfirm = useConfirmDialog()
  const [isUnipassLogining, setIsUnipassLoging] = useState(false)
  const [isMetamaskLoging, setIsMetamaskLoging] = useState(false)
  const [isFlashsignerLogin, setIsFlashsignerLogin] = useState(false)
  const [isWalletConnectLoging, setIsWalletConnectLoging] = useState(false)
  const [isLicenseChecked, setIsLicenseChecked] = useState(false)
  const toast = useToast()
  const history = useHistory()
  const location = useLocation<{ redirect?: string }>()
  const redirectUrl = location?.state?.redirect
  const {
    isOpen: isDrawerOpen,
    onOpen: drawerOnOpen,
    onClose: drawerOnClose,
  } = useDisclosure()

  const containerRef = useRef(null)

  const { width } = useInnerSize()
  const setLoading = (loading: boolean, walletType: WalletType): void => {
    switch (walletType) {
      case WalletType.Metamask:
        setIsMetamaskLoging(loading)
        break
      case WalletType.Unipass:
        setIsUnipassLoging(loading)
        break
      case WalletType.WalletConnect:
        setIsWalletConnectLoging(loading)
        break
      case WalletType.Flashsigner:
        setIsFlashsignerLogin(loading)
        break
      default:
        setIsUnipassLoging(loading)
        break
    }
  }
  const loginBtnOnClick = useCallback(
    async (walletType = WalletType.Unipass) => {
      setLoading(true, walletType)
      try {
        if (walletType === WalletType.Metamask) {
          const provider = await detectEthereumProvider()
          if (!provider) {
            onConfirm({
              type: 'error',
              title: t(`login.errors.${ErrorMsg.NotSupport}`),
            })
            setLoading(false, walletType)
            return
          }
        }
        await login(walletType)
        setLoading(false, walletType)
        if (redirectUrl) {
          history.replace(redirectUrl)
        }
      } catch (error) {
        setLoading(false, walletType)
        if (IS_IMTOKEN && walletType === WalletType.Metamask) {
          onConfirm({
            type: 'error',
            title: t(`login.errors.${ErrorMsg.Imtoken}`),
          })
          setLoading(false, walletType)
        }
      }
    },
    [login, redirectUrl, onConfirm, t, history]
  )

  useTrackDidMount('login')

  const loginFlashsigner = useTrackEvent(
    'login',
    'click',
    trackLabels.login.flashsigner,
    loginBtnOnClick.bind(null, WalletType.Flashsigner)
  )

  const loginUnipass = useTrackEvent(
    'login',
    'click',
    trackLabels.login.unipass,
    loginBtnOnClick.bind(null, WalletType.Unipass)
  )

  const loginEth = useTrackEvent(
    'login',
    'click',
    trackLabels.login.eth,
    loginBtnOnClick.bind(null, WalletType.Metamask)
  )

  const slides = [
    {
      src: Slide1,
      desc1: '',
      desc2: '',
    },
    {
      src: Slide2,
      desc1: '',
      desc2: '',
    },
    {
      src: Slide3,
      desc1: '',
      desc2: '',
    },
  ]

  if (isLogined && redirectUrl == null) {
    return <Redirect to={RoutePath.NFTs} />
  }

  return (
    <Container ref={containerRef}>
      <div className="header">
        <Appbar
          transparent
          left={
            <AppbarButton
              onClick={() => {
                UnipassConfig.clear()
                history.replace(RoutePath.Explore)
              }}
            >
              <BackSvg />
            </AppbarButton>
          }
          title={<FullLogo />}
        />
      </div>
      <div className="logo">
        <Swiper
          modules={[Autoplay]}
          navigation={false}
          className="swiper"
          pagination={{ clickable: true }}
          loop
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
        >
          {slides?.map((slide, i) => (
            <SwiperSlide key={i}>
              <Stack direction="column">
                <AspectRatio ratio={1 / 1}>
                  <img src={slide.src} />
                </AspectRatio>
                <Flex flexDirection="column" fontSize="24px" px="30px">
                  <Heading textAlign="left" size="lg">
                    {t(`login.slides.${i + 1}.line-1`)}
                  </Heading>
                  <Heading textAlign="right" color="#5065e5" size="lg">
                    {t(`login.slides.${i + 1}.line-2`)}
                  </Heading>
                </Flex>
              </Stack>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <LoginButton
        h="40px"
        minH="40px"
        mt={!IS_DESKTOP || i18n.language === 'en' ? '5%' : '15%'}
        onClick={() => {
          if (!isLicenseChecked) {
            toast(t('license.warn'), {
              textProps: {
                fontSize: '12px',
                px: '20px',
                py: '5px',
              },
            })
            return
          }
          drawerOnOpen()
        }}
      >
        {t('common.login')}
      </LoginButton>
      <Drawer
        placement="bottom"
        isOpen={isDrawerOpen}
        onClose={drawerOnClose}
        hasOverlay
        rounded="lg"
        contentProps={{
          width: '100%',
          overflow: 'hidden',
          style: {
            left: `calc(50% - calc(${Math.min(
              width,
              CONTAINER_MAX_WIDTH
            )}px / 2))`,
            maxWidth: `${CONTAINER_MAX_WIDTH}px`,
          },
        }}
      >
        <Center flexDirection="column" my="24px">
          <Text fontSize="16px" mb="32px">
            {t('login.select')}
          </Text>
          {IS_MOBILE_ETH_WALLET ? null : (
            <LoginButton
              className={`${IS_IMTOKEN ? '' : 'recommend'} connect`}
              isLoading={isUnipassLogining}
              disabled={
                isUnipassLogining ||
                isMetamaskLoging ||
                isWalletConnectLoging ||
                isFlashsignerLogin
              }
              onClick={loginFlashsigner}
              variant={IS_IMTOKEN ? 'outline' : 'solid'}
              size="lg"
            >
              <Box py="8px">
                <Box fontSize="16px">{t('login.connect.flashsigner')}</Box>
                <Box fontSize="12px">{t('login.connect.or-use-phone')}</Box>
              </Box>
            </LoginButton>
          )}
          <LoginButton
            className={'connect'}
            isLoading={isFlashsignerLogin}
            disabled={
              isUnipassLogining ||
              isMetamaskLoging ||
              isWalletConnectLoging ||
              isFlashsignerLogin
            }
            onClick={loginUnipass}
            variant={'outline'}
            size="lg"
          >
            <Box py="8px">
              <Box fontSize="16px">{t('login.connect.unipass')}</Box>
              <Box fontSize="12px">{t('login.connect.or-use-email')}</Box>
            </Box>
          </LoginButton>
          <LoginButton
            className={`${IS_IMTOKEN ? 'recommend' : ''} connect`}
            disabled={
              isUnipassLogining ||
              isMetamaskLoging ||
              isWalletConnectLoging ||
              isFlashsignerLogin
            }
            isLoading={isMetamaskLoging}
            onClick={loginEth}
            variant={!IS_IMTOKEN ? 'outline' : 'solid'}
          >
            {IS_IMTOKEN ? (
              <>
                {t('login.connect.connect')}
                <ImtokenSvg className="imtoken" />
              </>
            ) : (
              t('login.connect.metamask')
            )}
          </LoginButton>
          <Link
            to={`${RoutePath.Help}?url=${encodeURIComponent(
              getHelpUnipassUrl(i18n.language)
            )}`}
          >
            <Center>
              <QuestionSvg />
              <Text fontSize="12px" ml="4px">
                {t('help.question')}
              </Text>
            </Center>
          </Link>
        </Center>
      </Drawer>

      <div className="license">
        <CheckBoxStyled
          isChecked={isLicenseChecked}
          size="sm"
          iconSize="12px"
          onChange={() => setIsLicenseChecked(!isLicenseChecked)}
        >
          <Trans
            ns="translations"
            i18nKey="license.agree"
            t={t}
            components={{
              a: (
                <span
                  style={{ color: '#5065E5' }}
                  onClick={() => {
                    history.push(
                      `${RoutePath.License}?url=${encodeURIComponent(
                        getLicenseUrl(i18n.language)
                      )}`
                    )
                  }}
                />
              ),
            }}
          />
        </CheckBoxStyled>
      </div>
      {i18n.language !== 'en' ? (
        <footer className={classNames('beian', { normal: IS_WEBKIT })}>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common.beian')}
          </a>
        </footer>
      ) : null}
    </Container>
  )
}
