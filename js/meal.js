// 공공데이터 급식 API 연동

// 급식 API 설정
const MEAL_API_CONFIG = {
    // 나이스 교육정보 개방포털 API 키
    API_KEY: 'cc1b9c0a34804a628cc701f43a8398e1', 
    BASE_URL: 'https://open.neis.go.kr/hub',
    SCHOOL_CODE: '8000078', // 충주고등학교 코드
    OFFICE_CODE: 'M10', // 충북교육청 코드
    SCHOOL_TYPE: 'his' // 고등학교: his, 중학교: mis, 초등학교: els
};

// HeaderMealCard 클래스
class HeaderMealCard {
    constructor() {
        this.apiKey = MEAL_API_CONFIG.API_KEY;
        this.schoolCode = MEAL_API_CONFIG.SCHOOL_CODE;
        this.officeCode = MEAL_API_CONFIG.OFFICE_CODE;
        this.baseURL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
        this.currentDate = new Date();
        this.currentMealType = '2'; // 기본값: 중식
        
        console.log('HeaderMealCard 초기화 (기본 중식):', {
            currentDate: this.currentDate,
            currentMealType: this.currentMealType,
            mealName: this.getMealTypeName(this.currentMealType)
        });
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadMealData();
    }
    
    setupEventListeners() {
        // 조식 버튼
        const breakfastBtn = document.getElementById('breakfastBtn');
        if (breakfastBtn) {
            breakfastBtn.addEventListener('click', () => {
                this.selectMealType('1');
            });
        }
        
        // 중식 버튼
        const lunchBtn = document.getElementById('lunchBtn');
        if (lunchBtn) {
            lunchBtn.addEventListener('click', () => {
                this.selectMealType('2');
            });
        }
        
        // 석식 버튼
        const dinnerBtn = document.getElementById('dinnerBtn');
        if (dinnerBtn) {
            dinnerBtn.addEventListener('click', () => {
                this.selectMealType('3');
            });
        }
    }
    
    selectMealType(mealType) {
        console.log('🍽️ 급식 타입 선택:', { 선택타입: mealType, 이전타입: this.currentMealType });
        
        const oldMealType = this.currentMealType;
        this.currentMealType = mealType;
        
        // 버튼 활성화 상태 업데이트
        this.updateActiveButton();
        
        console.log('🔄 타입 변경:', {
            이전타입: oldMealType,
            새타입: this.currentMealType,
            이전이름: this.getMealTypeName(oldMealType),
            새이름: this.getMealTypeName(this.currentMealType)
        });
        
        this.loadMealData();
    }
    
