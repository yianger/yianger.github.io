document.addEventListener('DOMContentLoaded', function() {
    const modeIndicator = document.getElementById('mode-indicator');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const errorMessage = document.getElementById('error-message');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.querySelector('.upload-btn');
    const dropArea = document.getElementById('drop-area');
    const saveExitBtn = document.getElementById('save-exit-btn');
    const emptyState = document.getElementById('empty-state');
    
    // 管理员密码 (在实际应用中，这应该通过后端验证)
    const ADMIN_PASSWORD = "admin2023";
    
    // 从本地存储加载图片数据
    let imageData = JSON.parse(localStorage.getItem('imageGallery')) || [];
    
    // 初始化页面
    function initPage() {
        if (imageData.length > 0) {
            emptyState.style.display = 'none';
            imageData.forEach(item => {
                createImageCard(item.src, item.title, item.description, false);
            });
        }
    }
    
    // 点击模式指示器显示管理员登录面板
    modeIndicator.addEventListener('click', function() {
        if (!document.body.classList.contains('edit-mode')) {
            adminPanel.style.display = 'block';
            passwordInput.focus();
        }
    });
    
    // 提交密码
    passwordSubmit.addEventListener('click', function() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            // 密码正确，进入编辑模式
            document.body.classList.add('edit-mode');
            adminPanel.style.display = 'none';
            passwordInput.value = '';
            errorMessage.style.display = 'none';
            
            // 显示成功消息
            showNotification('管理员模式已激活', 'success');
        } else {
            // 密码错误
            errorMessage.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    // 保存并退出编辑模式
    saveExitBtn.addEventListener('click', function() {
        document.body.classList.remove('edit-mode');
        showNotification('已保存并退出编辑模式', 'success');
        
        // 保存数据到本地存储
        localStorage.setItem('imageGallery', JSON.stringify(imageData));
    });
    
    // 点击上传按钮触发文件选择
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择变化事件
    fileInput.addEventListener('change', handleFiles);
    
    // 拖放事件处理
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.style.backgroundColor = '#e6f0ff';
        dropArea.style.borderColor = '#6366f1';
    }
    
    function unhighlight() {
        dropArea.style.backgroundColor = '#f8fafc';
        dropArea.style.borderColor = '#cbd5e1';
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.match('image.*')) {
                alert('请上传图片文件！');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const fileName = file.name.replace(/\.[^/.]+$/, ""); // 移除文件扩展名
                createImageCard(e.target.result, fileName, '新上传的图片', true);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    function createImageCard(imageSrc, title, description, addToData = true) {
        // 隐藏空状态
        emptyState.style.display = 'none';
        
        // 创建图片卡片
        const card = document.createElement('div');
        card.className = 'image-card';
        
        // 生成唯一ID
        const cardId = 'card-' + Date.now();
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${imageSrc}" alt="${title}">
                <div class="edit-controls">
                    <button class="edit-btn edit-image">编辑</button>
                    <button class="edit-btn delete-image">删除</button>
                </div>
            </div>
            <div class="text-content">
                <div class="image-title" contenteditable="false">${title}</div>
                <div class="image-description" contenteditable="false">${description}</div>
            </div>
        `;
        
        // 添加到图库
        const gallery = document.getElementById('image-gallery');
        gallery.appendChild(card);
        
        // 添加到数据数组
        if (addToData) {
            imageData.push({
                id: cardId,
                src: imageSrc,
                title: title,
                description: description
            });
        }
        
        // 添加删除功能
        const deleteBtn = card.querySelector('.delete-image');
        deleteBtn.addEventListener('click', function() {
            // 从数据数组中移除
            imageData = imageData.filter(item => item.id !== cardId);
            card.remove();
            
            // 如果没有图片了，显示空状态
            if (gallery.children.length === 1) {
                emptyState.style.display = 'block';
            }
            
            showNotification('图片已删除', 'info');
        });
        
        // 添加编辑功能
        const editBtn = card.querySelector('.edit-image');
        const titleElement = card.querySelector('.image-title');
        const descriptionElement = card.querySelector('.image-description');
        
        editBtn.addEventListener('click', function() {
            const isEditing = titleElement.contentEditable === 'true';
            
            if (isEditing) {
                // 保存编辑
                titleElement.contentEditable = 'false';
                descriptionElement.contentEditable = 'false';
                editBtn.textContent = '编辑';
                
                // 更新数据数组
                const index = imageData.findIndex(item => item.id === cardId);
                if (index !== -1) {
                    imageData[index].title = titleElement.textContent;
                    imageData[index].description = descriptionElement.textContent;
                }
                
                showNotification('编辑已保存', 'success');
            } else {
                // 开始编辑
                titleElement.contentEditable = 'true';
                descriptionElement.contentEditable = 'true';
                editBtn.textContent = '保存';
                
                // 聚焦到标题
                titleElement.focus();
            }
        });
    }
    
    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = type === 'success' ? '#10b981' : 
                                           type === 'error' ? '#ef4444' : '#6366f1';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.fontWeight = '600';
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    // 页面保护机制 - 防止普通用户编辑
    document.addEventListener('contextmenu', function(e) {
        if (!document.body.classList.contains('edit-mode')) {
            e.preventDefault();
            showNotification('此页面内容受保护', 'error');
        }
    });
    
    // 防止文本选择
    if (!document.body.classList.contains('edit-mode')) {
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });
        
        // 设置CSS防止文本选择
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
    }
    
    // 初始化页面
    initPage();
});