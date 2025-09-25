interface Window {
  DTFrameLogin: (
    frameParams: any,
    loginParams: any,
    handleSuccess: (loginResult: { redirectUrl: string; authCode: string; state: string }) => void,
    handleError: (errorMsg: string) => void,
  ) => void;
}
