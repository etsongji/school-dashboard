// 메인 애플리케이션 JavaScript

// 전역 변수
let currentMealDate = new Date();

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    updateCurrentTime();
    loadTodayActivities();
    loadMealInfo();
    loadNotices();
    
    // 매분마다 시간 업데이트
    setInterval(updateCurrentTime, 60000);
    
    // 매 30분마다 데이터 새로고침
    setInterval(refreshAllData, 1800000);
}

// 현재 시간 업데이트
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 오늘의 활동 로드
function loadTodayActivities() {
    // 시뮬레이션 데이터 (실제로는 서버에서 가져옴)
    const activities = [
        {
            time: "08:00",
            title: "조회",
            description: "각 교실에서 담임선생님과 함께",
            tag: "필수",
            type: "mandatory"
        },
        {
            time: "15:30", 
            title: "동아리 활동",
            description: "과학실험반, 토론반, 밴드부 등",
            tag: "선택",
            type: "optional"
        },
        {
            time: "17:00",
            title: "방과후 수업", 
            description: "수학, 영어 심화과정",
            tag: "신청자",
            type: "registered"
        }
    ];
    
    updateActivitiesList(activities);
}

// 활동 목록 업데이트
function updateActivitiesList(activities) {
    const activitiesList = document.getElementById('activitiesList');
    const activityCount = document.getElementById('activityCount');
    
    if (!activitiesList) return;
    
    // 활동 개수 업데이트
    if (activityCount) {
        activityCount.textContent = `${activities.length}개 활동`;
    }
    
    // 활동 목록 HTML 생성
    const activitiesHTML = activities.map(activity => `
        <div class="activity-item" data-type="${activity.type}">
            <div class="activity-time">${activity.time}</div>
            <div class="activity-content">
                <h3>${activity.title}</h3>
                <p>${activity.description}</p>
                <span class="activity-tag">${activity.tag}</span>
            </div>
        </div>
    `).join('');
    
    activitiesList.innerHTML = activitiesHTML;
    
    // 애니메이션 효과
    const activityItems = activitiesList.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s, transform 0.5s';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 급식 날짜 변경
function changeMealDate(direction) {
    currentMealDate.setDate(currentMealDate.getDate() + direction);
    updateMealDateDisplay();
    loadMealInfo();
}

// 급식 날짜 표시 업데이트
function updateMealDateDisplay() {
    const mealDateElement = document.getElementById('mealDate');
    if (mealDateElement) {
        const dateString = currentMealDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        mealDateElement.textContent = dateString;
    }
}

// 급식 정보 로드
function loadMealInfo() {
    const mealMenu = document.getElementById('mealMenu');
    if (!mealMenu) return;
    
    // 로딩 상태 표시
    mealMenu.innerHTML = `
        <div class="meal-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>급식 정보를 불러오는 중...</span>
        </div>
    `;
    
    // 시뮬레이션 딜레이
    setTimeout(() => {
        // 시뮬레이션 급식 데이터
        const mealData = [
            "김치찌개",
            "백미밥", 
            "돈까스",
            "콩나물무침",
            "깍두기",
            "사과"
        ];
        
        const mealHTML = `
            <div class="meal-items">
                ${mealData.map(item => `<div class="meal-item">${item}</div>`).join('')}
            </div>
        `;
        
        mealMenu.innerHTML = mealHTML;
        updateMealDateDisplay();
    }, 1000);
}

// 공지사항 로드 및 회전 표시
async function loadNotices() {
    try {
        console.log('🔄 공지사항 로딩 시작...');
        
        // 로컬스토리지 우선 확인 (공지사항 관리 페이지에서 등록한 내용)
        let allNotices = JSON.parse(localStorage.getItem('schoolNotices')) || [];
        console.log('📥 로컬스토리지에서 로드된 공지사항:', allNotices.length, '개');
        
        // 로컬스토리지에 없으면 CMS에서 로드
        if (allNotices.length === 0 && window.cmsLoader) {
            console.log('📋 로컬스토리지가 비어있음, CMS에서 로드 시도');
            allNotices = await window.cmsLoader.loadNotices();
            console.log('📥 CMS에서 로드된 공지사항:', allNotices.length, '개');
        }
        
        // 그래도 없으면 CMS 기본 파일을 로컬스토리지로 복사
        if (allNotices.length === 0) {
            console.log('📝 CMS 기본 공지사항을 로컬스토리지로 복사');
            allNotices = window.cmsLoader ? window.cmsLoader.getDefaultNotices() : getDefaultNotices();
            
            // CMS 파일의 내용을 로컬스토리지 형식으로 변환
            const cmsNotices = [
                {
                    id: 1,
                    title: "충주고등학교 학교 대시보드에 오신 것을 환영합니다!",
                    content: "학사일정, 급식정보, 공지사항을 한눈에 확인하세요.",
                    priority: "high",
                    date: "2025-10-02",
                    author: "관리자",
                    displayStartDate: "2025-10-01",
                    displayEndDate: "2025-12-31"
                },
                {
                    id: 2,
                    title: "학사일정은 구글캘린더와 실시간 연동됩니다",
                    content: "구글캘린더에 등록된 일정이 자동으로 표시됩니다.",
                    priority: "medium",
                    date: "2025-10-02",
                    author: "시스템",
                    displayStartDate: "2025-10-01",
                    displayEndDate: "2025-12-31"
                }
            ];
            
            localStorage.setItem('schoolNotices', JSON.stringify(cmsNotices));
            allNotices = cmsNotices;
        }
        
        console.log('📋 전체 공지사항:', allNotices);
        
        // 활성 공지사항 필터링
        const activeNotices = window.cmsLoader ? 
            window.cmsLoader.getActiveNotices(allNotices) : 
            filterActiveNotices(allNotices);
        
        console.log('✅ 활성 공지사항:', activeNotices.length, '개');
        
        if (activeNotices.length === 0) {
            console.log('❌ 활성 공지사항이 없어서 배너 숨김');
            hideNoticeBanner();
            return;
        }
        
        console.log('🔄 공지사항 회전 시작');
        startNoticeRotation(activeNotices);
        
    } catch (error) {
        console.error('❌ 공지사항 로드 실패:', error);
        hideNoticeBanner();
    }
}

// 기본 공지사항 (백업용)
function getDefaultNotices() {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endDate = nextYear.toISOString().split('T')[0];
    
    return [
        {
            id: 'default-1',
            title: "충주고등학교 학교 대시보드에 오신 것을 환영합니다!",
            content: "학사일정, 급식정보, 공지사항을 한눈에 확인하세요.",
            priority: "high",
            date: today,
            author: "관리자",
            displayStartDate: today,
            displayEndDate: endDate
        }
    ];
}

// 활성 공지사항 필터링 (백업용)
function filterActiveNotices(allNotices) {
    const today = new Date().toISOString().split('T')[0];
    
    const activeNotices = allNotices.filter(notice => {
        const startDate = notice.displayStartDate || notice.date;
        const endDate = notice.displayEndDate || notice.date;
        return today >= startDate && today <= endDate;
    });
    
    // 우선순위 정렬
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return activeNotices.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
}

let currentNoticeIndex = 0;
let noticeRotationInterval = null;

function startNoticeRotation(notices) {
    if (notices.length === 0) return;
    
    // 첫 번째 공지사항 표시
    displayNotice(notices[currentNoticeIndex]);
    
    // 공지사항이 1개 이상일 때만 회전
    if (notices.length > 1) {
        // 5초마다 공지사항 변경
        noticeRotationInterval = setInterval(() => {
            currentNoticeIndex = (currentNoticeIndex + 1) % notices.length;
            displayNotice(notices[currentNoticeIndex]);
        }, 5000);
    }
}

function displayNotice(notice) {
    const noticeText = document.getElementById('noticeBannerText');
    const noticeBanner = document.getElementById('noticeBanner');
    
    if (noticeText && noticeBanner) {
        noticeText.textContent = notice.title;
        noticeBanner.style.display = 'block';
        noticeBanner.style.animation = 'slideDown 0.5s ease-out';
    }
}

function hideNoticeBanner() {
    const noticeBanner = document.getElementById('noticeBanner');
    if (noticeBanner) {
        noticeBanner.style.display = 'none';
    }
}

// 공지사항 배너 닫기
function closeNoticeBanner() {
    const noticeBanner = document.getElementById('noticeBanner');
    if (noticeBanner) {
        // 회전 인터벌 정리
        if (noticeRotationInterval) {
            clearInterval(noticeRotationInterval);
            noticeRotationInterval = null;
        }
        
        noticeBanner.style.animation = 'slideUp 0.5s ease-out forwards';
        setTimeout(() => {
            noticeBanner.style.display = 'none';
        }, 500);
    }
}

// 모든 데이터 새로고침
function refreshAllData() {
    loadTodayActivities();
    loadMealInfo();
    refreshCalendar();
    loadNotices();
    
    // 새로고침 완료 알림
    showToast('데이터가 새로고침되었습니다.');
}

// 캘린더 새로고침
function refreshCalendar() {
    // calendar.js에서 구현될 함수 호출
    if (typeof loadGoogleCalendar === 'function') {
        loadGoogleCalendar();
    }
}

// 시간표 모달 표시
function showTimeTable() {
    const modal = document.getElementById('timeTableModal');
    if (modal) {
        // 시간표 데이터 로드
        loadTimeTableData();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// 성적 조회 (추후 구현)
function showGrades() {
    showToast('성적 조회 기능은 준비 중입니다.');
}

// 시간표 데이터 로드
function loadTimeTableData() {
    const timeTableContainer = document.querySelector('.timetable-container');
    if (!timeTableContainer) return;
    
    // 시뮬레이션 시간표 데이터
    const timeTable = {
        '월요일': ['국어', '수학', '영어', '과학', '체육', '음악'],
        '화요일': ['수학', '국어', '사회', '영어', '미술', '창체'],
        '수요일': ['영어', '과학', '수학', '국어', '체육', '동아리'],
        '목요일': ['과학', '영어', '사회', '수학', '음악', '창체'],
        '금요일': ['국어', '수학', '영어', '체육', '미술', '종례']
    };
    
    const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시'];
    
    let tableHTML = '<table class="timetable">';
    tableHTML += '<thead><tr><th>교시</th>';
    
    // 요일 헤더
    Object.keys(timeTable).forEach(day => {
        tableHTML += `<th>${day}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    // 시간표 내용
    periods.forEach((period, periodIndex) => {
        tableHTML += `<tr><td class="period">${period}</td>`;
        Object.values(timeTable).forEach(daySchedule => {
            const subject = daySchedule[periodIndex] || '-';
            tableHTML += `<td class="subject">${subject}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    timeTableContainer.innerHTML = tableHTML;
}

// 모달 닫기
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 토스트 메시지 표시
function showToast(message, duration = 3000) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(102, 126, 234, 0.95);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 25px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 500;
        backdrop-filter: blur(10px);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// 페이지 가시성 변경 시 데이터 새로고침
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 페이지가 다시 보일 때 시간 업데이트
        updateCurrentTime();
    }
});

// 온라인/오프라인 상태 모니터링
window.addEventListener('online', function() {
    showToast('인터넷 연결이 복구되었습니다.');
    refreshAllData();
});

window.addEventListener('offline', function() {
    showToast('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.', 5000);
});

// 서비스 워커 등록 (PWA 지원)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker 등록 성공:', registration.scope);
            })
            .catch(function(error) {
                console.warn('⚠️ Service Worker 등록 실패:', error);
            });
    });
}