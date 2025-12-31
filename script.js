// 模拟数据状态
let state = {
    medicines: [
        { id: 1, name: '阿莫西林胶囊', slot: 1, stock: 12, expiry: '2025-12-31', usage: '每日3次，每次2粒', image: 'https://cdn.icon-icons.com/icons2/1465/PNG/512/555pill_100868.png' },
        { id: 2, name: '布洛芬缓释胶囊', slot: 2, stock: 5, expiry: '2024-06-20', usage: '疼痛时服用1粒', image: 'https://cdn.icon-icons.com/icons2/1150/PNG/512/1486505260-capsule-drug-medical-medicine-pill-tablet_81404.png' },
        { id: 3, name: '维生素C片', slot: 3, stock: 50, expiry: '2026-01-01', usage: '每日1次，每次1片', image: 'https://cdn.icon-icons.com/icons2/1865/PNG/512/vitamin_c_icon_113063.png' }
    ],
    reminders: [
        { id: 101, medId: 1, time: '08:00', dosage: '2粒', status: 'pending' },
        { id: 102, medId: 3, time: '09:00', dosage: '1片', status: 'completed' },
        { id: 103, medId: 1, time: '12:00', dosage: '2粒', status: 'pending' },
        { id: 104, medId: 1, time: '18:00', dosage: '2粒', status: 'pending' }
    ],
    family: [
        { id: 201, name: '父亲', relation: '父亲', phone: '13800138000' }
    ],
    settings: {
        elderlyMode: false
    }
};

const DEEPSEEK_API_KEY = 'sk-775c9806578b4ab0a31ab5a131add3bb';

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
    
    // AI Chat Elements
    aiDoctorBtn: document.getElementById('ai-doctor-btn'),
    chatModal: document.getElementById('chat-modal'),
    chatContainer: document.getElementById('chat-container'),
    chatInput: document.getElementById('chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),
    
    // Family Elements
    familyList: document.getElementById('family-list'),
    addFamilyBtn: document.getElementById('add-family-btn'),
    familyModal: document.getElementById('family-modal'),
    addFamilyForm: document.getElementById('add-family-form'),
    
    // Health Report
    refreshReportBtn: document.getElementById('refresh-report-btn'),
    aiHealthReport: document.getElementById('ai-health-report'),

    addForm: document.getElementById('add-med-form'),
    buyMedName: document.getElementById('buy-med-name'),
    confirmBuyBtn: document.getElementById('confirm-buy-btn'),
    
    // Reminder Elements
    addReminderBtn: document.getElementById('add-reminder-btn'),
    reminderModal: document.getElementById('reminder-modal'),
    addReminderForm: document.getElementById('add-reminder-form'),
    remindMedSelect: document.getElementById('remind-med-id'),

    // Camera
    cameraFeed: document.getElementById('camera-feed'),
    cameraCanvas: document.getElementById('camera-canvas'),
    captureBtn: document.getElementById('capture-btn'),
    
    closeBtns: document.querySelectorAll('.close-btn, .close-modal, .close-camera, .close-chat')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    setupEventListeners();
    initChart();
    // Generate initial health report if page loaded
    generateHealthReport(); 
});

function renderAll() {
    renderSlots();
    renderInventory();
    renderReminders();
    renderFamily();
}

// ---------------------- AI DeepSeek Integration ----------------------
async function callDeepSeekAPI(messages) {
    const url = 'https://api.deepseek.com/v1/chat/completions';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        return "抱歉，AI服务暂时不可用，请稍后再试。";
    }
}

// ---------------------- Chat Bot Logic ----------------------
function formatMessage(text) {
    // 将 markdown 的 **bold** 替换为 <strong>bold</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function appendMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    // 使用 innerHTML 来支持 HTML 标签渲染（注意：实际生产中需防范 XSS，但此处为模拟环境且数据来源可控）
    msgDiv.innerHTML = `<div class="message-bubble">${formatMessage(text)}</div>`;
    elements.chatContainer.appendChild(msgDiv);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

async function handleChatSend() {
    const text = elements.chatInput.value.trim();
    if (!text) return;

    // 1. Show User Message
    appendMessage(text, true);
    elements.chatInput.value = '';

    // 2. Show Loading
    const loadingId = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `<div class="message-bubble"><i class="fas fa-spinner fa-spin"></i> 思考中...</div>`;
    elements.chatContainer.appendChild(loadingDiv);

    // 3. Prepare Context
    const context = `你是一位专业的AI药师助手。
    当前用户的药箱数据: ${JSON.stringify(state.medicines)}
    当前用户的提醒记录: ${JSON.stringify(state.reminders)}
    请根据这些信息回答用户的问题。如果问题与用药无关，请礼貌拒绝。回答要简洁、专业且富有同理心。`;

    const messages = [
        { role: 'system', content: context },
        { role: 'user', content: text }
    ];

    // 4. Call API
    const reply = await callDeepSeekAPI(messages);

    // 5. Remove Loading and Show Reply
    const loadingEl = document.getElementById(loadingId);
    if(loadingEl) loadingEl.remove();
    appendMessage(reply, false);
}

// ---------------------- Health Report Logic ----------------------
async function generateHealthReport() {
    if (!elements.aiHealthReport) return;
    
    elements.aiHealthReport.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析您的用药数据...';
    
    const context = `请根据以下用户的用药数据生成一份简短的健康分析报告（100字以内）。
    重点关注：用药依从性、库存风险和健康建议。
    数据: ${JSON.stringify(state.medicines)}`;

    const messages = [
        { role: 'system', content: "你是一位健康顾问。" },
        { role: 'user', content: context }
    ];

    const report = await callDeepSeekAPI(messages);
    elements.aiHealthReport.innerHTML = report.replace(/\n/g, '<br>');
}


// ---------------------- Family Logic ----------------------
function renderFamily() {
    elements.familyList.innerHTML = '';
    state.family.forEach(member => {
        const div = document.createElement('div');
        div.className = 'family-item';
        div.innerHTML = `
            <div class="family-info">
                <div class="family-avatar"><i class="fas fa-user"></i></div>
                <div class="family-details">
                    <h4>${member.name} <small style="color:#888">(${member.relation})</small></h4>
                    <p><i class="fas fa-phone"></i> ${member.phone || '未填写'}</p>
                </div>
            </div>
            <button class="btn-danger btn-sm" onclick="deleteFamily(${member.id})"><i class="fas fa-trash"></i></button>
        `;
        elements.familyList.appendChild(div);
    });
}

window.deleteFamily = function(id) {
    if(confirm('确定要删除这位家庭成员吗？')) {
        state.family = state.family.filter(f => f.id !== id);
        renderFamily();
    }
};

// ---------------------- Existing Logic ----------------------

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
            <td data-label="药品信息">
                <div class="med-info-cell">
                    <img src="${med.image || 'https://via.placeholder.com/50'}" alt="${med.name}" class="med-img">
                    <span>${med.name}</span>
                </div>
            </td>
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
        
        const actionHtml = rem.status === 'pending' 
            ? `<div class="reminder-actions">
                 <button class="btn-outline btn-sm" onclick="exportToCalendar(${rem.id})" title="添加到日历"><i class="far fa-calendar-plus"></i></button>
                 <button class="btn-outline btn-sm" onclick="confirmReminder(${rem.id})">确认服用</button>
               </div>`
            : `<div class="reminder-actions">
                 <span style="padding: 5px;"><i class="fas fa-check-circle"></i> 已服用</span>
               </div>`;

        li.innerHTML = `
            <div>
                <strong>${rem.time}</strong> - ${med ? med.name : '未知药品'} 
                <span style="margin-left:10px; color:#666;">(${rem.dosage})</span>
            </div>
            ${actionHtml}
        `;
        elements.reminderList.appendChild(li);
    });
}

