/**
 * 语言管理器
 * Language Manager
 */
class LanguageManager {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.languages = {
            'zh-CN': null,
            'en-US': null
        };
        this.translations = {};
        this.observers = [];
        
        this.init();
    }

    /**
     * 初始化语言管理器
     */
    async init() {
        try {
            // 动态加载语言包
            await this.loadLanguagePack('zh-CN');
            await this.loadLanguagePack('en-US');
            
            // 从localStorage获取保存的语言设置
            const savedLanguage = localStorage.getItem('pdf-inspector-language');
            if (savedLanguage && this.languages[savedLanguage]) {
                this.currentLanguage = savedLanguage;
            } else {
                // 根据浏览器语言自动选择
                this.detectBrowserLanguage();
            }
            
            this.updateTranslations();
            this.notifyObservers();
        } catch (error) {
            console.error('Language manager initialization failed:', error);
        }
    }

    /**
     * 动态加载语言包
     */
    async loadLanguagePack(languageCode) {
        try {
            const module = await import(`./languages/${languageCode}.js`);
            this.languages[languageCode] = module.default;
        } catch (error) {
            console.error(`Failed to load language pack: ${languageCode}`, error);
        }
    }

    /**
     * 检测浏览器语言
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        if (langCode === 'zh') {
            this.currentLanguage = 'zh-CN';
        } else {
            this.currentLanguage = 'en-US';
        }
    }

    /**
     * 切换语言
     */
    async switchLanguage(languageCode) {
        if (!this.languages[languageCode]) {
            console.error(`Language pack not found: ${languageCode}`);
            return false;
        }

        this.currentLanguage = languageCode;
        localStorage.setItem('pdf-inspector-language', languageCode);
        
        this.updateTranslations();
        this.notifyObservers();
        
        return true;
    }

    /**
     * 更新翻译内容
     */
    updateTranslations() {
        this.translations = this.languages[this.currentLanguage] || {};
    }

    /**
     * 获取翻译字符串
     */
    get(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value || defaultValue;
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return Object.keys(this.languages);
    }

    /**
     * 添加观察者
     */
    addObserver(observer) {
        this.observers.push(observer);
    }

    /**
     * 移除观察者
     */
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知观察者语言变化
     */
    notifyObservers() {
        this.observers.forEach(observer => {
            if (typeof observer.onLanguageChange === 'function') {
                observer.onLanguageChange(this.currentLanguage, this.translations);
            }
        });
    }

    /**
     * 格式化字符串（支持参数替换）
     */
    format(key, ...args) {
        let text = this.get(key);
        
        args.forEach((arg, index) => {
            text = text.replace(`{${index}}`, arg);
        });
        
        return text;
    }

    /**
     * 获取语言显示名称
     */
    getLanguageDisplayName(languageCode) {
        const displayNames = {
            'zh-CN': '中文 (简体)',
            'en-US': 'English'
        };
        return displayNames[languageCode] || languageCode;
    }

    /**
     * 检查是否为RTL语言
     */
    isRTL() {
        return false; // 目前只支持LTR语言
    }

    /**
     * 获取数字格式化
     */
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLanguage).format(number);
    }

    /**
     * 获取日期格式化
     */
    formatDate(date) {
        return new Intl.DateTimeFormat(this.currentLanguage).format(date);
    }
}

// 创建全局语言管理器实例
const languageManager = new LanguageManager();

export default languageManager; 