    updateActiveButton() {
        // 모든 버튼에서 active 클래스 제거
        document.querySelectorAll('.meal-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 현재 선택된 타입의 버튼에 active 클래스 추가
        const activeButton = document.querySelector(`[data-meal-type="${this.currentMealType}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        console.log('🔘 활성 버튼 업데이트:', { 
            currentMealType: this.currentMealType,
            activeButton: activeButton?.id
        });
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    getDateString() {
        const month = this.currentDate.getMonth() + 1;
        const day = this.currentDate.getDate();
        return `${month}/${day}`;
    }
    
    async loadMealData() {
        const container = document.getElementById('headerMealCard');
        if (!container) return;
        
        container.innerHTML = '<div class="meal-loading"><i class="fas fa-spinner fa-spin"></i> 급식 정보 로딩 중...</div>';
        
        const dateStr = this.formatDate(this.currentDate);
        console.log('급식 데이터 로딩:', {
            date: dateStr,
            mealType: this.currentMealType,
            currentDate: this.currentDate
        });
        
        try {
            const data = await this.fetchMealData();
            console.log('✅ API 성공 - 실제 급식 데이터 사용:', data);
            this.displayMealCard(data);
        } catch (error) {
            console.log('❌ API 호출 실패:', error.message);
            console.log('🔄 샘플 데이터로 대체합니다');
            this.showSampleMeal();
        }
    }
    
    async fetchMealData() {
        const dateStr = this.formatDate(this.currentDate);
        const targetUrl = `${this.baseURL}?KEY=${this.apiKey}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${this.officeCode}&SD_SCHUL_CODE=${this.schoolCode}&MLSV_YMD=${dateStr}`;
        
        console.log('🌐 API 요청 URL:', targetUrl);
        
        // 1. 직접 요청 먼저 시도
        try {
            console.log('1️⃣ 직접 요청 시도...');
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 직접 요청 성공!', data);
                if (data.mealServiceDietInfo) {
                    return data;
                }
            }
            console.log('직접 요청 응답 상태:', response.status, response.statusText);
        } catch (error) {
            console.log('직접 요청 실패:', error.message);
        }
        
        // 2. CORS Proxy 시도
        try {
            console.log('2️⃣ CORS Proxy 시도...');
            const corsProxyUrl = `https://cors-anywhere.herokuapp.com/${targetUrl}`;
            const response = await fetch(corsProxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ CORS Proxy 성공!', data);
                if (data.mealServiceDietInfo) {
                    return data;
                }
            }
        } catch (error) {
            console.log('CORS Proxy 실패:', error.message);
        }
        
        // 3. AllOrigins 프록시 시도
        try {
            console.log('3️⃣ AllOrigins 프록시 시도...');
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const proxyData = await response.json();
                console.log('AllOrigins 응답:', proxyData);
                if (proxyData.contents) {
                    const data = JSON.parse(proxyData.contents);
                    console.log('✅ AllOrigins 성공!', data);
                    if (data.mealServiceDietInfo) {
                        return data;
                    }
                }
            }
        } catch (error) {
            console.log('AllOrigins 프록시 실패:', error.message);
        }
        
        // 4. Proxy API 시도 
        try {
            console.log('4️⃣ Proxy API 시도...');
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Proxy API 성공!', data);
                if (data.mealServiceDietInfo) {
                    return data;
                }
            }
        } catch (error) {
            console.log('Proxy API 실패:', error.message);
        }
        
