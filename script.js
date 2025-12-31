// 模拟数据状态
let state = {
    medicines: [
        { id: 1, name: '阿莫西林胶囊', slot: 1, stock: 12, expiry: '2025-12-31', usage: '每日3次，每次2粒' },
        { id: 2, name: '布洛芬缓释胶囊', slot: 2, stock: 5, expiry: '2024-06-20', usage: '疼痛时服用1粒' },
        { id: 3, name: '维生素C片', slot: 3, stock: 50, expiry: '2026-01-01', usage: '每日1次，每次1片' }
    ],
    reminders: [
        { id: 101, medId: 1, time: '08:00', dosage: '2粒', status: 'pending' },
        { id: 102, medId: 3, time: '09:00', dosage: '1片', status: 'completed' },
        { id: 103, medId: 1, time: '12:00', dosage: '2粒', status: 'pending' },
        { id: 104, medId: 1, time: '18:00', dosage: '2粒', status: 'pending' }
    ],
    settings: {
        elderlyMode: false
    }
};

// DOM 元素引用
const elements = {
    slots: [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')],
    inventoryTable: document.querySelector('#inventory-table tbody'),
    reminderList: document.getElementById('reminder-list'),
    elderlyBtn: document.getElementById('elderly-mode-btn'),
    
    // Pages
    pages: document.querySelectorAll('.page'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // Modals & Buttons
    manualAddBtn: document.getElementById('manual-add-btn'),
    scanBtn: document.getElementById('scan-btn'),
    addModal: document.getElementById('add-modal'),
    cameraModal: document.getElementById('camera-modal'),
    buyModal: document.getElementById('buy-modal'),
    
    addForm: document.getElementById('add-med-form'),
    buyMedName: document.getElementById('buy-med-name'),
    confirmBuyBtn: document.getElementById('confirm-buy-btn'),
    
    // Camera
    cameraFeed: document.getElementById('camera-feed'),
    cameraCanvas: document.getElementById('camera-canvas'),
    captureBtn: document.getElementById('capture-btn'),
    
    closeBtns: document.querySelectorAll('.close-btn, .close-modal, .close-camera')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    setupEventListeners();
    initChart();
});

function renderAll() {
    renderSlots();
    renderInventory();
    renderReminders();
}

// 1. 渲染药盒状态
function renderSlots() {
    elements.slots.forEach(el => {
        el.className = 'slot';
        el.querySelector('.med-name').textContent = '空置';
        el.querySelector('.med-status').textContent = '--';
    });

    state.medicines.forEach(med => {
        if (med.slot >= 1 && med.slot <= 3) {
            const el = elements.slots[med.slot - 1];
            el.classList.add('occupied');
            el.querySelector('.med-name').textContent = med.name;
            el.querySelector('.med-status').textContent = `剩余: ${med.stock}`;
        }
    });
}

// 2. 渲染库存列表
function renderInventory() {
    elements.inventoryTable.innerHTML = '';
    state.medicines.forEach(med => {
        const row = document.createElement('tr');
        
        let statusHtml = '<span class="status-badge status-ok">正常</span>';
        if (med.stock < 10) statusHtml = '<span class="status-badge status-low">余量不足</span>';
        
        const today = new Date().toISOString().split('T')[0];
        if (med.expiry < today) statusHtml = '<span class="status-badge status-expiring">已过期</span>';

        const actionBtn = med.stock < 10 
            ? `<button class="btn-primary btn-sm" onclick="openBuyModal('${med.name}')">一键补货</button>`
            : `<button class="btn-secondary btn-sm" disabled>充足</button>`;

        row.innerHTML = `
            <td data-label="药品名称">${med.name}</td>
            <td data-label="规格">${med.usage}</td>
            <td data-label="剩余量">${med.stock}</td>
            <td data-label="有效期">${med.expiry}</td>
            <td data-label="状态">${statusHtml}</td>
            <td data-label="操作">${actionBtn}</td>
        `;
        elements.inventoryTable.appendChild(row);
    });
}

// 3. 渲染提醒
function renderReminders() {
    elements.reminderList.innerHTML = '';
    state.reminders.forEach(rem => {
        const med = state.medicines.find(m => m.id === rem.medId);
        const li = document.createElement('li');
        li.className = `reminder-item ${rem.status === 'completed' ? 'done' : ''}`;
        
        const btnHtml = rem.status === 'pending' 
            ? `<button class="btn-outline" onclick="confirmReminder(${rem.id})">确认服用</button>`
            : `<span><i class="fas fa-check-circle"></i> 已服用</span>`;

        li.innerHTML = `
            <div>
                <strong>${rem.time}</strong> - ${med ? med.name : '未知药品'} 
                <span style="margin-left:10px; color:#666;">(${rem.dosage})</span>
            </div>
            ${btnHtml}
        `;
        elements.reminderList.appendChild(li);
    });
}

// 4. 事件监听
function setupEventListeners() {
    // 底部导航切换
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // 切换 Nav 状态
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // 切换 Page 状态
            elements.pages.forEach(page => {
                if(page.id === targetId) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });

    // 长辈模式
    elements.elderlyBtn.addEventListener('click', () => {
        state.settings.elderlyMode = !state.settings.elderlyMode;
        document.body.classList.toggle('elderly-mode');
        elements.elderlyBtn.innerHTML = state.settings.elderlyMode 
            ? '<i class="fas fa-user"></i>' 
            : '<i class="fas fa-user-plus"></i>';
    });

    // 模态框控制
    elements.manualAddBtn.addEventListener('click', () => {
        elements.addModal.classList.remove('hidden');
    });

    // 扫描按钮
    elements.scanBtn.addEventListener('click', () => {
        elements.cameraModal.classList.remove('hidden');
        startCamera();
    });

    elements.closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.addModal.classList.add('hidden');
            elements.buyModal.classList.add('hidden');
            elements.cameraModal.classList.add('hidden');
            stopCamera();
        });
    });

    // 拍照识别 (模拟)
    elements.captureBtn.addEventListener('click', () => {
        // 在 canvas 上画图 (模拟捕捉)
        const context = elements.cameraCanvas.getContext('2d');
        elements.cameraCanvas.width = elements.cameraFeed.videoWidth;
        elements.cameraCanvas.height = elements.cameraFeed.videoHeight;
        context.drawImage(elements.cameraFeed, 0, 0);
        
        // 停止相机
        stopCamera();
        elements.cameraModal.classList.add('hidden');
        
        // 模拟识别成功，自动填充表单
        alert("识别成功！已自动提取药品信息。");
        elements.addModal.classList.remove('hidden');
        document.getElementById('med-name').value = "阿司匹林肠溶片";
        document.getElementById('med-stock').value = "30";
        document.getElementById('med-expiry').value = "2025-05-20";
        document.getElementById('med-usage').value = "每日1次，每次1片";
    });

    // 添加药品表单
    elements.addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMed = {
            id: Date.now(),
            name: document.getElementById('med-name').value,
            slot: parseInt(document.getElementById('med-slot').value),
            stock: parseInt(document.getElementById('med-stock').value),
            expiry: document.getElementById('med-expiry').value,
            usage: document.getElementById('med-usage').value
        };
        
        const existingIdx = state.medicines.findIndex(m => m.slot === newMed.slot);
        if (existingIdx !== -1) {
            if(!confirm(`药格 ${newMed.slot} 已有药品，确认替换吗？`)) return;
            state.medicines.splice(existingIdx, 1);
        }
        
        state.medicines.push(newMed);
        elements.addModal.classList.add('hidden');
        e.target.reset();
        renderAll();
        updateChart();
    });

    // 紧急求助
    document.getElementById('emergency-btn').addEventListener('click', () => {
        alert("已触发紧急求助！正在拨打紧急联系人电话...");
    });

    // 确认补货跳转
    elements.confirmBuyBtn.addEventListener('click', () => {
        // 获取当前补货药品名称
        const medName = elements.confirmBuyBtn.getAttribute('data-med-name');
        // 跳转到京东搜索页
        const url = `https://search.jd.com/Search?keyword=${encodeURIComponent(medName)}`;
        window.location.href = url;
    });
}

