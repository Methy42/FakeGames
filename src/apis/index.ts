import { request } from "../utils/request";

export const wxLogin = async (code: string, userInfo: IWxUserInfo) => {
    console.log("wxLogin", code);
    
    const res = await request("/wechat-account/login", {
        method: 'POST',
        data: {
            code,
            userInfo
        }
    });

    return res;
}