        throw new Error('모든 API 호출 방법이 실패했습니다');
    }
    
    displayMealCard(data) {
        const container = document.getElementById('headerMealCard');
        
        console.log('displayMealCard 호출:', {
            data: data,
            hasMealInfo: !!data.mealServiceDietInfo,
            currentMealType: this.currentMealType
        });
        
        if (!data.mealServiceDietInfo) {
            console.log('급식 정보 없음 - API 응답에 mealServiceDietInfo가 없음');
            this.showNoMealMessage();
            return;
        }
        
        const meals = data.mealServiceDietInfo[1].row;
        console.log('전체 급식 목록:', meals);
        console.log('찾고 있는 급식 타입:', this.currentMealType);
        
        // API에서 한글 이름으로 오는 경우 처리
        const targetMealCode = this.currentMealType;
        const targetMealName = this.getMealTypeName(targetMealCode);
        
        console.log('급식 찾기:', {
            찾는코드: targetMealCode,
            찾는이름: targetMealName,
            API데이터: meals.map(m => ({ 코드: m.MMEAL_SC_NM, 타입: typeof m.MMEAL_SC_NM }))
        });
        
        const targetMeal = meals.find(meal => {
            const mealCode = String(meal.MMEAL_SC_NM);
            // 숫자 코드로 비교
            if (mealCode === targetMealCode) return true;
            // 한글 이름으로 비교
            if (mealCode === targetMealName) return true;
            // 역변환해서 비교
            const convertedCode = this.convertMealNameToCode(mealCode);
            if (convertedCode === targetMealCode) return true;
            return false;
        });
        
        if (!targetMeal) {
            console.log('🚫 해당 급식 타입을 찾을 수 없음');
            console.log('사용 가능한 급식 타입들:', meals.map(m => m.MMEAL_SC_NM));
            
            // 현재 찾고 있는 타입에 맞는 급식이 있는지 다시 한번 확인
            const wantedMealName = this.getMealTypeName(this.currentMealType);
            const matchingMeal = meals.find(meal => 
                String(meal.MMEAL_SC_NM) === wantedMealName || 
                String(meal.MMEAL_SC_NM) === this.currentMealType
            );
            
            if (matchingMeal) {
                console.log('✅ 매칭되는 급식을 찾았습니다!', matchingMeal);
                this.displayFoundMeal(matchingMeal);
                return;
            }
            
            // 요청한 급식 타입이 없으면 샘플 데이터로 대체
            console.log('❌ 요청한 급식 타입이 없습니다. 샘플 데이터로 대체합니다.');
            this.showSampleMeal();
            return;
        }
        
        console.log('정확한 급식을 찾았습니다:', targetMeal);
        this.displayFoundMeal(targetMeal);
    }
    
    displayFoundMeal(targetMeal) {
        const container = document.getElementById('headerMealCard');
        
        // currentMealType을 우선 사용 (사용자가 선택한 타입)
        const displayMealType = this.getMealTypeName(this.currentMealType);
        const cardClass = this.getMealCardClass(this.currentMealType);
        
        const menuItems = targetMeal.DDISH_NM
            .replace(/<br\/>/g, '\n')
            .replace(/<[^>]*>/g, '')
            .split('\n')
            .filter(item => item.trim());
        
        const dateStr = this.getDateString();
        
        container.innerHTML = `
            <div class="header-meal-content ${cardClass}">
                <div class="meal-header-title">
                    <i class="fas fa-utensils"></i>
                    <span>${dateStr} ${displayMealType}</span>
                </div>
                <div class="meal-menu-list">
                    ${menuItems.slice(0, 6).map(item => `<div class="menu-item">${item}</div>`).join('')}
                    ${menuItems.length > 6 ? `<div class="menu-more">+${menuItems.length - 6}개 더</div>` : ''}
                </div>
            </div>
        `;
    }
    
    showSampleMeal() {
        const container = document.getElementById('headerMealCard');
        const mealType = this.currentMealType;
        const dateStr = this.getDateString();
        
        console.log('🍽️ 샘플 데이터 표시:', {
            currentMealType: mealType,
            mealName: this.getMealTypeName(mealType),
            dateStr: dateStr
        });
        
        let cardClass, mealName, menuItems;
        
        if (mealType === '1') { // 조식
            cardClass = 'breakfast-card';
            mealName = '조식';
            menuItems = `
                <div class="menu-item">토스트</div>
                <div class="menu-item">계란후라이</div>
                <div class="menu-item">베이컨</div>
                <div class="menu-item">샐러드</div>
                <div class="menu-item">우유</div>
                <div class="menu-item">오렌지주스</div>
            `;
        } else if (mealType === '2') { // 중식
            cardClass = 'lunch-card';
            mealName = '중식';
            menuItems = `
                <div class="menu-item">친환경쌀밥</div>
                <div class="menu-item">맑은미역국</div>
                <div class="menu-item">돈까스</div>
                <div class="menu-item">깍두기</div>
                <div class="menu-item">우유</div>
                <div class="menu-item">사과</div>
            `;
        } else { // 석식
            cardClass = 'dinner-card';
            mealName = '석식';
            menuItems = `
                <div class="menu-item">친환경현미밥</div>
                <div class="menu-item">김치찌개</div>
                <div class="menu-item">제육볶음</div>
                <div class="menu-item">콩나물무침</div>
                <div class="menu-item">배추김치</div>
                <div class="menu-item">요구르트</div>
            `;
        }
        
        container.innerHTML = `
            <div class="header-meal-content ${cardClass}">
                <div class="meal-header-title">
                    <i class="fas fa-utensils"></i>
                    <span>${dateStr} ${mealName}</span>
                </div>
                <div class="meal-menu-list">
                    ${menuItems}
                </div>
            </div>
        `;
    }
    
    showNoMealMessage() {
        const container = document.getElementById('headerMealCard');
        const dateStr = this.getDateString();
        const mealType = this.getMealTypeName(this.currentMealType);
        
        console.log('🚫 급식 정보 없음 표시:', {
            currentMealType: this.currentMealType,
            displayMealType: mealType
        });
        
        container.innerHTML = `
            <div class="header-meal-content no-meal">
                <div class="meal-header-title">
                    <i class="fas fa-calendar-times"></i>
                    <span>${dateStr} ${mealType}</span>
                </div>
                <div class="no-meal-text">
                    <p>급식 정보가 없습니다</p>
                </div>
            </div>
        `;
    }
    
    getMealTypeName(code) {
        const mealTypes = {
            '1': '조식',
            '2': '중식', 
            '3': '석식',
            1: '조식',
            2: '중식',
            3: '석식'
        };
        console.log('getMealTypeName 호출:', { code: code, type: typeof code, result: mealTypes[code] });
        return mealTypes[code] || mealTypes[String(code)] || '중식';
    }
    
    convertMealNameToCode(name) {
        const nameToCode = {
            '조식': '1',
            '중식': '2',
            '석식': '3'
        };
        return nameToCode[name] || name;
    }
    
    getMealTime(code) {
        const mealTimes = {
            '1': '아침',
            '2': '점심',
            '3': '저녁'
        };
        return mealTimes[code] || '식사';
    }
    
    getMealCardClass(code) {
        const cardClasses = {
            '1': 'breakfast-card',
            '2': 'lunch-card',
            '3': 'dinner-card',
            1: 'breakfast-card',
            2: 'lunch-card',
            3: 'dinner-card'
        };
        return cardClasses[code] || cardClasses[String(code)] || 'lunch-card';
    }
}

