// Netlify CMS 데이터 로더
class CMSLoader {
    constructor() {
        this.notices = [];
    }

    // 마크다운 파일의 Front Matter 파싱
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (!match) {
            return { data: {}, content: content };
        }

        const frontMatter = match[1];
        const body = match[2];
        const data = {};

        // YAML 형식 파싱 (간단한 버전)
        frontMatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                // 따옴표 제거
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                
                data[key] = value;
            }
        });

        return { data, content: body };
    }

    // 공지사항 로드
    async loadNotices() {
        try {
            // GitHub Pages에서는 디렉토리 목록을 가져올 수 없으므로
            // 미리 정의된 파일 목록 사용 또는 notices.json 파일 사용
            const noticeFiles = [
                '2024-10-01-welcome.md',
                '2024-10-01-calendar-sync.md'
            ];

            const notices = [];

            for (const fileName of noticeFiles) {
                try {
                    const response = await fetch(`/_notices/${fileName}`);
                    if (response.ok) {
                        const content = await response.text();
                        const { data, content: body } = this.parseFrontMatter(content);
                        
                        notices.push({
                            id: fileName.replace('.md', ''),
                            title: data.title || '제목 없음',
                            content: data.content || body,
                            priority: data.priority || 'medium',
                            author: data.author || '관리자',
                            date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
                            displayStartDate: data.displayStartDate || data.date?.split('T')[0] || new Date().toISOString().split('T')[0],
                            displayEndDate: data.displayEndDate || data.date?.split('T')[0] || new Date().toISOString().split('T')[0]
                        });
                    }
                } catch (error) {
                    console.warn(`공지사항 파일 로드 실패: ${fileName}`, error);
                }
            }

            this.notices = notices;
            return notices;
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            // 로컬스토리지 백업 사용
            return this.loadNoticesFromLocalStorage();
        }
    }

    // 로컬스토리지에서 공지사항 로드 (백업)
    loadNoticesFromLocalStorage() {
        const stored = localStorage.getItem('schoolNotices');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error('로컬스토리지 파싱 오류:', error);
            }
        }
        
        // 기본 공지사항 반환
        return this.getDefaultNotices();
    }

    // 기본 공지사항
    getDefaultNotices() {
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
            },
            {
                id: 'default-2',
                title: "학사일정은 구글캘린더와 실시간 연동됩니다",
                content: "구글캘린더에 등록된 일정이 자동으로 표시됩니다.",
                priority: "medium",
                date: today,
                author: "시스템",
                displayStartDate: today,
                displayEndDate: endDate
            }
        ];
    }

    // 활성 공지사항 필터링
    getActiveNotices(notices = null) {
        const allNotices = notices || this.notices;
        const today = new Date().toISOString().split('T')[0];

        return allNotices.filter(notice => {
            const startDate = notice.displayStartDate || notice.date;
            const endDate = notice.displayEndDate || notice.date;
            return today >= startDate && today <= endDate;
        }).sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
}

// 전역 CMS 로더 인스턴스
window.cmsLoader = new CMSLoader();