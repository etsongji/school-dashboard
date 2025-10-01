// 관리자 로그인 JavaScript

// 기본 관리자 계정 (실제 환경에서는 서버에서 관리)
const ADMIN_ACCOUNTS = {
    'admin': 'admin2024!',
    'principal': 'school2024!',
    'teacher': 'teacher2024!'
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

// 로그인 페이지 초기화
function initializeLoginPage() {
    const loginForm = document.getElementById('adminLoginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    // 폼 이벤트 리스너
    loginForm.addEventListener('submit', handleLogin);
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    
    // 저장된 로그인 정보 확인
    checkSavedLogin();
    
    // 엔터 키 이벤트
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.querySelector('.modal[style*="block"]')) {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn && !loginBtn.disabled) {
                loginBtn.click();
            }
        }
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // 입력 검증
    if (!username || !password) {
        showAlert('아이디와 비밀번호를 모두 입력해주세요.', 'error');
        return;
    }
    
    // 로딩 상태 표시
    showLoading(true);
    
    try {
        // 로그인 시뮬레이션 (실제로는 서버 API 호출)
        const loginResult = await simulateLogin(username, password);
        
        if (loginResult.success) {
            // 로그인 정보 저장
            if (rememberMe) {
                localStorage.setItem('adminRememberMe', 'true');
                localStorage.setItem('adminUsername', username);
            }
            
            // 세션 저장
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminUser', JSON.stringify(loginResult.user));
            
            showAlert('로그인 성공! 관리자 대시보드로 이동합니다.', 'success');
            
            // 대시보드로 리다이렉트
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } else {
            showAlert(loginResult.message || '로그인에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        showAlert('시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
        showLoading(false);
    }
}

// 로그인 시뮬레이션
async function simulateLogin(username, password) {
    // 실제 환경에서는 서버 API 호출
    return new Promise((resolve) => {
        setTimeout(() => {
            if (ADMIN_ACCOUNTS[username] && ADMIN_ACCOUNTS[username] === password) {
                resolve({
                    success: true,
                    user: {
                        id: username,
                        name: getAdminName(username),
                        role: getAdminRole(username),
                        lastLogin: new Date().toISOString()
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: '아이디 또는 비밀번호가 올바르지 않습니다.'
                });
            }
        }, 1500); // 실제 API 호출 시간 시뮬레이션
    });
}

// 관리자 이름 가져오기
function getAdminName(username) {
    const names = {
        'admin': '시스템 관리자',
        'principal': '교장선생님',
        'teacher': '담당 교사'
    };
    return names[username] || '관리자';
}

// 관리자 역할 가져오기
function getAdminRole(username) {
    const roles = {
        'admin': 'super_admin',
        'principal': 'principal',
        'teacher': 'teacher'
    };
    return roles[username] || 'admin';
}

// 저장된 로그인 정보 확인
function checkSavedLogin() {
    const rememberMe = localStorage.getItem('adminRememberMe');
    const savedUsername = localStorage.getItem('adminUsername');
    
    if (rememberMe === 'true' && savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
    
    // 이미 로그인된 상태인지 확인
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'dashboard.html';
    }
}

// 비밀번호 표시/숨기기
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// 비밀번호 찾기 모달 표시
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 비밀번호 찾기 모달 닫기
function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 비밀번호 찾기 처리
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showAlert('이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('올바른 이메일 주소를 입력해주세요.', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        // 비밀번호 재설정 시뮬레이션
        await simulatePasswordReset(email);
        
        showAlert('비밀번호 재설정 링크가 이메일로 전송되었습니다.', 'success');
        closeForgotPassword();
        
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        showAlert('재설정 요청 중 오류가 발생했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// 비밀번호 재설정 시뮬레이션
async function simulatePasswordReset(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`비밀번호 재설정 링크 전송: ${email}`);
            resolve();
        }, 1000);
    });
}

// 이메일 유효성 검사
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 로딩 표시/숨기기
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loginBtn = document.getElementById('loginBtn');
    
    if (show) {
        loadingOverlay.style.display = 'flex';
        loginBtn.disabled = true;
    } else {
        loadingOverlay.style.display = 'none';
        loginBtn.disabled = false;
    }
}

// 알림 메시지 표시
function showAlert(message, type = 'info') {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = getAlertIcon(type);
    alert.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    // 폼 위에 삽입
    const loginForm = document.getElementById('adminLoginForm');
    loginForm.insertBefore(alert, loginForm.firstChild);
    
    // 자동 제거
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // 애니메이션
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        alert.style.transition = 'all 0.3s';
        alert.style.opacity = '1';
        alert.style.transform = 'translateY(0)';
    }, 10);
}

// 알림 아이콘 가져오기
function getAlertIcon(type) {
    const icons = {
        'error': 'fas fa-exclamation-circle',
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// 로그아웃 (다른 페이지에서 사용)
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    
    // 로그인 상태 유지가 체크되지 않은 경우 저장된 정보도 제거
    const rememberMe = localStorage.getItem('adminRememberMe');
    if (rememberMe !== 'true') {
        localStorage.removeItem('adminUsername');
    }
    
    window.location.href = 'login.html';
}

// 로그인 상태 확인 (다른 페이지에서 사용)
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 현재 관리자 정보 가져오기
function getCurrentAdmin() {
    const adminUserStr = sessionStorage.getItem('adminUser');
    return adminUserStr ? JSON.parse(adminUserStr) : null;
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        if (modalId === 'forgotPasswordModal') {
            closeForgotPassword();
        }
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal && openModal.id === 'forgotPasswordModal') {
            closeForgotPassword();
        }
    }
});

// 보안 관련 함수들
function hashPassword(password) {
    // 실제 환경에서는 적절한 해싱 알고리즘 사용
    return btoa(password); // 간단한 예시
}

function generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 세션 만료 체크
function checkSessionExpiry() {
    const loginTime = sessionStorage.getItem('adminLoginTime');
    if (loginTime) {
        const now = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8시간
        
        if (now - parseInt(loginTime) > sessionDuration) {
            showAlert('세션이 만료되었습니다. 다시 로그인해주세요.', 'warning');
            setTimeout(logout, 2000);
            return false;
        }
    }
    return true;
}

// 활동 기록
function logActivity(action, details = {}) {
    const admin = getCurrentAdmin();
    const logEntry = {
        timestamp: new Date().toISOString(),
        admin: admin ? admin.id : 'unknown',
        action: action,
        details: details,
        ip: 'client-side' // 실제로는 서버에서 기록
    };
    
    console.log('Admin Activity:', logEntry);
    // 실제 환경에서는 서버로 전송
}