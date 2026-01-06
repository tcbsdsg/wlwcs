// 模拟数据状态
let state = {
    medicines: [
        { id: 1, name: '阿莫西林胶囊', slot: 1, stock: 12, expiry: '2025-12-31', usage: '每日3次，每次2粒', image: 'amoxicillin.jpg' },
        { id: 2, name: '布洛芬缓释胶囊', slot: 2, stock: 5, expiry: '2024-06-20', usage: '疼痛时服用1粒', image: 'ibuprofen.jpg' },
        { id: 3, name: '维生素C片', slot: 3, stock: 50, expiry: '2026-01-01', usage: '每日1次，每次1片', image: 'vitaminc.webp' }
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

// ---------------------- Template Logic Implementation ----------------------
var api = new NLECloudAPI();

var account = "19884642296";        //测试帐号 
var password = "tcb2696679437";            //测试密码 
var projectID = "1328517"; 	 	 	 	 //测试的项目ID 
var deviceID = "1395962"; 	 	 	 	 //测试的设备ID 
var sensorApiTag = "nl_temperature"; 	 //测试的传感器ApiTag 
var actuatorApiTag = "switch"; 	 //测试的执行器ApiTag 
var cametaApiTag = "newcamera";  //测试的摄像头ApiTag 

// 新大陆云平台配置 (保留用于UI交互)
const NEWLAND_CONFIG = {
    projectId: projectID,
    deviceId: deviceID,
    username: account,
    password: password
};

/** 
* 用户登录（同时返回AccessToken） 
* api.userLogin(帐号, 密码) 
**/ 
// SDK初始化与登录
function startTemplateLogic() {
    // 调用 userLogin 方法进行身份认证
    // 成功后 SDK 会自动保存 AccessToken，用于后续请求
    api.userLogin(account, password).completed(function (data) { 
        console.log('用户登录（同时返回AccessToken），服务器返回：', data); 
        if (data.Status === 0) { 
            getOtherApi(); 
        } 
    }); 
}

function getOtherApi() 
{ 
    /* 
    * 获取某个项目的信息 
    */ 
    api.getProjectInfo(projectID).completed(function (data) { 
        console.log("获取某个项目的信息，服务器返回：", data); 
    }); 

    /* 
    * 模糊查询项目 
    */ 
    api.getProjects({ 
        Keyword: "", 	 	 	 	 //关键字（可选，从id或name字段模糊匹配查询）  
        ProjectTag: "", 	 	 	 	 //项目标识码（可选，一个32位字符串） 
        NetWorkKind: null, 	 	 	 //联网方案 （可选，1：WIFI 2：以太网 3:蜂窝网络 4:蓝牙） 
        StartDate: "2018-01-01 00:00:00", 	 //起始时间（可选，包括当天，格式YYYY-MM-DD） 
        EndDate: "2018-12-31 00:00:00", 	 	 //结束时间（可选，包括当天，格式YYYY-MM-DD） 
        PageIndex: 1, 	 	 	 	 	 	 //指定页码 
        PageSize: 3 	 	 	 	 	 	 	 //指定每页要显示的数据个数，默认20，最多100 
    }).completed(function (data) { 
        console.log("模糊查询项目，服务器返回：", data); 
    }); 

    /* 
    * 查询项目所有设备的传感器 
    */ 
    api.getProjectSensors(projectID).completed(function (data) { 
        console.log("查询项目所有设备的传感器,服务器返回：", data); 
    }); 

    /* 
    * 批量查询设备最新数据 
    */ 
    api.getDevicesDatas(deviceID).completed(function (data) { 
        console.log("批量查询设备最新数据,服务器返回：", data); 
    }); 

    /* 
    * 批量查询设备的在线状态 
    */ 
    api.getDevicesStatus(deviceID).completed(function (data) { 
        console.log("批量查询设备的在线状态,服务器返回：", data); 
    }); 

    /* 
    * 查询单个设备 
    */ 
    api.getDeviceInfo(deviceID).completed(function (data) { 
        console.log("查询单个设备,服务器返回：", data); 
    }); 

    /* 
    * 模糊查询设备 
    */ 
    api.getDevices({ 
        Keyword: "", 	 	 	 	 //关键字（可选，从id或name字段左匹配） 
        DeviceIds: "", 	 	 	 	 //指定设备ID（可选，如“124,34423,2345”，多个用逗号分隔，最多100个） 
        Tag: null, 	 	 	 	 	 //设备标识（可选） 
        IsOnline: null, 	 	 	 	 //在线状态（可选，true|false） 
        IsShare: null, 	 	 	 	 //数据保密性（可选，true|false） 
        ProjectKeyWord: null, 	 	 //项目ID或纯32位字符的项目标识码（可选） 
        StartDate: "2018-01-01 00:00:00", 	 	 //起始时间（可选，包括当天，格式YYYY-MM-DD）  
        EndDate: "2018-12-31 00:00:00", 	 	 	 //结束时间（可选，包括当天，格式YYYY-MM-DD） 
        PageIndex: 1, 	 	 	 	 	 	 	 //指定页码 Required 
        PageSize: 3 	 	 	 	 	 	 	 	 //指定每页要显示的数据个数，默认20，最多100 
    }).completed(function (data) { 
        console.log("模糊查询设备,服务器返回：", data); 
    }); 

    /* 
    * 查询单个传感器 
    */ 
    api.getSensorInfo(deviceID, sensorApiTag).completed(function (data) { 
        console.log("查询单个传感器 ,服务器返回：", data); 
    }); 

    /* 
    * 模糊查询传感器 
    */ 
    api.getSensors(deviceID, sensorApiTag + "," + actuatorApiTag).completed(function (data) { 
        console.log("模糊查询传感器 ,服务器返回：", data); 
    }); 

    /* 
    * 查询传感数据 
    */ 
    api.getSensorData({ 
        DeviceId: deviceID, 	 	 	 //设备ID 
        ApiTags: sensorApiTag, 	 	 //传感标识名（可选，多个用逗号分隔，最多50个） 
        Method:6, 	 	 	 	 	 //查询方式（1：XX分钟内 2：XX小时内 3：XX天内 4：XX周内 5：XX月内 6：按startDate与endDate指定日期查询） 
        TimeAgo:null, 	 	 	 	 //与Method配对使用表示"多少TimeAgo Method内"的数据，例：(Method=2,TimeAgo=30)表示30小时内的历史数据 
        Sort:'ASC', 	 	 	 	 	 //时间排序方式，DESC:倒序，ASC升序 
        StartDate:"2018-01-01 00:00:00", 	 //起始时间（可选，格式YYYY-MM-DD HH:mm:ss） 
        EndDate:"2018-12-31 00:00:00", 	 	 //结束时间（可选，格式YYYY-MM-DD HH:mm:ss） 
        PageSize:3, 	 	 	 	 	 	 	 //指定每次要请求的数据条数，默认1000，最多3000 
        PageIndex:1 	 	 	 	 	 	 	 //指定页码 

    }).completed(function (data) { 
        console.log("查询传感数据 ,服务器返回：", data); 
    }); 

     /* 
    * 聚合查询传感数据 
    */ 
    api.groupingSensorData({ 
        DeviceId: deviceID, 	 	 //设备ID 
        ApiTags: sensorApiTag, 	 //传感标识名（可选，多个用逗号分隔，最多50个） 
        GroupBy: 2, 	 	 	 	 //聚合方式（1：按分钟分组聚合 2：按小时分组聚合 3：按天分组聚合 4：按月分组聚合），默认2按小时聚合 
        Func:"MIN", 	 	 	 	 //聚合函数（与GroupBy配对使用，可以是MAX：按最大值聚合 MIN：按最小值聚合 COUNT：按统计条数聚合），默认MAX最大值聚合 
        StartDate:"2018-01-01 00:00:00", 	 //起始时间（可选，格式YYYY-MM-DD HH:mm:ss） 
        EndDate:"2018-12-31 00:00:00" 	 	 //结束时间（可选，格式YYYY-MM-DD HH:mm:ss） 

    }).completed(function (data) { 
        console.log("聚合查询传感数据 ,服务器返回：", data); 
    }); 

    /* 
    * 发送命令/控制设备 
    */ 
    api.Cmds(deviceID, actuatorApiTag, 0).completed(function (data) { 
        console.log("发送命令/控制设备,服务器返回：", data); 
    }); 

    // 获取一次温湿度数据用于UI显示
    updateSensorData();
}

// DOM 元素引用
const elements = {
    slots: [document.getElementById('slot-1'), document.getElementById('slot-2'), document.getElementById('slot-3')],
    inventoryTable: document.querySelector('#inventory-table tbody'),
    reminderList: document.getElementById('reminder-list'),
    elderlyBtn: document.getElementById('elderly-mode-btn'),
    
    // Device Control
    resetFingerprintBtn: document.getElementById('reset-fingerprint-btn'),
    openBoxBtn: document.getElementById('open-box-btn'),
    
    // Pages
    pages: document.querySelectorAll('.page'),
    navItems: document.querySelectorAll('.nav-item'),
    
    // Modals & Buttons
    healthAlertModal: document.getElementById('health-alert-modal'),
    confirmAlertBtn: document.getElementById('confirm-alert-btn'),
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

    // SOS
    sosModal: document.getElementById('sos-modal'),
    sosStep1: document.getElementById('sos-step-1'),
    sosStep2: document.getElementById('sos-step-2'),
    sosContactList: document.getElementById('sos-contact-list'),
    sosStatusText: document.getElementById('sos-status-text'),
    sosCancelBtn: document.getElementById('sos-cancel-btn'),
    sosEndBtn: document.getElementById('sos-end-btn'),
    sosCallConfirmBtn: document.getElementById('sos-call-confirm-btn'),

    closeBtns: document.querySelectorAll('.close-btn, .close-modal, .close-camera, .close-chat')
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 启动模板的API测试逻辑
    startTemplateLogic();

    // 2. 渲染UI
    renderAll();
    setupEventListeners();
    
    // Try to init chart, but don't crash if offline (Chart.js missing)
    try {
        initChart();
    } catch (e) {
        console.warn('Chart.js failed to load (likely offline mode). Charts will not be displayed.');
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#999;">图表加载失败（请检查网络连接）</div>';
        }
    }

    // Generate initial health report if page loaded
    generateHealthReport(); 
});

