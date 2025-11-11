import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface GoogleApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleApiGuideModal: React.FC<GoogleApiGuideModalProps> = ({ isOpen, onClose }) => {
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setOrigin(window.location.origin);
        }
    }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">Google API 키 및 클라이언트 ID 발급 안내</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p>
                Google Drive 동기화 기능을 사용하려면 Google Cloud에서 <strong>API 키</strong>와 <strong>OAuth 2.0 클라이언트 ID</strong>를 발급받아 설정에 입력해야 합니다.
                과정이 복잡해 보일 수 있지만, 아래 단계를 차근차근 따라하면 누구나 설정할 수 있습니다.
            </p>

            <h4>1단계: Google Cloud Console 접속 및 프로젝트 생성</h4>
            <ol>
                <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>에 접속하여 Google 계정으로 로그인합니다.</li>
                <li>화면 상단의 프로젝트 선택 드롭다운(페이지 좌측 상단 Google Cloud 로고 옆)을 클릭하고 '새 프로젝트'를 선택합니다.</li>
                <li>프로젝트 이름을 'Heaven's scribe' 등으로 지정하고 '만들기'를 클릭합니다.</li>
            </ol>

            <h4>2단계: Google Drive API 활성화</h4>
            <ol>
                <li>방금 만든 프로젝트가 선택된 상태인지 확인합니다.</li>
                <li>왼쪽 탐색 메뉴에서 'API 및 서비스' &gt; '라이브러리'로 이동합니다.</li>
                <li>검색창에 'Google Drive API'를 검색하고 결과에서 선택합니다.</li>
                <li>'사용 설정' 버튼을 클릭하여 API를 활성화합니다.</li>
            </ol>

            <h4>3단계: API 키 생성</h4>
            <ol>
                <li>왼쪽 메뉴에서 'API 및 서비스' &gt; '사용자 인증 정보'로 이동합니다.</li>
                <li>화면 상단의 '+ 사용자 인증 정보 만들기'를 클릭하고 'API 키'를 선택합니다.</li>
                <li>API 키가 생성되면 표시되는 '내 API 키' 값을 복사하여 앱 설정의 'API 키' 필드에 붙여넣습니다. <strong>이 창을 아직 닫지 마세요.</strong></li>
                <li>보안 강화를 위해, 생성된 키 목록에서 방금 만든 API 키를 클릭하여 수정 화면으로 들어갑니다.</li>
                <li>'애플리케이션 제한사항'에서 '웹사이트'를 선택합니다.</li>
                <li>'웹사이트 제한사항' 섹션에서 '+ 항목 추가'를 클릭하고, 다음 값을 입력 후 '완료'를 누릅니다:
                    <br />
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600">{origin}</code>
                </li>
                 <li>'저장' 버튼을 클릭합니다.</li>
            </ol>

            <h4>4단계: OAuth 2.0 클라이언트 ID 생성</h4>
            <ol>
                <li>먼저 OAuth 동의 화면을 설정해야 합니다. 왼쪽 메뉴에서 'OAuth 동의 화면'으로 이동합니다.</li>
                <li>'User Type'은 '외부'를 선택하고 '만들기'를 클릭합니다.</li>
                <li>다음 정보를 입력합니다:
                    <ul>
                        <li><strong>앱 이름:</strong> Heaven's scribe (또는 원하는 이름)</li>
                        <li><strong>사용자 지원 이메일:</strong> 본인의 이메일 주소 선택</li>
                        <li><strong>개발자 연락처 정보:</strong> 본인의 이메일 주소 입력</li>
                    </ul>
                    하단의 '저장 후 계속'을 클릭합니다.
                </li>
                <li>'범위' 단계는 아무것도 추가하지 않고 '저장 후 계속'을 클릭합니다.</li>
                <li>'테스트 사용자' 단계에서 '+ ADD USERS'를 클릭하여 <strong>본인의 Google 계정 이메일</strong>을 추가하고 '추가' 버튼을 누릅니다. 그 후 '저장 후 계속'을 클릭합니다.</li>
                <li>요약 화면에서 내용을 확인하고 '대시보드로 돌아가기'를 클릭합니다.</li>
                <li>이제 클라이언트 ID를 생성합니다. 왼쪽 메뉴에서 '사용자 인증 정보'로 다시 이동합니다.</li>
                <li>'+ 사용자 인증 정보 만들기' &gt; 'OAuth 클라이언트 ID'를 선택합니다.</li>
                <li>다음 정보를 입력/선택합니다:
                    <ul>
                        <li><strong>애플리케이션 유형:</strong> 웹 애플리케이션</li>
                        <li><strong>이름:</strong> Heaven's scribe Web Client (또는 원하는 이름)</li>
                        <li><strong>승인된 자바스크립트 원본:</strong> '+ URI 추가'를 클릭하고 다음 값을 입력합니다:
                            <br/>
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600">{origin}</code>
                        </li>
                    </ul>
                </li>
                <li>'만들기' 버튼을 클릭합니다.</li>
                <li>생성된 '클라이언트 ID' 값을 복사하여 앱 설정의 '클라이언트 ID' 필드에 붙여넣습니다.</li>
            </ol>

            <h4>5단계: 설정 완료</h4>
            <p>
                두 값을 모두 설정에 입력한 후, 설정 창을 닫고 'Google Drive에 연결' 버튼을 클릭하여 로그인을 시도하면 동기화 기능이 활성화됩니다.
            </p>
        </div>
        <div className="mt-6 flex justify-end flex-shrink-0">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                닫기
            </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleApiGuideModal;