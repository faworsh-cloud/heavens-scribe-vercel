import React from 'react';
import { XMarkIcon } from './icons';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">Heaven's Scribe 사용 설명서</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p>
                Heaven's Scribe에 오신 것을 환영합니다! 이 앱은 설교 준비를 위한 자료들을 효율적으로 관리할 수 있도록 돕습니다.
            </p>

            <h4>🚀 시작하기: 데이터 관리 (엑셀 중심 워크플로우)</h4>
            <p>
                이 앱은 <strong>엑셀 파일을 데이터의 원본(Source of Truth)으로 사용</strong>하는 것을 중심으로 설계되었습니다.
            </p>
            <ol>
                <li><strong>템플릿 준비:</strong> [설정] &gt; [데이터 관리]에서 '템플릿 파일 다운로드'를 클릭하여 양식을 받거나, 양식에 맞는 엑셀 파일을 준비합니다.</li>
                <li><strong>데이터 가져오기:</strong> 앱 상단의 '전체 데이터 가져오기' 버튼을 클릭하여 준비한 엑셀 파일을 불러옵니다. 파일의 모든 내용이 앱으로 로드됩니다.</li>
                <li><strong>앱에서 작업:</strong> 키워드, 성경, 설교 모드에서 자유롭게 자료를 추가, 수정, 삭제합니다.</li>
                <li><strong>파일 업데이트 (저장):</strong> 내용이 변경되면 상단에 '파일 업데이트 (Ctrl+S)' 버튼이 나타납니다. 이 버튼을 누르거나 단축키(Ctrl+S)를 사용하면, 현재 앱의 모든 데이터가 <strong>기존에 불러왔던 파일의 내용에 덮어씌워진 새로운 파일</strong>로 다운로드됩니다. (기존 파일은 그대로 보존됩니다.) 이것이 이 앱의 핵심적인 '저장' 방식입니다.</li>
            </ol>
            
            <h4>✨ 주요 기능</h4>
            <ul>
                <li>
                    <strong>키워드 모드:</strong> 주제별로 자료를 정리합니다. 왼쪽 목록에서 키워드를 추가/선택하고, 오른쪽에서 관련 서적 인용문이나 메모를 관리할 수 있습니다. 키워드 목록 상단의 검색창으로 키워드 이름이나 자료 내용을 빠르게 찾을 수 있습니다.
                </li>
                <li>
                    <strong>성경 모드:</strong> 성경 본문별로 자료를 정리합니다. 왼쪽 목록에서 성경 책과 장을 선택하고, 오른쪽에서 특정 구절에 대한 주석이나 참고 자료를 추가할 수 있습니다. '새 자료 추가' 섹션에 '장:절' (예: 1:15-17) 형식으로 입력하여 자료를 추가하세요.
                </li>
                <li>
                    <strong>설교 모드:</strong> 개인 설교문이나 참고할 만한 타인 설교를 관리합니다. 설교 목록에서 설교를 선택하여 내용을 확인하고, '새 설교 추가' 버튼으로 새로운 설교문을 작성할 수 있습니다.
                </li>
                <li>
                    <strong>HWP 자료 변환 (AI 기능):</strong> '아래아 한글(HWP)' 등에서 복사한 텍스트를 앱의 데이터 형식으로 자동 변환합니다. 변환할 자료 유형(키워드, 성경, 설교)을 선택하고 내용을 붙여넣으세요. 변환 결과를 미리보고 수정하여 앱에 바로 추가하거나 별도의 엑셀 파일로 다운로드할 수 있습니다. <strong>(이 기능은 설정에서 활성화하고 Gemini API 키를 등록해야 사용 가능합니다.)</strong>
                </li>
            </ul>

            <h4>☁️ Google Drive 동기화 (실시간 백업)</h4>
            <p>
                엑셀 파일 관리와는 <strong>별개의 기능</strong>으로, 데이터를 Google Drive에 실시간으로 백업하고 여러 기기에서 동기화할 수 있습니다. 엑셀 파일을 수동으로 옮기지 않고도 다른 컴퓨터나 브라우저에서 작업을 이어갈 수 있어 편리합니다.
            </p>
            <p>
                이 기능을 사용하려면 설정 메뉴에서 Google API 키와 클라이언트 ID를 등록해야 합니다. 자세한 발급 방법은 설정의 '발급 방법 안내'를 참고하세요.
            </p>

            <h4>⚙️ 기타 설정</h4>
            <ul>
                <li><strong>화면:</strong> 앱 전체의 글자 크기를 조절하거나, 성경 모드에서 책 이름을 약어로 표시할 수 있습니다.</li>
                <li><strong>보안:</strong> PIN을 설정하여 앱 실행 시 잠금을 설정할 수 있습니다.</li>
                <li><strong>API 설정:</strong> Google Drive 동기화 및 HWP 변환(Gemini)에 필요한 API 키를 관리합니다.</li>
            </ul>
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

export default UserGuideModal;
