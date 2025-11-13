import React from 'react';
import { XMarkIcon } from './icons';

interface GoogleApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleApiGuideModal: React.FC<GoogleApiGuideModalProps> = ({ isOpen, onClose }) => {
    const origin = 'https://heavens-scribe-vercel.vercel.app';

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">Google Drive 동기화 설정 안내</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p className="lead">
                Google Drive 동기화는 데이터를 안전하게 백업하고 여러 기기에서 접근할 수 있는 강력한 기능입니다.
                이 기능을 사용하려면, Google에 이 앱이 사용자의 Drive 파일에 접근해도 된다는 허락을 받아야 합니다.
                아래 안내에 따라 두 가지 종류의 <strong>'인증 코드' (API 키, OAuth 클라이언트 ID)</strong>를 발급받아 설정에 입력해주세요.
                과정이 조금 길지만, 차근차근 따라하시면 누구나 쉽게 설정할 수 있습니다.
            </p>
            
            <div className="not-prose my-4 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-sans">
                    <strong className="font-bold">🤔 왜 이 과정이 필요한가요?</strong>
                    <br/>
                    Google은 보안을 매우 중요하게 생각합니다. 이 앱이 Google Play 스토어에 공식적으로 등록된 앱이 아니기 때문에, 사용자는 '자신이 개발한 앱'이 '자신의 파일'에 접근하는 것을 허용한다는 의미로 직접 이 인증 절차를 거쳐야 합니다. 이 과정은 Google에 <strong>"이 앱은 내가 신뢰하며, 내 Drive 파일에 접근해도 좋습니다"</strong>라고 알려주는 것과 같습니다. 사용자의 데이터는 오직 사용자의 Google Drive 계정에만 저장됩니다.
                </p>
            </div>

            <h4>1단계: Google Cloud 프로젝트 만들기 (작업 공간 생성)</h4>
            <ol>
                <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud 웹사이트</a>에 접속하여 Google 계정으로 로그인합니다.</li>
                <li>화면 왼쪽 위에 있는 <strong>[프로젝트 선택]</strong> 드롭다운 (Google Cloud 로고 옆)을 클릭하고, <strong>[새 프로젝트]</strong>를 선택합니다.</li>
                <li>프로젝트 이름을 <code>My Sermon Notes</code> 와 같이 알기 쉽게 입력하고 <strong>[만들기]</strong> 버튼을 클릭합니다.</li>
            </ol>

            <h4>2단계: Google Drive 기능 켜기</h4>
            <ol>
                <li>방금 만든 프로젝트가 선택되었는지 확인합니다. (화면 상단에서 프로젝트 이름 확인)</li>
                <li>왼쪽 메뉴에서 <strong>[API 및 서비스]</strong> &gt; <strong>[라이브러리]</strong>로 이동합니다. (메뉴가 안 보이면 왼쪽 위 햄버거 메뉴(☰)를 클릭하세요.)</li>
                <li>검색창에 <code>Google Drive API</code>를 검색하고 결과에서 선택합니다.</li>
                <li><strong>[사용 설정]</strong> 버튼을 클릭하여 이 앱이 Google Drive와 통신할 수 있도록 허용합니다.</li>
            </ol>

            <h4>3단계: 첫 번째 인증 코드 (API 키) 만들기</h4>
            <ol>
                <li>왼쪽 메뉴에서 <strong>[API 및 서비스]</strong> &gt; <strong>[사용자 인증 정보]</strong>로 이동합니다.</li>
                <li>화면 상단의 <strong>[+ 사용자 인증 정보 만들기]</strong>를 클릭하고 <strong>[API 키]</strong>를 선택합니다.</li>
                <li>API 키가 생성되면 팝업창에 표시된 키 옆의 복사 아이콘을 눌러 복사한 뒤, <strong>이 앱의 설정 창에 있는 'API 키' 필드에 붙여넣습니다.</strong> 팝업창은 '닫기'를 눌러 닫습니다.</li>
                <li>이제 방금 만든 API 키를 이 앱에서만 사용할 수 있도록 보안 설정을 합니다. 'API 키' 목록에서 방금 만든 키의 이름을 클릭합니다.</li>
                <li>'애플리케이션 제한사항' 섹션에서 <strong>[웹사이트]</strong>를 선택합니다.</li>
                <li>'웹사이트 제한사항' 아래의 <strong>[+ 항목 추가]</strong> 버튼을 클릭하고, 아래의 주소를 입력합니다. (복사해서 붙여넣으세요)
                    <br />
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600 select-all">{origin}</code>
                </li>
                 <li>페이지 하단의 <strong>[저장]</strong> 버튼을 클릭합니다.</li>
            </ol>

