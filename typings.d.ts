declare module "*.png"
declare module "*.jpg"
declare module "*.json"

interface IWxUserInfo {
    avatarUrl: string;
    city: string;
    country: string;
    gender: number;
    language: string;
    nickName: string;
    province: string;
}