// ---------------------- Sensor Simulation & API ----------------------
async function updateSensorData() {
    const tempEl = document.getElementById('val-temp');
    const humidityEl = document.getElementById('val-humidity');
    
    // 1. 尝试调用 NLECloud API (SDK)
    // 回退到 getSensorData 接口，该接口之前能正常获取湿度
    
    //  构建数据请求
    const apiTags = "nl_temperature,m_humidity,voice_alarm";

    // 使用 getSensorData 接口查询指定传感器的历史数据
    api.getSensorData({
        DeviceId: NEWLAND_CONFIG.deviceId, // 指定设备ID
        ApiTags: apiTags,                  // 指定要查询的传感器标识
        Method: 2,                         // 查询方式：时间范围
        TimeAgo: 24,                       // [关键点] 查询过去 24 小时内的数据，防止数据断档
        Sort: 'DESC',                      // [关键点] 倒序排列，优先获取最新数据
        PageSize: 20                       // 获取多条数据，避免单条数据异常
    }).completed(function(result) {
        console.log("SDK Sensor Data:", result);
        
        if (result.ResultObj && result.ResultObj.DataPoints) {
            const dataPoints = result.ResultObj.DataPoints;
            
            // [ 数据的解析与展示
            
            // 1. 解析温度数据 (nl_temperature)
            const tempPoint = dataPoints.find(dp => dp.ApiTag === 'nl_temperature');
            if (tempPoint && tempPoint.PointDTO && tempPoint.PointDTO.length > 0) {
                // [关键点] 前端二次排序：确保按时间倒序，取最新的一条有效数据
                const sortedData = tempPoint.PointDTO.sort((a, b) => new Date(b.RecordTime) - new Date(a.RecordTime));
                const val = Number(sortedData[0].Value);
                
                // 更新 UI 显示
                if (tempEl) {
                    tempEl.textContent = `${val.toFixed(1)}°C`;
                    tempEl.style.color = '';
                }
            }

            // 2. 解析湿度数据 (m_humidity)
            const humPoint = dataPoints.find(dp => dp.ApiTag === 'm_humidity');
            if (humPoint && humPoint.PointDTO && humPoint.PointDTO.length > 0) {
                // 同样进行排序
                const sortedData = humPoint.PointDTO.sort((a, b) => new Date(b.RecordTime) - new Date(a.RecordTime));
                const val = Number(sortedData[0].Value);
                if (humidityEl) {
                    humidityEl.textContent = `${val.toFixed(0)}%`;
                    humidityEl.style.color = '';
                }
            }

            // 查找语音报警
            const alarmPoint = dataPoints.find(dp => dp.ApiTag === 'voice_alarm');
            if (alarmPoint && alarmPoint.PointDTO && alarmPoint.PointDTO.length > 0) {
                 const sortedData = alarmPoint.PointDTO.sort((a, b) => new Date(b.RecordTime) - new Date(a.RecordTime));
                 const val = Number(sortedData[0].Value);
                 if (val === 1) triggerHealthAlert();
            }
        }
    });
}