            <h4>4단계: 두 번째 인증 코드 (OAuth 클라이언트 ID) 만들기</h4>
            <p>이 코드는 사용자가 "이 앱이 내 Google Drive를 사용하도록 허락합니다"라고 승인할 때 필요합니다.</p>
            <ol>
                <li><strong>(앱 정보 등록)</strong> 왼쪽 메뉴에서 <strong>[OAuth 동의 화면]</strong>으로 이동합니다.
                    <ul>
                        <li>'User Type'은 <strong>[외부]</strong>를 선택하고 [만들기]를 클릭합니다.</li>
                        <li>'앱 정보' 입력:
                            <ul>
                                <li><strong>앱 이름:</strong> <code>Heaven's Scribe Sync</code> (또는 원하는 이름)</li>
                                <li><strong>사용자 지원 이메일:</strong> 본인의 이메일 주소를 선택합니다.</li>
                                <li><strong>개발자 연락처 정보:</strong> 본인의 이메일 주소를 한 번 더 입력합니다.</li>
                            </ul>
                        </li>
                        <li>페이지 하단의 <strong>[저장 후 계속]</strong>을 클릭합니다. '범위'와 '테스트 사용자' 단계는 변경 없이 <strong>[저장 후 계속]</strong>을 눌러 넘어갑니다.</li>
                        <li>요약 화면에서 <strong>[대시보드로 돌아가기]</strong>를 클릭합니다.</li>
                    </ul>
                </li>
                <li className="font-bold text-red-600 dark:text-red-400"><strong>(가장 중요!)</strong> 이제 다른 사람이 아닌 본인만 사용하도록 제한된 "테스트 모드"를 해제합니다. 'OAuth 동의 화면' 대시보드에서 <strong>[앱 게시]</strong> 버튼을 찾아 클릭하고, 확인 팝업에서 <strong>[확인]</strong>을 누릅니다. '게시 상태'가 '프로덕션'으로 변경됩니다.</li>
                <li><strong>(클라이언트 ID 생성)</strong> 왼쪽 메뉴에서 <strong>[사용자 인증 정보]</strong>로 다시 이동합니다.</li>
                <li><strong>[+ 사용자 인증 정보 만들기]</strong> &gt; <strong>[OAuth 클라이언트 ID]</strong>를 선택합니다.</li>
                <li>아래와 같이 설정합니다:
                    <ul>
                        <li><strong>애플리케이션 유형:</strong> 웹 애플리케이션</li>
                        <li><strong>이름:</strong> <code>Heaven's Scribe Web Client</code> (자동으로 채워지거나 원하는 대로 입력)</li>
                        <li><strong>승인된 자바스크립트 원본:</strong> [+ URI 추가]를 클릭하고 3단계에서 사용했던 아래 주소를 다시 입력합니다.
                            <br/>
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-red-600 select-all">{origin}</code>
                        </li>
                    </ul>
                </li>
                <li><strong>[만들기]</strong> 버튼을 클릭합니다.</li>
                <li>생성된 <strong>'클라이언트 ID'</strong> 값을 복사하여 이 앱의 설정 창에 있는 <strong>'클라이언트 ID' 필드에 붙여넣습니다.</strong></li>
            </ol>

            <h4>5단계: 설정 완료 및 동기화 시작</h4>
            <p>
                두 개의 인증 코드를 모두 앱 설정에 붙여넣고 <strong>[API 정보 저장]</strong> 버튼을 눌렀다면 모든 준비가 끝났습니다.
                <br/>
                설정 창을 닫고, 헤더 또는 설정 창 안에 있는 <strong>[로그인]</strong>이나 <strong>[연결 및 동기화]</strong> 버튼을 눌러 Google 계정으로 로그인하면 동기화가 시작됩니다.
            </p>
            <div className="not-prose my-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-sans">
                    <strong className="font-bold">⚠️ 로그인 오류 해결 방법</strong>
                    <br/>
                    로그인 시 '액세스 권한이 없음(access_denied)' 또는 유사한 오류가 발생한다면, Google Cloud 프로젝트가 '테스트' 모드이기 때문입니다. 이 경우, 개발자에게 <strong>동기화를 사용할 구글 계정 이메일 주소</strong>를 알려주어 테스트 사용자로 등록해야 합니다.
                    <br/>
                    아래 이메일로 연락주세요: <a href="mailto:faworsh@gmail.com" className="font-bold underline">faworsh@gmail.com</a>
                </p>
            </div>
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