// 급식 정보 로드
async function loadSchoolMealInfo(date = new Date()) {
    const mealMenu = document.getElementById('mealMenu');
    if (!mealMenu) return;
    
    // 날짜 포맷팅 (YYYYMMDD)
    const dateStr = formatDateForAPI(date);
    
    // 로딩 상태 표시
    mealMenu.innerHTML = `
        <div class="meal-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>급식 정보를 불러오는 중...</span>
        </div>
    `;
    
    try {
        // API 호출 시도
        const mealData = await fetchMealFromAPI(dateStr);
        
        if (mealData && mealData.length > 0) {
            displayMealData(mealData);
        } else {
            // API 실패 시 모의 데이터 사용
            loadMockMealData(date);
        }
    } catch (error) {
        console.error('급식 API 호출 실패:', error);
        loadMockMealData(date);
    }
}

// 나이스 급식 API 호출
async function fetchMealFromAPI(dateStr) {
    const apiUrl = `${MEAL_API_CONFIG.BASE_URL}/mealServiceDietInfo`;
    const params = new URLSearchParams({
        KEY: MEAL_API_CONFIG.API_KEY,
        Type: 'json',
        pIndex: 1,
        pSize: 100,
        ATPT_OFCDC_SC_CODE: MEAL_API_CONFIG.OFFICE_CODE,
        SD_SCHUL_CODE: MEAL_API_CONFIG.SCHOOL_CODE,
        MLSV_YMD: dateStr
    });
    
    const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
        return data.mealServiceDietInfo[1].row;
    }
    
    return null;
}

// 모의 급식 데이터 로드
function loadMockMealData(date) {
    const dayOfWeek = date.getDay();
    const mockMeals = getMockMealByDay(dayOfWeek);
    
    setTimeout(() => {
        displayMealData(mockMeals);
    }, 1000);
}

// 요일별 모의 급식 데이터 생성
function getMockMealByDay(dayOfWeek) {
    const mealMenus = {
        0: [], // 일요일 - 급식 없음
        1: [ // 월요일
            {
                MLSV_FROM_YMD: formatDateForAPI(new Date()),
                MMEAL_SC_NM: '중식',
                DDISH_NM: '김치찌개*1.5.9.13|백미밥|돈까스/소스*1.2.5.6.10.12.13.15.16.18|콩나물무침*5.13|깍두기*9.13|사과'
            }
        ],
        2: [ // 화요일
            {
                MLSV_FROM_YMD: formatDateForAPI(new Date()),
                MMEAL_SC_NM: '중식',
                DDISH_NM: '된장찌개*5.6.13|백미밥|불고기*5.6.10.13.18|시금치나물*5.6.13|김치*9.13|딸기우유*2'
            }
        ],
        3: [ // 수요일
            {
                MLSV_FROM_YMD: formatDateForAPI(new Date()),
                MMEAL_SC_NM: '중식',
                DDISH_NM: '미역국*5.6.13|백미밥|닭다리구이*5.6.13.15.18|마카로니샐러드*1.5.13|배추김치*9.13|바나나'
            }
        ],
        4: [ // 목요일
            {
                MLSV_FROM_YMD: formatDateForAPI(new Date()),
                MMEAL_SC_NM: '중식',
                DDISH_NM: '순두부찌개*1.5.9.13|백미밥|제육볶음*5.6.10.13.18|고사리나물*5.6.13|김치*9.13|요구르트*2'
            }
        ],
        5: [ // 금요일
            {
                MLSV_FROM_YMD: formatDateForAPI(new Date()),
                MMEAL_SC_NM: '중식',
                DDISH_NM: '잔치국수*1.5.6.13.18|백미밥|양념치킨*1.5.6.12.13.15.18|오이소박이*9.13|김치*9.13|초코우유*2'
            }
        ],
        6: [] // 토요일 - 급식 없음
    };
    
    return mealMenus[dayOfWeek] || [];
}

