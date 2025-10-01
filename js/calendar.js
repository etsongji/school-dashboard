// Google Calendar API 연동

// Google Calendar API 설정
const GOOGLE_CALENDAR_CONFIG = {
    API_KEY: 'YOUR_GOOGLE_API_KEY', // Google Cloud Console에서 발급받은 API 키
    CALENDAR_ID: 'YOUR_SCHOOL_CALENDAR_ID', // 학교 구글 캘린더 ID
    MAX_RESULTS: 10,
    TIME_MIN: new Date().toISOString(),
    TIME_MAX: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30일 후까지
};

// Google Calendar API 초기화
function initializeGoogleCalendar() {
    // Google API 라이브러리 로드 확인
    if (typeof gapi !== 'undefined') {
        gapi.load('client', initGoogleCalendarClient);
    } else {
        // Google API 라이브러리 동적 로드
        loadGoogleAPIScript();
    }
}

// Google API 스크립트 로드
function loadGoogleAPIScript() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = function() {
        gapi.load('client', initGoogleCalendarClient);
    };
    script.onerror = function() {
        console.error('Google API 스크립트 로드 실패');
        showCalendarError('Google Calendar 연결에 실패했습니다.');
    };
    document.head.appendChild(script);
}

// Google Calendar 클라이언트 초기화
function initGoogleCalendarClient() {
    gapi.client.init({
        apiKey: GOOGLE_CALENDAR_CONFIG.API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    }).then(function() {
        console.log('Google Calendar API 초기화 완료');
        loadGoogleCalendar();
    }).catch(function(error) {
        console.error('Google Calendar API 초기화 실패:', error);
        showCalendarError('Google Calendar 초기화에 실패했습니다.');
    });
}

// Google Calendar 이벤트 로드
function loadGoogleCalendar() {
    const calendarLoading = document.getElementById('calendarLoading');
    const calendarEvents = document.getElementById('calendarEvents');
    
    if (!calendarLoading || !calendarEvents) return;
    
    // 로딩 상태 표시
    calendarLoading.style.display = 'flex';
    calendarEvents.style.display = 'none';
    
    // API가 초기화되지 않은 경우 모의 데이터 사용
    if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.calendar) {
        console.log('Google Calendar API 미사용 - 모의 데이터 로드');
        setTimeout(() => {
            loadMockCalendarData();
        }, 1500);
        return;
    }
    
    // Google Calendar API 호출
    gapi.client.calendar.events.list({
        calendarId: GOOGLE_CALENDAR_CONFIG.CALENDAR_ID,
        timeMin: GOOGLE_CALENDAR_CONFIG.TIME_MIN,
        timeMax: GOOGLE_CALENDAR_CONFIG.TIME_MAX,
        showDeleted: false,
        singleEvents: true,
        maxResults: GOOGLE_CALENDAR_CONFIG.MAX_RESULTS,
        orderBy: 'startTime'
    }).then(function(response) {
        const events = response.result.items;
        displayCalendarEvents(events);
    }).catch(function(error) {
        console.error('Google Calendar 이벤트 로드 실패:', error);
        // 실패 시 모의 데이터 사용
        loadMockCalendarData();
    });
}

// 모의 캘린더 데이터 로드
function loadMockCalendarData() {
    const mockEvents = [
        {
            summary: '중간고사 시작',
            start: { dateTime: getDateString(1) + 'T09:00:00' },
            end: { dateTime: getDateString(1) + 'T17:00:00' },
            description: '1학기 중간고사가 시작됩니다. 시험 일정을 확인하세요.'
        },
        {
            summary: '학부모 상담주간',
            start: { dateTime: getDateString(3) + 'T14:00:00' },
            end: { dateTime: getDateString(7) + 'T18:00:00' },
            description: '학부모님과의 개별 상담이 진행됩니다.'
        },
        {
            summary: '체육대회',
            start: { dateTime: getDateString(10) + 'T09:00:00' },
            end: { dateTime: getDateString(10) + 'T16:00:00' },
            description: '전교생이 참여하는 체육대회가 열립니다.'
        },
        {
            summary: '창립기념일 (휴무)',
            start: { date: getDateString(15) },
            end: { date: getDateString(16) },
            description: '학교 창립기념일로 휴무입니다.'
        },
        {
            summary: '진로체험의 날',
            start: { dateTime: getDateString(20) + 'T09:00:00' },
            end: { dateTime: getDateString(20) + 'T15:00:00' },
            description: '다양한 직업 체험 프로그램이 진행됩니다.'
        }
    ];
    
    displayCalendarEvents(mockEvents);
}

// 날짜 문자열 생성 헬퍼 함수
function getDateString(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
}

