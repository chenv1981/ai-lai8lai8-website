// AI导航网站 - 主应用逻辑

// 全局变量
let currentCategory = 'all';
let displayedTools = 0;
const TOOLS_PER_PAGE = 12;

// DOM元素引用
const elements = {
    // 搜索相关
    globalSearch: document.getElementById('globalSearch'),
    heroSearchInput: document.getElementById('heroSearchInput'),
    searchCategory: document.getElementById('searchCategory'),
    
    // 网格容器
    quickAccessGrid: document.getElementById('quickAccessGrid'),
    categoryGrid: document.getElementById('categoryGrid'),
    toolsGrid: document.getElementById('toolsGrid'),
    
    // 筛选和排序
    sortBy: document.getElementById('sortBy'),
    priceFilter: document.getElementById('priceFilter'),
    
    // 模态框
    toolModal: document.getElementById('toolModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    
    // 提示框
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// 热门工具列表（用于快速访问区域）
const popularTools = [
    aiToolsData.find(t => t.id === 1),  // ChatGPT
    aiToolsData.find(t => t.id === 2),  // Claude
    aiToolsData.find(t => t.id === 11), // Midjourney
    aiToolsData.find(t => t.id === 13), // Stable Diffusion
    aiToolsData.find(t => t.id === 20), // Cursor
    aiToolsData.find(t => t.id === 3),  // Gemini
    aiToolsData.find(t => t.id === 12), // DALL-E
    aiToolsData.find(t => t.id === 19)  // GitHub Copilot
].filter(Boolean);

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // 渲染所有组件
    renderQuickAccessCards();
    renderCategoryCards();
    renderToolsGrid();
    initEventListeners();
    initAnimations();
}

// 事件监听器初始化
function initEventListeners() {
    // 全局搜索
    if (elements.globalSearch) {
        elements.globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 分类标签点击
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            switchCategory(category);
            
            // 更新active状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 排序和筛选
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', function() {
            renderToolsGrid();
        });
    }
    
    if (elements.priceFilter) {
        elements.priceFilter.addEventListener('change', function() {
            renderToolsGrid();
        });
    }
    
    // 导航链接滚动
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // 更新active状态
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 滚动监听导航栏状态
    window.addEventListener('scroll', handleScroll);
    
    // 点击模态框外部关闭
    if (elements.toolModal) {
        elements.toolModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 滚动处理
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(15, 23, 42, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.background = 'rgba(15, 23, 42, 0.95)';
        header.style.boxShadow = 'none';
    }
    
    // 更新导航链接active状态
    updateActiveNavLink();
}

// 更新导航链接active状态
function updateActiveNavLink() {
    const sections = ['home', 'category', 'tools', 'prompts', 'about'];
    let currentSection = 'home';
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                currentSection = sectionId;
            }
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// 滚动到指定区块
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// 渲染快速访问卡片
function renderQuickAccessCards() {
    if (!elements.quickAccessGrid) return;
    
    elements.quickAccessGrid.innerHTML = popularTools.map(tool => `
        <div class="quick-card" onclick="openToolDetail(${tool.id})">
            <div class="icon ${getIconClass(tool.name)}" style="background: ${tool.iconColor}">
                <i class="${tool.icon}"></i>
            </div>
            <h3>${tool.name}</h3>
            <p>${tool.subcategory}</p>
        </div>
    `).join('');
}

// 获取图标类名
function getIconClass(name) {
    const nameMap = {
        'ChatGPT': 'chatgpt',
        'Claude': 'claude',
        'Midjourney': 'midjourney',
        'Stable Diffusion': 'stable',
        'Cursor': 'cursor',
        'Gemini': 'gemini',
        'DALL-E': 'dalle',
        'GitHub Copilot': 'github'
    };
    return nameMap[name] || '';
}

// 渲染分类卡片
function renderCategoryCards() {
    if (!elements.categoryGrid) return;
    
    const categoryOrder = ['text', 'image', 'video', 'code', 'audio', '3d'];
    
    elements.categoryGrid.innerHTML = categoryOrder.map(catKey => {
        const category = categoryInfo[catKey];
        const toolCount = aiToolsData.filter(t => t.category === catKey).length;
        
        return `
            <div class="category-card ${catKey}" onclick="filterByCategory('${catKey}')">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-stats">
                    <span><strong>${toolCount}</strong> 个工具</span>
                    <span><i class="fas fa-arrow-right"></i></span>
                </div>
            </div>
        `;
    }).join('');
}