// 급식 데이터 표시
function displayMealData(mealData) {
    const mealMenu = document.getElementById('mealMenu');
    if (!mealMenu) return;
    
    if (!mealData || mealData.length === 0) {
        mealMenu.innerHTML = `
            <div class="no-meal">
                <i class="fas fa-calendar-times"></i>
                <p>오늘은 급식이 없습니다.</p>
                <small>주말이나 공휴일에는 급식이 제공되지 않습니다.</small>
            </div>
        `;
        return;
    }
    
    // 급식 메뉴 파싱 및 표시
    const meal = mealData[0]; // 첫 번째 급식 정보 사용
    const dishNames = meal.DDISH_NM ? meal.DDISH_NM.split('|') : [];
    const cleanedDishes = dishNames.map(dish => cleanDishName(dish));
    
    const mealHTML = `
        <div class="meal-items">
            ${cleanedDishes.map((dish, index) => `
                <div class="meal-item" style="animation-delay: ${index * 0.1}s">
                    ${dish}
                </div>
            `).join('')}
        </div>
        <div class="meal-info">
            <div class="meal-type">
                <i class="fas fa-clock"></i>
                <span>${meal.MMEAL_SC_NM || '중식'}</span>
            </div>
            <div class="meal-date">
                <i class="fas fa-calendar"></i>
                <span>${formatMealDate(meal.MLSV_FROM_YMD)}</span>
            </div>
        </div>
    `;
    
    mealMenu.innerHTML = mealHTML;
    
    // 영양 정보 업데이트 (추정값)
    updateNutritionInfo(cleanedDishes);
}

// 급식명 정리 (알레르기 정보 제거)
function cleanDishName(dishName) {
    if (!dishName) return '';
    
    // 알레르기 정보 패턴 제거 (*숫자.숫자.숫자...)
    return dishName.replace(/\*[\d.]+/g, '').trim();
}

// 급식 날짜 포맷팅
function formatMealDate(dateStr) {
    if (!dateStr) return '';
    
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

// API용 날짜 포맷팅 (YYYYMMDD)
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// 영양 정보 업데이트 (추정치)
function updateNutritionInfo(dishes) {
    // 간단한 추정 로직 (실제로는 더 정교한 계산 필요)
    const estimatedCalories = Math.floor(Math.random() * 200) + 550; // 550-750 kcal
    const estimatedProtein = Math.floor(Math.random() * 15) + 20; // 20-35g
    const estimatedCarbs = Math.floor(Math.random() * 30) + 70; // 70-100g
    const estimatedFat = Math.floor(Math.random() * 10) + 15; // 15-25g
    
    // 영양 정보 표시 업데이트
    const nutritionItems = document.querySelectorAll('.nutrition-value');
    if (nutritionItems.length >= 2) {
        nutritionItems[0].textContent = `${estimatedCalories} kcal`;
        nutritionItems[1].textContent = `${estimatedProtein}g`;
    }
    
    // 추가 영양 정보가 있다면 업데이트
    if (nutritionItems.length >= 4) {
        nutritionItems[2].textContent = `${estimatedCarbs}g`;
        nutritionItems[3].textContent = `${estimatedFat}g`;
    }
}

// 급식 정보 새로고침
function refreshMealInfo() {
    loadSchoolMealInfo(currentMealDate);
}

// 주간 급식 정보 미리 로드
async function preloadWeeklyMeals() {
    // 개발 환경이 아니면 급식 API 호출 스킵 (CORS 문제)
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.log('📊 급식 정보: CORS 제한으로 인해 스킵됨');
        return;
    }
    
    const today = new Date();
    const promises = [];
    
    // 이번 주 급식 정보 미리 로드
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        if (date.getDay() !== 0 && date.getDay() !== 6) { // 주말 제외
            promises.push(fetchMealFromAPI(formatDateForAPI(date)));
        }
    }
    
    try {
        const weeklyMeals = await Promise.all(promises);
        console.log('주간 급식 정보 로드 완료:', weeklyMeals);
        // 캐시에 저장 (localStorage 등 활용)
        localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals));
    } catch (error) {
        console.warn('⚠️ 급식 API 접근 제한 (CORS):', error.message);
    }
}

