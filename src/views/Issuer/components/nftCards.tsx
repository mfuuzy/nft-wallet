import {
  Box,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  TabPanels,
  Image,
  AspectRatio,
} from '@mibao-ui/components'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteQuery } from '../../../hooks/useRouteQuery'
import { PRODUCT_STATUE_SET, ProductState, Query } from '../../../models'
import { useHistory } from 'react-router-dom'
import { Empty } from '../../NFTs/empty'
import { InfiniteListNext } from '../../../components/InfiniteListNext'
import { useAPI } from '../../../hooks/useAccount'
import { useParams } from 'react-router'

export const NftCards: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const productState = useRouteQuery<ProductState>(
    'productState',
    'product_state'
  )
  const { replace, location } = useHistory()
  const api = useAPI()
  const [t] = useTranslation('translations')
  const [defaultIndex] = useState(
    PRODUCT_STATUE_SET.findIndex((item) => item === productState) || 0
  )
  const onChange = useCallback(
    (index) => {
      replace(`${location.pathname}?productState=${PRODUCT_STATUE_SET[index]}`)
    },
    [location.pathname, replace]
  )
  const queryFn = useCallback(
    async ({ pageParam = 0 }) => {
      const { data } = await api.getIssuerTokenClass(id, productState, {
        page: pageParam,
      })
      return data
    },
    [api, id, productState]
  )

  return (
    <Box w="full">
      <Tabs
        colorScheme="black"
        align="space-around"
        defaultIndex={defaultIndex}
        onChange={onChange}
      >
        <TabList position={'sticky'} top={50} zIndex={99} bg={'white'}>
          <Tab>{t('issuer.created')}</Tab>
          <Tab>{t('issuer.selling')}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <InfiniteListNext
              queryFn={queryFn}
              queryKey={[Query.Issuers, api, id, productState]}
              enableQuery={true}
              emptyElement={<Empty />}
              noMoreElement={t('common.actions.pull-to-down')}
              calcDataLength={(data) =>
                data?.pages.reduce(
                  (acc, token) => token.token_classes.length + acc,
                  0
                ) ?? 0
              }
              columnCount={2}
              renderItems={(group, i) => {
                return group.token_classes.map((token, j: number) => (
                  <AspectRatio
                    ratio={i === 0 && j === 0 ? 1 : 9 / 16}
                    key={`${i}-${j}`}
                  >
                    <Image
                      src={token.bg_image_url}
                      width="100%"
                      height="calc(100% - 5px)"
                      borderRadius="20px"
                      resizeScale={300}
                    />
                  </AspectRatio>
                ))
              }}
            />
          </TabPanel>
          <TabPanel>2</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