// 筛选指定分类
function filterByCategory(category) {
    currentCategory = category;
    displayedTools = 0;
    
    // 更新tab按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 滚动到工具区域
    const toolsSection = document.querySelector('.tools-section');
    if (toolsSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        window.scrollTo({
            top: toolsSection.offsetTop - headerHeight - 20,
            behavior: 'smooth'
        });
    }
    
    renderToolsGrid();
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    displayedTools = 0;
    renderToolsGrid();
}

// 渲染工具网格
function renderToolsGrid() {
    if (!elements.toolsGrid) return;
    
    let filteredTools = [...aiToolsData];
    
    // 应用分类筛选
    if (currentCategory !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === currentCategory);
    }
    
    // 应用价格筛选
    const priceFilter = elements.priceFilter ? elements.priceFilter.value : 'all';
    if (priceFilter !== 'all') {
        filteredTools = filteredTools.filter(tool => {
            if (priceFilter === 'free') return tool.pricing === 'free' || tool.pricing === 'open source';
            if (priceFilter === 'freemium') return tool.pricing === 'freemium';
            if (priceFilter === 'paid') return tool.pricing === 'paid';
            return true;
        });
    }
    
    // 应用排序
    const sortBy = elements.sortBy ? elements.sortBy.value : 'popular';
    filteredTools.sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.popularity - a.popularity;
            case 'newest':
                return b.id - a.id;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });
    
    // 限制显示数量
    const toolsToShow = filteredTools.slice(0, displayedTools + TOOLS_PER_PAGE);
    displayedTools = Math.min(displayedTools + TOOLS_PER_PAGE, filteredTools.length);
    
    elements.toolsGrid.innerHTML = toolsToShow.map(tool => `
        <div class="tool-card" onclick="openToolDetail(${tool.id})">
            <div class="tool-header">
                <div class="icon" style="background: ${tool.iconColor}">
                    <i class="${tool.icon}"></i>
                </div>
                <div>
                    <h3>${tool.name}</h3>
                    <span class="tag">${tool.subcategory}</span>
                </div>
            </div>
            <div class="tool-body">
                <p>${tool.description.substring(0, 100)}...</p>
                <div class="tool-meta">
                    <span class="tool-rating">
                        <i class="fas fa-star"></i>
                        ${tool.rating}
                    </span>
                    <span class="tool-pricing ${tool.pricing === 'paid' || tool.pricing === 'freemium' ? 'paid' : ''}">
                        ${getPricingLabel(tool.pricing)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    // 更新加载更多按钮状态
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        if (displayedTools >= filteredTools.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// 获取价格标签
function getPricingLabel(pricing) {
    const labels = {
        'free': '免费',
        'freemium': '免费增值',
        'paid': '付费',
        'open source': '开源'
    };
    return labels[pricing] || pricing;
}

// 加载更多工具
function loadMoreTools() {
    renderToolsGrid();
}

// 搜索功能
function performSearch() {
    const query = elements.globalSearch ? elements.globalSearch.value.trim() : '';
    if (query) {
        elements.heroSearchInput.value = query;
        heroSearch();
    }
}

function heroSearch() {
    const query = elements.heroSearchInput.value.trim();
    const category = elements.searchCategory ? elements.searchCategory.value : 'all';
    
    if (!query) {
        showToast('请输入搜索关键词');
        return;
    }
    
    // 筛选匹配的工具
    let results = aiToolsData.filter(tool => {
        const matchesQuery = 
            tool.name.toLowerCase().includes(query.toLowerCase()) ||
            tool.description.toLowerCase().includes(query.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesCategory = category === 'all' || tool.category === category;
        
        return matchesQuery && matchesCategory;
    });
    
    // 按相关性排序
    results.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase()) ? 2 : 0;
        const aTagMatch = a.tags.filter(t => t.toLowerCase().includes(query.toLowerCase())).length;
        const bTagMatch = b.tags.filter(t => t.toLowerCase().includes(query.toLowerCase())).length;
        
        return (bNameMatch + bTagMatch) - (aNameMatch + aTagMatch);
    });
    
    // 显示搜索结果
    if (results.length > 0) {
        currentCategory = 'all';
        displayedTools = 0;
        
        // 临时修改渲染逻辑显示搜索结果
        const originalFiltered = [...aiToolsData];
        
        // 直接在页面上显示结果
        const toolsSection = document.querySelector('.tools-section');
        if (toolsSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            window.scrollTo({
                top: toolsSection.offsetTop - headerHeight - 20,
                behavior: 'smooth'
            });
        }
        
        // 渲染搜索结果
        elements.toolsGrid.innerHTML = results.map(tool => `
            <div class="tool-card" onclick="openToolDetail(${tool.id})">
                <div class="tool-header">
                    <div class="icon" style="background: ${tool.iconColor}">
                        <i class="${tool.icon}"></i>
                    </div>
                    <div>
                        <h3>${tool.name}</h3>
                        <span class="tag">${tool.subcategory}</span>
                    </div>
                </div>
                <div class="tool-body">
                    <p>${tool.description.substring(0, 100)}...</p>
                    <div class="tool-meta">
                        <span class="tool-rating">
                            <i class="fas fa-star"></i>
                            ${tool.rating}
                        </span>
                        <span class="tool-pricing ${tool.pricing === 'paid' || tool.pricing === 'freemium' ? 'paid' : ''}">
                            ${getPricingLabel(tool.pricing)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 更新分类标签
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        
        showToast(`找到 ${results.length} 个相关工具`);
    } else {
        showToast('未找到相关工具');
    }
}