// 알레르기 정보 표시
function displayAllergyInfo(dishName) {
    const allergyPattern = /\*([\d.]+)/g;
    const allergyMatches = dishName.match(allergyPattern);
    
    if (!allergyMatches) return '';
    
    const allergyNumbers = allergyMatches[0].replace('*', '').split('.');
    const allergyNames = {
        '1': '난류', '2': '우유', '3': '메밀', '4': '땅콩', '5': '대두',
        '6': '밀', '7': '고등어', '8': '게', '9': '새우', '10': '돼지고기',
        '11': '복숭아', '12': '토마토', '13': '아황산류', '14': '호두',
        '15': '닭고기', '16': '쇠고기', '17': '오징어', '18': '조개류'
    };
    
    const allergies = allergyNumbers
        .filter(num => allergyNames[num])
        .map(num => allergyNames[num]);
    
    return allergies.length > 0 ? ` (알레르기: ${allergies.join(', ')})` : '';
}

// 급식 평점 시스템 (추후 구현)
function rateMeal(rating, date) {
    console.log(`${date} 급식 평점: ${rating}/5`);
    // 실제 구현에서는 서버에 평점 데이터 전송
}

// 급식 사진 업로드 (관리자용)
function uploadMealPhoto(file, date) {
    console.log(`${date} 급식 사진 업로드:`, file.name);
    // 실제 구현에서는 서버에 이미지 업로드
}

// 특별식단 알림 (알레르기, 종교 등)
function checkSpecialDietAlerts(dishes, userPreferences) {
    const alerts = [];
    
    dishes.forEach(dish => {
        if (userPreferences.allergies) {
            userPreferences.allergies.forEach(allergy => {
                if (dish.includes(allergy)) {
                    alerts.push(`알레르기 주의: ${dish}에 ${allergy} 포함`);
                }
            });
        }
        
        if (userPreferences.religion === 'muslim' && 
            (dish.includes('돼지') || dish.includes('소주'))) {
            alerts.push(`할랄 주의: ${dish}`);
        }
    });
    
    return alerts;
}

// 급식 통계 (월별, 주별)
function getMealStatistics(period = 'month') {
    // 실제 구현에서는 서버에서 통계 데이터 가져옴
    return {
        averageCalories: 645,
        favoriteMenu: '김치찌개',
        healthyDays: 18,
        totalMeals: 20
    };
}

// 메인 급식 로드 함수 (app.js에서 호출)
function loadMealInfo() {
    loadSchoolMealInfo(currentMealDate);
}

// 페이지 로드 시 주간 급식 정보 미리 로드
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        preloadWeeklyMeals();
    }, 2000);
});

// CSS 스타일 추가
const mealStyles = `
    .no-meal {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
    }
    
    .no-meal i {
        font-size: 3rem;
        color: #95a5a6;
        margin-bottom: 1rem;
    }
    
    .no-meal small {
        display: block;
        margin-top: 0.5rem;
        color: #999;
    }
    
    .meal-items {
        display: grid;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    
    .meal-item {
        padding: 0.75rem 1rem;
        background: white;
        border-radius: 8px;
        border-left: 3px solid #667eea;
        font-weight: 500;
        opacity: 0;
        animation: slideInUp 0.5s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .meal-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    
    .meal-type, .meal-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 0.9rem;
    }
    
    .meal-type i, .meal-date i {
        color: #667eea;
    }
    
    @media (max-width: 480px) {
        .meal-info {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
        }
    }
`;

// 스타일 추가
const mealStyleSheet = document.createElement('style');
mealStyleSheet.textContent = mealStyles;
document.head.appendChild(mealStyleSheet);