// ---------------------- Health Alert Logic ----------------------
let isAlertShowing = false;
function triggerHealthAlert() {
    if (isAlertShowing) return; // 避免重复弹窗
    
    isAlertShowing = true;
    elements.healthAlertModal.classList.remove('hidden');
    
    // 播放提示音 (可选)
    // const audio = new Audio('alert.mp3');
    // audio.play().catch(e => console.log('Audio play failed', e));
}

function dismissHealthAlert() {
    isAlertShowing = false;
    elements.healthAlertModal.classList.add('hidden');
    
    // 可选：发送“已处理”指令回云平台，清除报警状态
    // sendDeviceCommand('voice_alarm', 0); 
}

function renderAll() {
    renderSlots();
    renderInventory();
    renderReminders();
    renderFamily();
}

// ---------------------- AI DeepSeek Integration ----------------------
async function callDeepSeekAPI(messages) {
    const url = 'https://api.deepseek.com/v1/chat/completions';
    
    return new Promise((resolve) => {
        $.ajax({
            url: url,
            type: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            contentType: 'application/json',
            data: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: false
            }),
            success: function(data) {
                resolve(data.choices[0].message.content);
            },
            error: function(xhr, status, error) {
                console.error('DeepSeek API Error:', error);
                resolve("抱歉，AI服务暂时不可用，请稍后再试。");
            }
        });
    });
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
        el.innerHTML = `
            <div class="slot-img-container">
                <img src="https://cdn.icon-icons.com/icons2/1465/PNG/512/555pill_100868.png" class="slot-img" style="opacity:0.3; filter:grayscale(1);">
            </div>
            <div class="slot-content">
                <span class="med-name">空置</span>
                <span class="med-status">--</span>
            </div>
        `;
    });

    state.medicines.forEach(med => {
        if (med.slot >= 1 && med.slot <= 3) {
            const el = elements.slots[med.slot - 1];
            el.classList.add('occupied');
            
            const imgUrl = med.image || 'https://cdn.icon-icons.com/icons2/1465/PNG/512/555pill_100868.png';
            
            el.innerHTML = `
                <div class="slot-img-container">
                    <img src="${imgUrl}" class="slot-img">
                </div>
                <div class="slot-content">
                    <span class="med-name">${med.name}</span>
                    <span class="med-status">剩余: ${med.stock}</span>
                </div>
            `;
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
            
        const deleteBtn = `<button class="btn-danger btn-sm" onclick="deleteMedicine(${med.id})" title="删除药品"><i class="fas fa-trash"></i></button>`;

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
            <td data-label="操作">
                <div style="display:flex; gap:5px; justify-content:flex-end;">
                    ${actionBtn}
                    ${deleteBtn}
                </div>
            </td>
        `;
        elements.inventoryTable.appendChild(row);
    });
}

// 3. 渲染提醒
// [提醒演示] 模块二：渲染列表与库存联动
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
// [提醒演示] 模块三：生成ICS文件同步日历
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
    const elderlyToggle = document.getElementById('elderly-mode-toggle');
    if (elderlyToggle) {
        elderlyToggle.addEventListener('change', (e) => {
            state.settings.elderlyMode = e.target.checked;
            document.body.classList.toggle('elderly-mode', state.settings.elderlyMode);
        });
    }

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
        // [提醒演示] 模块一：创建提醒数据
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

    if(elements.confirmAlertBtn) {
        elements.confirmAlertBtn.addEventListener('click', dismissHealthAlert);
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
        // [展示代码] 以下是真实的条码扫描与API查询逻辑 (因API额度限制暂注释)
        /*
        initRealScanner();
        */
        
        // --- 以下为演示用模拟逻辑 ---
        const context = elements.cameraCanvas.getContext('2d');
        elements.cameraCanvas.width = elements.cameraFeed.videoWidth;
        elements.cameraCanvas.height = elements.cameraFeed.videoHeight;
        context.drawImage(elements.cameraFeed, 0, 0);
        
        stopCamera();
        elements.cameraModal.classList.add('hidden');
        
        alert("识别成功！已自动提取药品信息。");
        elements.addModal.classList.remove('hidden');
        document.getElementById('med-name').value = "木香顺气丸";
        document.getElementById('med-stock').value = "600";
        document.getElementById('med-expiry').value = "2026-12-31";
        document.getElementById('med-usage').value = "一日2-3次，每次6-9克(约100-150丸)";
    });

    // 添加药品表单
    elements.addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const medName = document.getElementById('med-name').value;
        let medImage = 'https://via.placeholder.com/50'; // Default placeholder
        
        // Hardcode image for Muxiang Shunqi Wan
        if (medName === '木香顺气丸') {
            medImage = 'ganmaoling.jpg'; // 暂用现有图片代替
        }

        const newMed = {
            id: Date.now(),
            name: medName,
            slot: parseInt(document.getElementById('med-slot').value),
            stock: parseInt(document.getElementById('med-stock').value),
            expiry: document.getElementById('med-expiry').value,
            usage: document.getElementById('med-usage').value,
            image: medImage
        };
        
        const existingIdx = state.medicines.findIndex(m => m.slot === newMed.slot);
        if (existingIdx !== -1) {
            if(!confirm(`药格 ${newMed.slot} 已有药品，确认替换吗？`)) return;
            
            // Remove reminders for the medicine being replaced
            const removedMed = state.medicines[existingIdx];
            state.reminders = state.reminders.filter(r => r.medId !== removedMed.id);
            
            state.medicines.splice(existingIdx, 1);
        }
        
        state.medicines.push(newMed);
        elements.addModal.classList.add('hidden');
        e.target.reset();
        renderAll();
        updateChart();
    });

    // 紧急求助
    const emergencyBtn = document.getElementById('emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            const sosModal = document.getElementById('sos-modal');
            const step1 = document.getElementById('sos-step-1');
            const step2 = document.getElementById('sos-step-2');
            const list = document.getElementById('sos-contact-list');
            const confirmBtn = document.getElementById('sos-call-confirm-btn');

            let selectedContactName = null;

            if (sosModal && step1 && step2 && list) {
                // 重置状态
                step1.classList.remove('hidden');
                step2.classList.add('hidden');
                list.innerHTML = ''; 
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<i class="fas fa-phone"></i> 立即呼叫';

                // 1. 添加固定选项：120 急救中心
                const addOption = (name, label, iconClass, isFixed = false) => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-outline full-width';
                    btn.style.padding = '15px';
                    btn.style.textAlign = 'left';
                    btn.style.display = 'flex';
                    btn.style.justifyContent = 'space-between';
                    btn.style.alignItems = 'center';
                    btn.style.border = '1px solid #ddd'; // Default border
                    
                    if(isFixed) {
                        btn.style.background = '#fff5f5'; // Light red bg for 120
                        btn.style.color = '#dc3545';
                        btn.style.borderColor = '#ffc9c9';
                    }

                    btn.innerHTML = `
                        <span><i class="${iconClass}"></i> ${label}</span>
                        <i class="fas fa-check-circle" style="opacity: 0; color: var(--success-color);"></i>
                    `;
                    
                    btn.onclick = () => {
                        // 清除其他选中状态
                        Array.from(list.children).forEach(child => {
                            child.style.border = '1px solid #ddd';
                            child.style.background = child.getAttribute('data-fixed') ? '#fff5f5' : 'transparent';
                            child.querySelector('.fa-check-circle').style.opacity = '0';
                        });
                        
                        // 选中当前
                        btn.style.border = '2px solid var(--primary-color)';
                        btn.style.background = '#e8f5e9';
                        btn.querySelector('.fa-check-circle').style.opacity = '1';
                        
                        selectedContactName = name;
                        confirmBtn.disabled = false;
                        confirmBtn.innerHTML = `<i class="fas fa-phone"></i> 呼叫 ${name}`;
                    };

                    if(isFixed) btn.setAttribute('data-fixed', 'true');
                    list.appendChild(btn);
                };

                addOption('120急救中心', '120 急救中心', 'fas fa-ambulance', true);

                // 2. 添加家庭成员
                state.family.forEach(member => {
                    addOption(member.name, `${member.name} <small>(${member.relation})</small>`, 'fas fa-user');
                });
                
                // 3. 绑定呼叫按钮事件
                confirmBtn.onclick = () => {
                    if(selectedContactName) {
                        startSOSCall(selectedContactName);
                    }
                };

                sosModal.classList.remove('hidden');
            } else {
                console.error("SOS elements missing");
                alert("正在呼叫紧急联系人...");
            }
        });
    }
    
    // 开始呼叫逻辑
    function startSOSCall(name) {
        const step1 = document.getElementById('sos-step-1');
        const step2 = document.getElementById('sos-step-2');
        const statusText = document.getElementById('sos-status-text');
        
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        statusText.innerHTML = `正在呼叫 <strong>${name}</strong>...<br><span style="font-size:0.8em;color:#666">请保持通话畅通</span>`;
    }

    // SOS 取消/挂断
    const sosCancelBtn = document.getElementById('sos-cancel-btn');
    if(sosCancelBtn) {
        sosCancelBtn.addEventListener('click', () => {
             document.getElementById('sos-modal').classList.add('hidden');
        });
    }
    
    const sosEndBtn = document.getElementById('sos-end-btn');
    if(sosEndBtn) {
        sosEndBtn.addEventListener('click', () => {
             document.getElementById('sos-modal').classList.add('hidden');
             // 重置
             document.getElementById('sos-step-1').classList.remove('hidden');
             document.getElementById('sos-step-2').classList.add('hidden');
        });
    }

    // 确认补货跳转
    elements.confirmBuyBtn.addEventListener('click', () => {
        const medName = elements.confirmBuyBtn.getAttribute('data-med-name');
        const url = `https://search.jd.com/Search?keyword=${encodeURIComponent(medName)}`;
        window.location.href = url;
    });

    // 设备控制事件监听
    if(elements.resetFingerprintBtn) {
        elements.resetFingerprintBtn.addEventListener('click', handleResetFingerprint);
    }
    if(elements.openBoxBtn) {
        elements.openBoxBtn.addEventListener('click', handleOpenBox);
    }
}