// 快速搜索
function quickSearch(toolName) {
    elements.heroSearchInput.value = toolName;
    elements.searchCategory.value = 'all';
    heroSearch();
}

// 打开工具详情
function openToolDetail(toolId) {
    const tool = aiToolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    // 更新模态框内容
    elements.modalTitle.textContent = tool.name;
    elements.modalBody.innerHTML = `
        <div class="tool-detail">
            <div class="tool-detail-header">
                <div class="icon" style="background: ${tool.iconColor}; width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                    <i class="${tool.icon}" style="font-size: 36px; color: white;"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 8px;">${tool.name}</h3>
                    <span class="tag" style="background: rgba(99, 102, 241, 0.2); color: var(--primary-light); padding: 6px 14px; border-radius: 20px; font-size: 0.9rem;">${tool.subcategory}</span>
                </div>
            </div>
            
            <p style="margin: 24px 0; color: var(--text-secondary); line-height: 1.8;">${tool.description}</p>
            
            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <span class="tool-rating" style="display: flex; align-items: center; gap: 6px; background: var(--card-hover); padding: 8px 16px; border-radius: 10px;">
                    <i class="fas fa-star" style="color: var(--warning-color);"></i>
                    ${tool.rating} 分
                </span>
                <span style="display: flex; align-items: center; gap: 6px; background: var(--card-hover); padding: 8px 16px; border-radius: 10px;">
                    <i class="fas fa-comment-alt"></i>
                    ${(tool.reviews / 1000).toFixed(0)}K 评论
                </span>
                <span class="tool-pricing ${tool.pricing === 'paid' ? 'paid' : ''}" style="padding: 8px 16px; border-radius: 10px;">
                    ${getPricingLabel(tool.pricing)}
                </span>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-tags"></i> 标签
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${tool.tags.map(tag => `
                        <span style="background: var(--card-hover); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary);">${tag}</span>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-star"></i> 功能特点
                </h4>
                <ul style="list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    ${tool.features.map(feature => `
                        <li style="display: flex; align-items: center; gap: 8px; background: var(--card-hover); padding: 10px 14px; border-radius: 10px;">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <a href="${tool.website}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--primary-color); color: white; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; transition: var(--transition);">
                    <i class="fas fa-external-link-alt"></i>
                    访问官网
                </a>
                <button onclick="copyToolInfo(${tool.id})" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--card-hover); border: 1px solid var(--border-color); color: var(--text-primary); padding: 14px 24px; border-radius: 12px; cursor: pointer; font-weight: 500; transition: var(--transition);">
                    <i class="fas fa-copy"></i>
                    复制信息
                </button>
            </div>
        </div>
    `;
    
    // 显示模态框
    elements.toolModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 复制工具信息
function copyToolInfo(toolId) {
    const tool = aiToolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    const info = `${tool.name}

