// global.d.ts

export interface IDTLoginFrameParams {
  id: string; // 必传，包裹容器元素ID，不带'#'
  width?: number; // 选传，二维码iframe元素宽度，最小280，默认300
  height?: number; // 选传，二维码iframe元素高度，最小280，默认300
}

export interface IDTLoginLoginParams {
  redirect_uri: string; // 必传，注意url需要encode
  response_type: string; // 必传，值固定为code
  client_id: string; // 必传
  scope: string; // 必传
  prompt: string; // 必传，值为consent。
  state?: string; // 选传
  org_type?: string; // 选传
  corpId?: string; // 选传
  exclusiveLogin?: string; // 选传
  exclusiveCorpId?: string; // 选传
}
export interface IDTLoginSuccess {
  redirectUrl: string; // 登录成功后的重定向地址
  authCode: string; // 登录成功后获取到的authCode
  state?: string; // 登录成功后获取到的state
}
