import { en_us } from "./en_us";

type Language = "zh_cn" | "en_us";
type LanguageKeys = keyof typeof en_us;

class LanguageInstance {
    private language!: Language;
    public setLang!: (language: Language) => void;

    public InitLanguage= ({ language, setLanguage }: { language: Language, setLanguage?: (language: Language) => void }) => {
        this.language = language;
        this.setLang = setLanguage || ((language: Language) => {
            this.language = language;
        });
    }
    
    public lang = (key: LanguageKeys) => {
        if (this.language === "zh_cn") {
            return key;
        } else if (this.language === "en_us") {
            return en_us[key] || key;
        }
        return key;
    }
}

const languageInstance = new LanguageInstance();
export const InitLanguage = languageInstance.InitLanguage;
export const setLang = languageInstance.setLang;
export const lang = languageInstance.lang;