// 캘린더 이벤트 표시
function displayCalendarEvents(events) {
    const calendarLoading = document.getElementById('calendarLoading');
    const calendarEvents = document.getElementById('calendarEvents');
    
    if (!calendarLoading || !calendarEvents) return;
    
    // 로딩 숨기기
    calendarLoading.style.display = 'none';
    calendarEvents.style.display = 'block';
    
    if (!events || events.length === 0) {
        calendarEvents.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-check"></i>
                <p>예정된 학사일정이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    // 이벤트 HTML 생성
    const eventsHTML = events.map(event => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);
        const isAllDay = !event.start.dateTime;
        
        const dateStr = formatEventDate(startDate, endDate, isAllDay);
        const title = event.summary || '제목 없음';
        const description = event.description || '';
        
        return `
            <div class="event-item" data-event-id="${event.id || ''}">
                <div class="event-date">${dateStr}</div>
                <div class="event-title">${title}</div>
                ${description ? `<div class="event-description">${description}</div>` : ''}
                <div class="event-meta">
                    <span class="event-type">${isAllDay ? '종일' : '시간제'}</span>
                    ${getEventPriority(title)}
                </div>
            </div>
        `;
    }).join('');
    
    calendarEvents.innerHTML = eventsHTML;
    
    // 애니메이션 효과
    const eventItems = calendarEvents.querySelectorAll('.event-item');
    eventItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s, transform 0.5s';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 이벤트 날짜 포맷팅
function formatEventDate(startDate, endDate, isAllDay) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    let dateStr = '';
    
    // 날짜 관계 확인
    if (startDay.getTime() === today.getTime()) {
        dateStr = '오늘';
    } else if (startDay.getTime() === tomorrow.getTime()) {
        dateStr = '내일';
    } else {
        dateStr = startDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    }
    
    // 시간 추가 (종일 이벤트가 아닌 경우)
    if (!isAllDay) {
        const timeStr = startDate.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        dateStr += ` ${timeStr}`;
    }
    
    return dateStr;
}

// 이벤트 우선순위 배지 생성
function getEventPriority(title) {
    const highPriorityKeywords = ['시험', '고사', '휴무', '휴일'];
    const mediumPriorityKeywords = ['상담', '회의', '설명회'];
    
    const titleLower = title.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => titleLower.includes(keyword))) {
        return '<span class="event-priority high">중요</span>';
    } else if (mediumPriorityKeywords.some(keyword => titleLower.includes(keyword))) {
        return '<span class="event-priority medium">알림</span>';
    }
    
    return '<span class="event-priority normal">일반</span>';
}

// 캘린더 오류 표시
function showCalendarError(message) {
    const calendarLoading = document.getElementById('calendarLoading');
    const calendarEvents = document.getElementById('calendarEvents');
    
    if (!calendarLoading || !calendarEvents) return;
    
    calendarLoading.style.display = 'none';
    calendarEvents.style.display = 'block';
    calendarEvents.innerHTML = `
        <div class="calendar-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="loadGoogleCalendar()" class="retry-btn">
                <i class="fas fa-retry"></i> 다시 시도
            </button>
        </div>
    `;
}

// 특정 날짜의 이벤트 가져오기
function getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    
    if (typeof gapi !== 'undefined' && gapi.client && gapi.client.calendar) {
        return gapi.client.calendar.events.list({
            calendarId: GOOGLE_CALENDAR_CONFIG.CALENDAR_ID,
            timeMin: dateStr + 'T00:00:00Z',
            timeMax: dateStr + 'T23:59:59Z',
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime'
        }).then(function(response) {
            return response.result.items;
        });
    } else {
        // 모의 데이터에서 해당 날짜 이벤트 반환
        return Promise.resolve([]);
    }
}

// 이벤트 클릭 핸들러
document.addEventListener('click', function(e) {
    if (e.target.closest('.event-item')) {
        const eventItem = e.target.closest('.event-item');
        const eventId = eventItem.dataset.eventId;
        
        if (eventId) {
            showEventDetails(eventId);
        }
    }
});

// 이벤트 상세 정보 표시
function showEventDetails(eventId) {
    // 이벤트 상세 정보 모달 구현
    console.log('이벤트 상세 정보:', eventId);
    // 실제 구현에서는 모달창을 띄워 상세 정보를 보여줌
}

// 캘린더 새로고침
function refreshCalendar() {
    console.log('캘린더 새로고침 중...');
    loadGoogleCalendar();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 약간의 지연 후 캘린더 로드 (페이지 로딩 성능 향상)
    setTimeout(() => {
        initializeGoogleCalendar();
    }, 1000);
});

// CSS 스타일 추가
const calendarStyles = `
    .no-events {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
    }
    
    .no-events i {
        font-size: 3rem;
        color: #667eea;
        margin-bottom: 1rem;
    }
    
    .calendar-error {
        text-align: center;
        padding: 2rem 1rem;
        color: #e74c3c;
    }
    
    .calendar-error i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .retry-btn {
        background: #667eea;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        margin-top: 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: background 0.3s;
    }
    
    .retry-btn:hover {
        background: #5a6fd8;
    }
    
    .event-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .event-type {
        font-size: 0.8rem;
        color: #666;
        background: #f0f0f0;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
    }
    
    .event-priority {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-weight: 500;
    }
    
    .event-priority.high {
        background: #e74c3c;
        color: white;
    }
    
    .event-priority.medium {
        background: #f39c12;
        color: white;
    }
    
    .event-priority.normal {
        background: #95a5a6;
        color: white;
    }
    
    .event-item {
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .event-item:hover {
        transform: translateX(5px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = calendarStyles;
document.head.appendChild(styleSheet);