// ---------------------- Calendar Export Logic ----------------------
window.exportToCalendar = function(remId) {
    const rem = state.reminders.find(r => r.id === remId);
    if (!rem) return;
    
    const med = state.medicines.find(m => m.id === rem.medId);
    const title = `服用 ${med ? med.name : '药品'}`;
    const desc = `剂量: ${rem.dosage}\n来自智能药盒助手`;
    
    // Calculate start time (Today + rem.time)
    const now = new Date();
    const [hours, minutes] = rem.time.split(':');
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    // Format date for ICS (YYYYMMDDTHHMMSS)
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    };
    
    const startStr = formatICSDate(startDate);
    const endStr = formatICSDate(new Date(startDate.getTime() + 10 * 60000)); // 10 mins later
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SmartMedicineBox//CN',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@smartmedbox.com`,
        `DTSTAMP:${startStr}Z`,
        `DTSTART;TZID=Asia/Shanghai:${startStr}`,
        `DTEND;TZID=Asia/Shanghai:${endStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        'RRULE:FREQ=DAILY', // Default daily for simplicity in this demo
        'ALARM:DISPLAY',
        'TRIGGER:-PT5M',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `med_reminder_${remId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

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
                    // 如果切换到报表页，触发一次分析
                    if(targetId === 'page-reports' && elements.aiHealthReport.textContent === '正在生成分析...') {
                        generateHealthReport();
                    }
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
    
    // AI Chat Controls
    if(elements.aiDoctorBtn) {
        elements.aiDoctorBtn.addEventListener('click', () => {
            elements.chatModal.classList.remove('hidden');
        });
    }
    
    if(elements.sendChatBtn) {
        elements.sendChatBtn.addEventListener('click', handleChatSend);
    }
    
    if(elements.chatInput) {
        elements.chatInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') handleChatSend();
        });
    }
    
    // Family Controls
    if(elements.addFamilyBtn) {
        elements.addFamilyBtn.addEventListener('click', () => {
            elements.familyModal.classList.remove('hidden');
        });
    }
    
    if(elements.addFamilyForm) {
        elements.addFamilyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('family-name').value;
            const relation = document.getElementById('family-relation').value;
            const phone = document.getElementById('family-phone').value;
            
            state.family.push({
                id: Date.now(),
                name, relation, phone
            });
            
            renderFamily();
            elements.familyModal.classList.add('hidden');
            e.target.reset();
        });
    }

    // Report Refresh
    if(elements.refreshReportBtn) {
        elements.refreshReportBtn.addEventListener('click', generateHealthReport);
    }

    // Reminder Modal
    if(elements.addReminderBtn) {
        elements.addReminderBtn.addEventListener('click', () => {
            // Populate medicine select
            elements.remindMedSelect.innerHTML = '';
            state.medicines.forEach(med => {
                const option = document.createElement('option');
                option.value = med.id;
                option.textContent = med.name;
                elements.remindMedSelect.appendChild(option);
            });
            elements.reminderModal.classList.remove('hidden');
        });
    }

    if(elements.addReminderForm) {
        elements.addReminderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const medId = parseInt(document.getElementById('remind-med-id').value);
            const time = document.getElementById('remind-time').value;
            const dosage = document.getElementById('remind-dosage').value;
            
            const newRem = {
                id: Date.now(),
                medId,
                time,
                dosage,
                status: 'pending'
            };
            
            state.reminders.push(newRem);
            renderReminders();
            elements.reminderModal.classList.add('hidden');
            
            // Auto export after add
            if(confirm('提醒添加成功！是否立即同步到手机日历？')) {
                exportToCalendar(newRem.id);
            }
        });
    }

    elements.closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.addModal.classList.add('hidden');
            elements.buyModal.classList.add('hidden');
            elements.cameraModal.classList.add('hidden');
            elements.chatModal.classList.add('hidden');
            elements.familyModal.classList.add('hidden');
            elements.reminderModal.classList.add('hidden');
            stopCamera();
        });
    });

    // 拍照识别 (模拟)
    elements.captureBtn.addEventListener('click', () => {
        const context = elements.cameraCanvas.getContext('2d');
        elements.cameraCanvas.width = elements.cameraFeed.videoWidth;
        elements.cameraCanvas.height = elements.cameraFeed.videoHeight;
        context.drawImage(elements.cameraFeed, 0, 0);
        
        stopCamera();
        elements.cameraModal.classList.add('hidden');
        
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
        const medName = elements.confirmBuyBtn.getAttribute('data-med-name');
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
                facingMode: 'environment' 
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
