export enum RoutePath {
  Launch = '/',
  Login = '/login',
  Account = '/account',
  NFT = '/nft',
  TokenClass = '/class/:id',
  NFTs = '/home',
  NotFound = '/404',
  Transfer = '/transfer/:id',
  Info = '/account/info',
  Transactions = '/transactions',
  Profile = '/profile',
  ImagePreview = '/avatar/preview',
  Explore = '/explore',
  ExploreAll = '/explore/all',
  Help = '/help',
  Unipass = '/unipass',
  Apps = '/apps',
  License = '/license',
  AddressCollector = '/addresses',
  Claim = '/claim',
  CNY2022 = '/cny2022',
  Collection = '/explore/collection',
  RankingList = '/explore/ranking',
  Issuer = '/issuer',
  Redeem = '/redeem',
  MyRedeem = '/redemption',
  RedeemPrize = '/redeem-prize',
  RedeemResult = '/redeem-result',
  Holder = '/holder',
  HolderAddress = '/holder/address',
  PDFViewer = '/pdf-viewer',
  Orders = '/orders',
  PlacedOrders = '/orders/placed',
  PaidOrders = '/orders/paid',
  DoneOrders = '/orders/done',
  OrderDetail = '/order',
  OrderSuccess = '/order-success',
  OrderStatus = '/order-status',
  RedEnvelope = '/red-envelope',
  RedEnvelopeRecord = '/red-envelope/records',
  RedEnvelopeDetail = '/red-envelope/:id/detail',
  RedEnvelopeReceived = '/red-envelope/:id/received',
  ShareRedEnvelope = '/red-envelope/:id/share',
  Search = '/search',
  Flashsigner = '/flashsigner',
}

export enum ProfilePath {
  Regions = '/profile/regions',
  Provinces = '/profile/regions/provinces',
  Cities = '/profile/regions/cities',
  Username = '/profile/username',
  Description = '/profile/description',
  Birthday = '/profile/birthday',
}
