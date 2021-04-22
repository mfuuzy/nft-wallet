import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Redirect, useHistory, useLocation, useParams } from 'react-router'
import styled from 'styled-components'
import { Appbar } from '../../components/Appbar'
import { NFTDetail, Query } from '../../models'
import { RoutePath } from '../../routes'
import { ReactComponent as BackSvg } from '../../assets/svg/back.svg'
import { ReactComponent as ScanSvg } from '../../assets/svg/scan.svg'
import { ReactComponent as ErrorSvg } from '../../assets/svg/error.svg'
import { ReactComponent as SuccessSvg } from '../../assets/svg/success.svg'
import { ReactComponent as FailSvg } from '../../assets/svg/fail.svg'
import { ReactComponent as CloseSvg } from '../../assets/svg/close.svg'
import { Button } from '../../components/Button'
import { Drawer } from '@material-ui/core'
import CircularProgress from '@material-ui/core/CircularProgress'
import { LazyLoadImage } from '../../components/Image'
import { isValidCkbLongAddress } from '../../utils'
import { ActionDialog } from '../../components/ActionDialog'
import { useWalletModel } from '../../hooks/useWallet'
import { QrcodeScaner } from '../../components/QRcodeScaner.tsx'
import { useWidth } from '../../hooks/useWidth'
import { Limited } from '../../components/Limited'
import { Creator } from '../../components/Creator'
import { useQuery } from 'react-query'
import { MainContainer } from '../../styles'
import { CONTAINER_MAX_WIDTH } from '../../constants'

const Container = styled(MainContainer)`
  display: flex;
  height: 100%;
  flex-direction: column;
  .content {
    display: flex;
    flex-direction: column;
    margin: 0 36px;
    height: 100%;
    label {
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 120px;
      margin-bottom: 12px;
    }
    .error {
      font-weight: 600;
      font-size: 12px;
      line-height: 17px;
      color: #d03a3a;
      display: flex;
      align-items: center;
      margin-top: 10px;
      svg {
        margin-right: 4px;
      }
    }
    .form {
      display: flex;
      justify-content: center;
      align-items: center;
      .input {
        background: transparent;
        width: 100%;
        border: none;
        overflow: auto;
        outline: none;
        border-radius: 0;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
        resize: none;
        border-bottom: 1px solid #000000;
      }
      svg {
        margin-left: 10px;
      }
    }
    .action {
      display: flex;
      justify-content: center;
      margin-top: 35px;
    }
    .desc {
      margin-top: auto;
      margin-bottom: 50px;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      p {
        margin: 0;
      }
    }
  }
`

const DrawerContainer = styled.div`
  margin: 32px 36px;
  margin-bottom: 0;
  .header {
    display: flex;
    align-items: center;
    label {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.6);
      margin: 0;
      display: flex;
      align-items: center;
    }
    svg {
      margin-left: auto;
      cursor: pointer;
    }
  }
  .card {
    margin-top: 8px;
    margin-bottom: 32px;
    display: flex;
    height: 80px;
    .info {
      margin: 4px 0;
      flex: 1;
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-weight: 600;
      font-size: 12px;
      line-height: 17px;
      overflow: hidden;
      .title {
        color: #000000;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .row {
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
  .address {
    margin-top: 12px;
    font-size: 14px;
    line-height: 16px;
    color: #000000;
    font-weight: 600;
    word-break: break-all;
  }
  .center {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 32px;
    margin-bottom: 40px;
    .loading {
      margin-left: 10px;
    }
  }
`

export enum FailedMessage {
  SignFail = '签名失败，请重新签名',
  TranferFail = '发送失败，请检查当前网络情况，重新发送',
  NoCamera = '没有找到摄像头',
}

