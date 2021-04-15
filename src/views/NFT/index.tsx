import React, { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Appbar } from '../../components/Appbar'
import { ReactComponent as BackSvg } from '../../assets/svg/back.svg'
import { ReactComponent as ShareSvg } from '../../assets/svg/share.svg'
import { useHistory, useParams } from 'react-router'
import Dialog from '@material-ui/core/Dialog'
import { Button } from '../../components/Button'
import { makeStyles } from '@material-ui/core'
import { Copyzone } from '../../components/Copyzone'
import { LazyLoadImage } from '../../components/Image'
import { useWidth } from '../../hooks/useWidth'
import { useQuery } from 'react-query'
import { Query } from '../../models'
import { useWalletModel } from '../../hooks/useWallet'
import { Loading } from '../../components/Loading'
import { Limited } from '../../components/Limited'
import { Creator } from '../../components/Creator'

const Container = styled.main`
  display: flex;
  background: linear-gradient(187.7deg, #ffffff 4.33%, #f0f0f0 94.27%);
  height: 100%;
  flex-direction: column;
  .figure {
    background: linear-gradient(107.86deg, #e1e1e1 7.34%, #d3d3d3 92.99%);
    padding: 16px 36px;
  }
  .loading {
    text-align: center;
    color: rgba(0, 0, 0, 0.6);
  }
  .detail {
    margin: 0 36px;
    .title {
      font-weight: bold;
      font-size: 16px;
      line-height: 19px;
      color: #000000;
      margin-top: 16px;
    }
    .desc {
      font-size: 14px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 12px;
      margin-bottom: 24px;
    }
    .row {
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.8);
      margin-bottom: 12px;
      .underline {
        text-decoration-line: underline;
      }

      &.last {
        margin-bottom: 32px;
      }
    }
    .action {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`

const DialogContainer = styled(Dialog)`
  display: flex;
  justify-content: center;
  align-items: center;
  .title {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    margin: 32px 32px 16px 32px;
    text-align: center;
  }
  .action {
    display: flex;
    justify-content: center;
    margin: 32px;
  }
`

const useStyles = makeStyles(() => ({
  paper: { minWidth: '320px', maxWidth: '320px' },
}))

export const NFT: React.FC = () => {
  const history = useHistory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const style = useStyles()
  const openDialog = (): void => setIsDialogOpen(true)
  const closeDialog = (): void => setIsDialogOpen(false)

  const url = location.href
  const appRef = useRef(null)
  const width = useWidth(appRef)
  const imageWidth = useMemo(() => {
    // 72 = figure padding
    return width !== undefined ? width - 72 : 0
  }, [width])

  const { id } = useParams<{ id: string }>()
  const { api } = useWalletModel()

  const { data } = useQuery(
    [Query.NFTDetail, id, api],
    async () => {
      const { data } = await api.getNFTDetail(id)
      return data
    },
    { enabled: id != null }
  )
  const detail = data

  const tranfer = useCallback(() => {
    history.push(`/transfer/${id}`, {
      nftDetail: detail,
    })
  }, [history, id, detail])

  return (
    <Container>
      <Appbar
        title="秘宝细节"
        left={<BackSvg onClick={() => history.goBack()} />}
        right={<ShareSvg onClick={openDialog} />}
        ref={appRef}
      />
      <div className="figure">
        <LazyLoadImage
          src={detail?.renderer ?? ''}
          width={imageWidth}
          height={imageWidth}
        />
      </div>
      {detail == null ? (
        <Loading />
      ) : (
        <section className="detail">
          <div className="title">{detail?.name}</div>
          <div className="desc">{detail?.description}</div>
          <div className="row">
            <Limited count={detail.total} fontSize={14} />
          </div>
          <div className="row last">
            <Creator
              fontSize={14}
              name={detail.issuer_info.name}
              url={detail.issuer_info.avatar_url}
            />
          </div>
          <div className="action">
            <Button type="primary" onClick={tranfer}>
              转让
            </Button>
          </div>
        </section>
      )}
      <DialogContainer
        open={isDialogOpen}
        classes={{ paper: style.paper }}
        onBackdropClick={closeDialog}
      >
        <div className="title">点击复制链接并分享至社交媒体</div>
        <Copyzone text={url} displayText={url} />
        <div className="action">
          <Button onClick={closeDialog}>关闭</Button>
        </div>
      </DialogContainer>
    </Container>
  )
}
