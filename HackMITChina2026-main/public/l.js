// 全局配置与弹窗样式初始化
const API_BASE_URL = "http://106.14.147.100:3000/api";

const brutSwalObj = {
    customClass: { popup: 'brut-modal', confirmButton: 'btn btn-brut btn-brut-red mx-2', cancelButton: 'btn btn-brut mx-2' },
    buttonsStyling: false
};

// ================= 主题切换逻辑 =================
const themeBtn = document.getElementById('btn-theme-toggle');
const currentTheme = localStorage.getItem('sys-theme') || 'light';

// 初始化主题
function initTheme() {
    const linkElement = document.querySelector('link[href*="light.css"], link[href*="dark.css"]');
    if (linkElement) {
        linkElement.href = currentTheme === 'dark' ? 'dark.css' : 'light.css';
        themeBtn.innerHTML = currentTheme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    }
}

// 切换主题
function toggleTheme() {
    const currentStoredTheme = localStorage.getItem('sys-theme') || 'light';
    const newTheme = currentStoredTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('sys-theme', newTheme);
    const linkElement = document.querySelector('link[href*="light.css"], link[href*="dark.css"]');
    if (linkElement) {
        linkElement.href = newTheme === 'dark' ? 'dark.css' : 'light.css';
        themeBtn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    }
}

// 初始化主题
initTheme();

// 绑定主题切换按钮事件
themeBtn.addEventListener('click', toggleTheme);

// ================= 用户注册功能 =================
document.getElementById('btn-do-register').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    if (!email || !password) {
        Swal.fire({ ...brutSwalObj, title: 'DATA_ERR', text: '邮箱和密码不能为空。', icon: 'warning' });
        return;
    }

    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'PROCESSING...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        const data = await response.json();

        if (data.success) {
            Swal.fire({ ...brutSwalObj, title: 'NODE CREATED', text: `注册成功！欢迎你，${role}。`, icon: 'success' }).then(() => {
                // 模拟点击，切换回登录标签页
                document.getElementById('tab-login').click(); 
            });
        } else {
            Swal.fire({ ...brutSwalObj, title: 'REG_FAILED', text: data.message, icon: 'error' });
        }
    } catch (error) {
        console.error("注册请求报错:", error);
        Swal.fire({ ...brutSwalObj, title: 'SYS_ERR', text: '无法连接到云服务器。', icon: 'error' });
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// ================= 用户登录功能 =================
document.getElementById('btn-do-login').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        Swal.fire({ ...brutSwalObj, title: 'DATA_ERR', text: '请输入邮箱和密码。', icon: 'warning' });
        return;
    }

    const btn = e.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'VERIFYING...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            // 登录成功，保存用户状态
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', data.role);
            
            // 注意：学生端对应的文件如果是 s_d.html，需要做个映射。
            // 假设你后端返回的 role 恰好是 'student', 'teacher', 'admin'
            // 如果你的学生端文件就叫 student_dashboard.html，这行不用改。
            // 如果你的学生端是 s_d.html，你需要加个判断：
            // 修复后的逻辑：统一使用全拼的 dashboard.html
            window.location.href = `${data.role}_dashboard.html`;
        } else {
            Swal.fire({ ...brutSwalObj, title: 'AUTH_FAILED', text: data.message, icon: 'error' });
        }
    } catch (error) {
        console.error("登录请求报错:", error);
        Swal.fire({ ...brutSwalObj, title: 'SYS_ERR', text: '无法连接到云服务器，请检查网络或后端状态！', icon: 'error' });
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});