// 摄像头控制逻辑
let mediaStream = null;

async function startCamera() {
    try {
        const constraints = { 
            video: { 
                facingMode: 'environment' // 优先使用后置摄像头
            } 
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        elements.cameraFeed.srcObject = mediaStream;
    } catch (err) {
        console.error("摄像头启动失败:", err);
        alert("无法访问摄像头，请检查权限设置。(在非HTTPS环境下可能受限)");
        elements.cameraModal.classList.add('hidden');
    }
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// 全局暴露
window.openBuyModal = function(medName) {
    elements.buyMedName.textContent = `确认跳转至京东购买 [${medName}] 吗？`;
    elements.confirmBuyBtn.setAttribute('data-med-name', medName); // 暂存药品名
    elements.buyModal.classList.remove('hidden');
};

window.confirmReminder = function(remId) {
    const rem = state.reminders.find(r => r.id === remId);
    if (rem) {
        rem.status = 'completed';
        renderReminders();
        
        const med = state.medicines.find(m => m.id === rem.medId);
        if (med) {
            med.stock -= 1;
            renderInventory();
            renderSlots();
        }
    }
};

// 5. 图表初始化
let consumptionChart;
function initChart() {
    const ctx = document.getElementById('consumptionChart').getContext('2d');
    consumptionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '阿莫西林消耗趋势',
                data: [12, 10, 8, 6, 4, 12, 10],
                borderColor: '#007bff',
                tension: 0.4,
                fill: false
            }, {
                label: '维生素C消耗趋势',
                data: [50, 49, 48, 47, 46, 45, 44],
                borderColor: '#28a745',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '近7天药品余量变化'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart() {
    console.log("图表数据已更新（模拟）");
}
