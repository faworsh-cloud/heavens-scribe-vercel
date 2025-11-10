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

            <h4>🚀 시작하기: 데이터 관리</h4>
            <ol>
                <li><strong>데이터 가져오기:</strong> 앱을 처음 사용하신다면, 헤더(상단 바)의 '전체 데이터 가져오기' 버튼을 클릭하여 템플릿 엑셀 파일을 기반으로 데이터를 가져올 수 있습니다. 설정에서 템플릿 파일을 다운로드할 수 있습니다.</li>
                <li><strong>데이터 업데이트:</strong> 엑셀 파일을 가져온 후, 앱에서 내용을 수정하면 헤더에 '파일 업데이트 (Ctrl+S)' 버튼이 활성화됩니다. 이 버튼이나 단축키(Ctrl+S)를 사용해 변경사항을 기존 엑셀 파일에 덮어쓸 수 있습니다.</li>
                <li><strong>데이터 내보내기:</strong> 설정 메뉴에서 현재 앱의 모든 데이터를 새로운 엑셀 파일로 내보낼 수 있습니다.</li>
            </ol>
            
            <h4>✨ 주요 기능</h4>
            <ul>
                <li>
                    <strong>키워드 모드:</strong> 주제별로 자료를 정리합니다. 왼쪽 목록에서 키워드를 추가하거나 선택하고, 오른쪽에서 관련 서적 인용문이나 메모를 추가, 수정, 삭제할 수 있습니다. 키워드 목록 상단의 검색창을 통해 키워드 이름이나 자료 내용으로 빠르게 검색할 수 있습니다.
                </li>
                <li>
                    <strong>성경 모드:</strong> 성경 본문별로 자료를 정리합니다. 왼쪽 목록에서 성경 책과 장을 선택하고, 오른쪽에서 특정 구절에 대한 주석이나 참고 자료를 추가할 수 있습니다. '새 자료 추가' 섹션에 '장:절' (예: 1:15-17) 형식으로 입력하여 자료를 추가하세요.
                </li>
                <li>
                    <strong>설교 모드:</strong> 개인 설교문이나 참고할 만한 타인 설교를 관리합니다. 설교 목록에서 설교를 선택하여 내용을 확인하고, '새 설교 추가' 버튼으로 새로운 설교문을 작성할 수 있습니다.
                </li>
                <li>
                    <strong>HWP 자료 변환:</strong> '아래아 한글(HWP)' 등에서 복사한 텍스트를 앱의 데이터 형식으로 자동 변환하는 강력한 AI 기능입니다. 변환할 자료 유형(키워드, 성경, 설교)을 선택하고 내용을 붙여넣은 후 '변환하기' 버튼을 누르세요. 변환 결과를 미리보고 수정하여 앱에 추가할 수 있습니다.
                </li>
            </ul>

            <h4>☁️ Google Drive 동기화</h4>
            <p>
                설정 메뉴에서 Google API 키와 클라이언트 ID를 등록하면, 데이터를 Google Drive에 안전하게 백업하고 여러 기기에서 동기화할 수 있습니다. 자세한 발급 방법은 설정의 '발급 방법 안내'를 참고하세요.
            </p>

            <h4>⚙️ 기타 설정</h4>
            <ul>
                <li><strong>화면:</strong> 앱 전체의 글자 크기를 조절하거나, 성경 모드에서 책 이름을 약어로 표시할 수 있습니다.</li>
                <li><strong>보안:</strong> PIN을 설정하여 앱 실행 시 잠금을 설정할 수 있습니다.</li>
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