// ---------------------- Newland Cloud Device Control ----------------------
async function sendDeviceCommand(apiTag, value) {
    return new Promise((resolve, reject) => {
        // 使用 SDK 的 Cmds 方法
        api.Cmds(NEWLAND_CONFIG.deviceId, apiTag, value).completed(function(result) {
            console.log("SDK Cmds Result:", result);
            if (result.Status === 0) {
                resolve(result);
            } else {
                reject(new Error(result.Msg || "Command failed"));
            }
        });
    });
}

async function handleResetFingerprint() {
    if(!confirm('确定要重置指纹模块吗？这将清除所有已存储的指纹。')) return;
    
    const btn = elements.resetFingerprintBtn;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    btn.disabled = true;

    try {
        // 尝试调用云平台 API
        // 请确保云平台上有对应的执行器 ApiTag，例如 'fingerprint_ctrl'
        await sendDeviceCommand('fingerprint_ctrl', 1);
        alert('指令已发送成功！(指纹重置)');
    } catch (e) {
        console.error(e);
        // 失败时回退到模拟成功提示，以免演示中断
        alert('API调用异常，已执行本地模拟重置。');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleOpenBox() {
    const btn = elements.openBoxBtn;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    btn.disabled = true;

    try {
        // 尝试调用云平台 API
        // 使用全局定义的 actuatorApiTag
        await sendDeviceCommand(actuatorApiTag, 1);
        alert('指令已发送成功！药箱已开启，请及时取药。');
        
        // 5秒后自动关闭（复位）
        setTimeout(async () => {
            try {
                await sendDeviceCommand(actuatorApiTag, 0);
                console.log("药箱自动复位/关闭");
            } catch (err) {
                console.error("自动复位失败:", err);
            }
        }, 5000);
        
    } catch (e) {
        console.error(e);
        alert('API调用异常，已执行本地模拟开启。');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
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
/*
// [展示代码] 真实扫码功能实现模块
// 依赖: QuaggaJS

// [扫码演示] 第一步：引入 QuaggaJS 库与初始化
function initRealScanner() {
    // 1. 初始化扫描器配置
    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#camera-feed'), // 视频流容器
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // 使用后置摄像头
            }
        },
        decoder : {
            readers : ["ean_reader"] // 仅识别商品条形码(EAN-13)
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Scanner initialization finished. Ready to start");
        Quagga.start(); // 启动扫描
    });

    // 2. 监听条码识别成功事件
    // [扫码演示] 第二步：实时流解析与条码捕获
    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;
        console.log("识别到条码:", code);
        
        // 停止扫描
        Quagga.stop();
        
        // 3. 调用第三方药品数据库API查询详情
        fetchDrugInfo(code);
    });
}

// [展示代码] 药品信息查询模块
// [扫码演示] 第三步：对接药品数据库 API
async function fetchDrugInfo(barcode) {
    try {
        // API: 聚合数据/万维易源 (需申请Key)
        // const API_URL = `https://api.juhe.cn/barcode/query?code=${barcode}&key=YOUR_API_KEY`;
        
        // 模拟API请求过程
        // const response = await fetch(API_URL);
        // const data = await response.json();
        

        alert(`扫码成功！条码: ${barcode}\n正在自动填充信息...`);
        
        // 4. 自动填充表单
        elements.addModal.classList.remove('hidden');
        document.getElementById('med-name').value = "阿莫西林胶囊"; // data.name
        document.getElementById('med-stock').value = "24"; 
        document.getElementById('med-usage').value = "每日3次，每次2粒";
        
        elements.cameraModal.classList.add('hidden');
        
    } catch (error) {
        console.error("查询失败", error);
        alert("未查询到该药品信息，请尝试手动录入。");
    }
}
*/

window.openBuyModal = function(medName) {
    elements.buyMedName.textContent = `确认跳转至京东购买 [${medName}] 吗？`;
    elements.confirmBuyBtn.setAttribute('data-med-name', medName); // 暂存药品名
    elements.buyModal.classList.remove('hidden');
};

window.deleteMedicine = function(medId) {
    if(!confirm('确定要从库存中移除该药品吗？相关的提醒也将被删除。')) return;
    
    // Find med
    const idx = state.medicines.findIndex(m => m.id === medId);
    if (idx === -1) return;
    
    // Remove reminders first
    state.reminders = state.reminders.filter(r => r.medId !== medId);
    
    // Remove medicine
    state.medicines.splice(idx, 1);
    
    renderAll();
    updateChart();
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
                label: '用药频次',
                data: [3, 3, 3, 3, 3, 3, 3], // 模拟每日用药3次
                borderColor: '#007bff', // 蓝色
                tension: 0.4,
                fill: false
            }, {
                label: '实际消耗量',
                data: [6, 6, 6, 6, 6, 6, 6], // 模拟每日消耗6粒
                borderColor: '#dc3545', // 红色
                tension: 0.4,
                fill: false
            }, {
                label: '剩余药量',
                data: [50, 44, 38, 32, 26, 20, 14], // 模拟库存递减
                borderColor: '#28a745', // 绿色
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // 设置工具提示背景颜色
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    }
                },
                title: {
                    display: true,
                    text: '近7天药品使用情况'
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
