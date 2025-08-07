/**
 * 语言切换器组件
 * Language Switcher Component
 */
class LanguageSwitcher {
    constructor() {
        this.supportedLanguages = ['zh-CN', 'en-US'];
        // 从localStorage获取保存的语言设置，如果没有则默认为中文
        const savedLanguage = localStorage.getItem('pdf-inspector-language');
        this.currentLanguage = savedLanguage && this.supportedLanguages.includes(savedLanguage) ? savedLanguage : 'zh-CN';
        this.init();
    }

    /**
     * 初始化语言切换器
     */
    init() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.waitForLanguageManager();
            });
        } else {
            this.waitForLanguageManager();
        }
    }

    /**
     * 等待语言管理器初始化
     */
    waitForLanguageManager() {
        if (window.languageManager) {
            // 同步语言管理器的当前语言
            const managerLanguage = window.languageManager.getCurrentLanguage();
            if (managerLanguage && this.supportedLanguages.includes(managerLanguage)) {
                this.currentLanguage = managerLanguage;
            }
            
            this.createLanguageSwitcher();
            this.bindEvents();
            this.updateDisplay();
        } else {
            // 如果语言管理器还没加载，等待一下
            setTimeout(() => {
                this.waitForLanguageManager();
            }, 100);
        }
    }

    /**
     * 创建语言切换器UI
     */
    createLanguageSwitcher() {
        // 检查是否已存在语言切换器
        if (document.getElementById('languageSwitcher')) {
            console.log('语言切换器已存在');
            return;
        }

        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) {
            console.error('找不到头部操作区域');
            return;
        }

        console.log('创建语言切换器');

        // 创建语言切换器容器
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'language-switcher';
        switcherContainer.id = 'languageSwitcher';

        // 创建语言切换按钮
        const switcherBtn = document.createElement('button');
        switcherBtn.className = 'btn btn-language';
        switcherBtn.id = 'languageBtn';
        switcherBtn.setAttribute('aria-label', 'Language Switcher');
        switcherBtn.innerHTML = `
            <i class="fas fa-globe"></i>
            <span id="currentLanguageText">中文</span>
            <i class="fas fa-chevron-down"></i>
        `;

        // 创建语言下拉菜单
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'language-dropdown';
        dropdownMenu.id = 'languageDropdown';
        dropdownMenu.style.display = 'none';

        // 添加语言选项
        this.supportedLanguages.forEach(lang => {
            const option = document.createElement('div');
            option.className = 'language-option';
            option.setAttribute('data-lang', lang);
            option.innerHTML = `
                <span class="language-name">${this.getLanguageDisplayName(lang)}</span>
                <span class="language-flag">${this.getLanguageFlag(lang)}</span>
            `;
            dropdownMenu.appendChild(option);
        });

        switcherContainer.appendChild(switcherBtn);
        switcherContainer.appendChild(dropdownMenu);

        // 插入到头部操作区域的最后面
        headerActions.appendChild(switcherContainer);
        
        console.log('语言切换器创建完成');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const switcherBtn = document.getElementById('languageBtn');
        const dropdownMenu = document.getElementById('languageDropdown');

        if (switcherBtn) {
            switcherBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                this.closeDropdown();
            }
        });

        // 语言选项点击事件
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                this.switchLanguage(lang);
                this.closeDropdown();
            });
        });

        // 键盘导航
        if (switcherBtn) {
            switcherBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown();
                }
            });
        }
    }

    /**
     * 切换下拉菜单显示状态
     */
    toggleDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            dropdown.style.display = isVisible ? 'none' : 'block';
            
            // 更新按钮状态
            const btn = document.getElementById('languageBtn');
            if (btn) {
                const chevron = btn.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            }
        }
    }

    /**
     * 关闭下拉菜单
     */
    closeDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            
            const btn = document.getElementById('languageBtn');
            if (btn) {
                const chevron = btn.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.style.transform = 'rotate(0deg)';
                }
            }
        }
    }

    /**
     * 切换语言
     */
    async switchLanguage(languageCode) {
        if (this.supportedLanguages.includes(languageCode)) {
            this.currentLanguage = languageCode;
            if (window.languageManager) {
                console.log('切换语言到:', languageCode);
                await window.languageManager.switchLanguage(languageCode);
            }
            this.updateDisplay();
        }
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        const currentLanguageText = document.getElementById('currentLanguageText');
        if (currentLanguageText) {
            currentLanguageText.textContent = this.getLanguageDisplayName(this.currentLanguage);
        }

        // 更新选项状态
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * 获取语言显示名称
     */
    getLanguageDisplayName(languageCode) {
        const displayNames = {
            'zh-CN': '中文',
            'en-US': 'English'
        };
        return displayNames[languageCode] || languageCode;
    }

    /**
     * 获取语言标志
     */
    getLanguageFlag(languageCode) {
        const flags = {
            'zh-CN': '🇨🇳',
            'en-US': '🇺🇸'
        };
        return flags[languageCode] || '🌐';
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 设置当前语言
     */
    setCurrentLanguage(languageCode) {
        if (this.supportedLanguages.includes(languageCode)) {
            this.currentLanguage = languageCode;
            this.updateDisplay();
        }
    }
}

// 创建全局语言切换器实例
const languageSwitcher = new LanguageSwitcher(); 