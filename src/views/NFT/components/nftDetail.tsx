import {
  Avatar,
  Box,
  Center,
  Flex,
  Grid,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@mibao-ui/components'
import { NFTDetail } from '../../../models'
import { TokenClass } from '../../../models/class-list'
import { ReactComponent as OwnedSealSvg } from '../../../assets/svg/owned-seal.svg'
import styled from 'styled-components'
import { Follow } from '../../../components/Follow'
import { useTranslation } from 'react-i18next'
import { useRouteQuery } from '../../../hooks/useRouteQuery'
import { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { NftTxLogsList } from './nftTxLogList'

const NftDetailName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  font-size: 18px;
  -webkit-line-clamp: 2;
  margin-right: 10px;
`

const TAB_PARAM_SET = ['desc', 'tx_logs', 'holders'] as const
type TabParam = typeof TAB_PARAM_SET[number]

export const NftDetail: React.FC<{
  detail?: NFTDetail | TokenClass
  isClass?: boolean
  uuid: string
  isLoading: boolean
  refetch: (params?: any) => Promise<any>
}> = ({ detail, isLoading, refetch, isClass, uuid }) => {
  const { t } = useTranslation('translations')
  const { replace, location } = useHistory()
  const tabParam = useRouteQuery<TabParam>('tab', 'desc')
  const [tabIndex, setTabIndex] = useState(
    TAB_PARAM_SET.findIndex((item) => item === tabParam) || 0
  )
  const onChangeTab = useCallback(
    (index) => {
      replace(`${location.pathname}?tab=${TAB_PARAM_SET[index]}`)
      setTabIndex(index)
    },
    [location.pathname, replace]
  )

  return (
    <Box py="20px">
      <Flex justifyContent={'space-between'} px="20px">
        <NftDetailName>{detail?.name}</NftDetailName>
        <Center w="50px">
          <OwnedSealSvg />
        </Center>
      </Flex>

      <Grid
        templateColumns="48px calc(100% - 48px - 80px) 80px"
        mt="25px"
        px="20px"
      >
        <Avatar
          src={detail?.issuer_info?.avatar_url}
          size="48px"
          border="3px solid var(--input-bg-color)"
        />

        <Box ml="18px">
          <Box
            fontSize="14px"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
            fontWeight="500"
          >
            {detail?.issuer_info?.name}
          </Box>
          <Box fontSize="12px" color="#777E90">
            {detail?.verified_info?.verified_title}
          </Box>
        </Box>

        <Center>
          <Skeleton isLoaded={!isLoading} borderRadius="12px">
            <Follow
              followed={detail?.issuer_info?.issuer_followed === true}
              uuid={detail?.issuer_info?.uuid ?? ''}
              afterToggle={refetch}
              isPrimary
            />
          </Skeleton>
        </Center>
      </Grid>

      <Tabs
        align="space-between"
        colorScheme="black"
        mt="20px"
        defaultIndex={tabIndex}
        onChange={onChangeTab}
      >
        <TabList px="20px">
          <Tab>{t('nft.desc')}</Tab>
          <Tab>{t('nft.transaction-history')}</Tab>
          <Tab>{t('nft.holder')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p="20px">
            <Box fontSize="14px" color="#777E90">
              {detail?.description ? detail?.description : t('nft.no-desc')}
            </Box>
          </TabPanel>
          <TabPanel p="20px">
            {tabIndex === 1 && <NftTxLogsList uuid={uuid} isClass={isClass} />}
          </TabPanel>
          <TabPanel p="20px">Holders</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