export const Transfer: React.FC = () => {
  const location = useLocation<{ nftDetail?: NFTDetail }>()
  const history = useHistory()
  const { signTransaction, api, isLogined, address } = useWalletModel()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [ckbAddress, setCkbAddress] = useState('')
  const [failedMessage, setFailedMessage] = useState(FailedMessage.TranferFail)
  const [isSendingNFT, setIsSendingNFT] = useState(false)
  const [isAddressValid, setIsAddressValid] = useState(false)
  const [isSendDialogSuccess, setIsSendDialogSuccess] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [isScaning, setIsScaning] = useState(false)
  const qrcodeScanerRef = useRef<QrcodeScaner>(null)

  const textareaOnChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value
      let isValidAddress = isValidCkbLongAddress(val)
      const isSameAddress = val !== '' && address === val
      if (isSameAddress) {
        isValidAddress = false
      }
      setIsAddressValid(isValidAddress)
      setCkbAddress(val)
    },
    [address]
  )

  const isSameAddress = useMemo(() => {
    return address !== '' && address === ckbAddress
  }, [address, ckbAddress])

  const stopTranfer = (isSuccess: boolean): void => {
    setIsSendingNFT(false)
    setIsDrawerOpen(false)
    if (isSuccess) {
      setIsSendDialogSuccess(true)
    } else {
      setIsErrorDialogOpen(true)
    }
  }
  const transferOnClock = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])
  const { id } = useParams<{ id: string }>()

  const sendNFT = useCallback(async () => {
    setIsSendingNFT(true)
    try {
      const { tx } = await api
        .getTransferNftTransaction(id, ckbAddress)
        .catch((err) => {
          setFailedMessage(FailedMessage.TranferFail)
          stopTranfer(false)
          throw new Error(err)
        })

      const signTx = await signTransaction(tx).catch((err) => {
        setFailedMessage(FailedMessage.SignFail)
        stopTranfer(false)
        throw new Error(err)
      })

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await api.transfer(id, signTx!, ckbAddress).catch((err) => {
        setFailedMessage(FailedMessage.TranferFail)
        stopTranfer(false)
        console.log(err)
        throw err
      })
    } catch (error) {
      console.log(error)
      return
    }
    stopTranfer(true)
  }, [signTransaction, id, ckbAddress, api])
  const closeDrawer = (): void => setIsDrawerOpen(false)
  const stopScan = (): void => {
    setIsScaning(false)
    qrcodeScanerRef.current?.stopScan()
  }
  const [hasPermission, setHasPermission] = useState(true)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)
  const startScan = useCallback(() => {
    if (!hasVideoDevice) {
      setFailedMessage(FailedMessage.NoCamera)
      setIsErrorDialogOpen(true)
      return
    }
    if (hasPermission) {
      setIsScaning(true)
      qrcodeScanerRef.current?.startScan()
    } else {
      alert('没有摄像头权限，请刷新页面重新授权。')
    }
  }, [hasPermission, hasVideoDevice])

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setHasVideoDevice(devices.some((d) => d.kind === 'videoinput'))
      })
      .catch(Boolean)
  }, [])

  const { data: remoteNftDetail } = useQuery(
    [Query.NFTDetail, id, api],
    async () => {
      const { data } = await api.getNFTDetail(id)
      return data
    },
    { enabled: id != null && location.state?.nftDetail == null }
  )

  const nftDetail = useMemo(() => {
    return location.state?.nftDetail ?? remoteNftDetail
  }, [location.state, remoteNftDetail])

  const appRef = useRef(null)
  const containerRef = useRef(null)
  const containerWidth = useWidth(appRef)
  const bodyRef = useRef(document.body)
  const bodyWidth = useWidth(bodyRef)

  const drawerLeft = useMemo(() => {
    if (bodyWidth == null) {
      return 0
    }
    if (bodyWidth <= CONTAINER_MAX_WIDTH) {
      return 0
    }
    return `${(bodyWidth - CONTAINER_MAX_WIDTH) / 2}px`
  }, [bodyWidth])

  return isLogined ? (
    <Container ref={containerRef}>
      <Appbar
        title="转让"
        left={<BackSvg onClick={() => history.goBack()} />}
        right={<div />}
        ref={appRef}
      />
      <QrcodeScaner
        ref={qrcodeScanerRef}
        isDrawerOpen={isScaning}
        onCancel={stopScan}
        width={containerWidth}
        onScanCkbAddress={(address) => {
          setCkbAddress(address)
          stopScan()
          setIsAddressValid(true)
        }}
        onDecodeError={(e) => {
          if (e.toString().includes('permission')) {
            setHasPermission(false)
          }
          stopScan()
        }}
      />
      <div className="content">
        <label>接收方地址</label>
        <div className="form">
          <textarea
            className="input"
            placeholder="请输入 CKB 长地址"
            value={ckbAddress}
            onChange={textareaOnChange}
          />
          <ScanSvg onClick={startScan} />
        </div>
        <div
          className="error"
          style={{
            visibility:
              !isAddressValid && ckbAddress !== '' ? 'visible' : 'hidden',
          }}
        >
          <ErrorSvg />
          {isSameAddress ? '无法转让秘宝给自己' : '请输入正确的 CKB 地址'}
        </div>
        <div className="action">
          <Button
            type="primary"
            onClick={transferOnClock}
            disbaled={!isAddressValid}
          >
            转让
          </Button>
        </div>
        <div className="desc">
          <p>请仔细检查输入的地址，</p>
          <p>一旦转让，将无法撤回</p>
        </div>
      </div>
      <ActionDialog
        icon={<SuccessSvg />}
        content="已提交转让交易"
        detail="提示: 链上确认可能需要半分钟时间"
        open={isSendDialogSuccess}
        onConfrim={() => {
          setIsSendDialogSuccess(false)
          history.push(RoutePath.Transactions)
        }}
      />
      <ActionDialog
        icon={<FailSvg />}
        content={failedMessage}
        open={isErrorDialogOpen}
        onConfrim={() => setIsErrorDialogOpen(false)}
        onBackdropClick={() => setIsErrorDialogOpen(false)}
      />
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        PaperProps={{
          style: {
            position: 'absolute',
            width: drawerLeft === 0 ? '100%' : `${CONTAINER_MAX_WIDTH}px`,
            left: drawerLeft,
          },
        }}
      >
        {nftDetail !== undefined ? (
          <DrawerContainer>
            <div className="header">
              <label>转让：</label>
              {isSendingNFT ? null : <CloseSvg onClick={closeDrawer} />}
            </div>
            <div className="card">
              <LazyLoadImage
                src={nftDetail.bg_image_url}
                width={80}
                height={80}
              />
              <div className="info">
                <div className="title">{nftDetail.name}</div>
                <div className="row">
                  <Limited count={nftDetail.total} />
                </div>
                <div className="row">
                  <Creator
                    name={nftDetail.issuer_info.name}
                    url={nftDetail.issuer_info.avatar_url}
                  />
                </div>
              </div>
            </div>
            <label>接收方地址：</label>
            <p className="address">{ckbAddress}</p>
            <div className="center">
              <Button type="primary" onClick={sendNFT} disbaled={isSendingNFT}>
                确认
                {isSendingNFT ? (
                  <CircularProgress size="1em" className="loading" />
                ) : null}
              </Button>
            </div>
          </DrawerContainer>
        ) : null}
      </Drawer>
    </Container>
  ) : (
    <Redirect to={RoutePath.Login} />
  )
}