${tool.description}

标签: ${tool.tags.join(', ')}
评分: ${tool.rating}
价格: ${getPricingLabel(tool.pricing)}

官网: ${tool.website}`;
    
    navigator.clipboard.writeText(info).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

// 关闭模态框
function closeModal() {
    elements.toolModal.classList.remove('active');
    document.body.style.overflow = '';
}

// 复制提示词
function copyPrompt(card) {
    const prompt = card.dataset.prompt;
    navigator.clipboard.writeText(prompt).then(() => {
        showToast('提示词已复制到剪贴板');
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

// 显示提示框
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('active');
    
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

// 实用工具功能
function openPromptGenerator() {
    showToast('提示词生成器功能开发中');
}

function openModelCompare() {
    showToast('模型对比功能开发中');
}

function openAPIGuide() {
    showToast('API使用指南功能开发中');
}

function openCostCalculator() {
    showToast('成本计算器功能开发中');
}

// 初始化动画
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.quick-card, .category-card, .tool-card, .utility-card, .prompt-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .quick-card:nth-child(1) { transition-delay: 0ms; }
    .quick-card:nth-child(2) { transition-delay: 50ms; }
    .quick-card:nth-child(3) { transition-delay: 100ms; }
    .quick-card:nth-child(4) { transition-delay: 150ms; }
    .quick-card:nth-child(5) { transition-delay: 200ms; }
    .quick-card:nth-child(6) { transition-delay: 250ms; }
    .quick-card:nth-child(7) { transition-delay: 300ms; }
    .quick-card:nth-child(8) { transition-delay: 350ms; }
    
    .category-card:nth-child(1) { transition-delay: 0ms; }
    .category-card:nth-child(2) { transition-delay: 100ms; }
    .category-card:nth-child(3) { transition-delay: 200ms; }
    .category-card:nth-child(4) { transition-delay: 300ms; }
    .category-card:nth-child(5) { transition-delay: 400ms; }
    .category-card:nth-child(6) { transition-delay: 500ms; }
    
    .tool-card:nth-child(1) { transition-delay: 0ms; }
    .tool-card:nth-child(2) { transition-delay: 50ms; }
    .tool-card:nth-child(3) { transition-delay: 100ms; }
    .tool-card:nth-child(4) { transition-delay: 150ms; }
    .tool-card:nth-child(5) { transition-delay: 200ms; }
    .tool-card:nth-child(6) { transition-delay: 250ms; }
    .tool-card:nth-child(7) { transition-delay: 300ms; }
    .tool-card:nth-child(8) { transition-delay: 350ms; }
    .tool-card:nth-child(9) { transition-delay: 400ms; }
    .tool-card:nth-child(10) { transition-delay: 450ms; }
    .tool-card:nth-child(11) { transition-delay: 500ms; }
    .tool-card:nth-child(12) { transition-delay: 550ms; }
    
    .utility-card:nth-child(1) { transition-delay: 0ms; }
    .utility-card:nth-child(2) { transition-delay: 100ms; }
    .utility-card:nth-child(3) { transition-delay: 200ms; }
    .utility-card:nth-child(4) { transition-delay: 300ms; }
    
    .prompt-card:nth-child(1) { transition-delay: 0ms; }
    .prompt-card:nth-child(2) { transition-delay: 100ms; }
    .prompt-card:nth-child(3) { transition-delay: 200ms; }
    .prompt-card:nth-child(4) { transition-delay: 300ms; }
`;
document.head.appendChild(style);

// 添加平滑滚动样式
const scrollStyle = document.createElement('style');
scrollStyle.textContent = `
    html {
        scroll-behavior: smooth;
    }
    
    * {
        scroll-margin-top: 80px;
    }
`;
document.head.appendChild(scrollStyle);
