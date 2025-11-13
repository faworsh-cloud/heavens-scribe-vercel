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

            <h4>🚀 핵심 개념: 엑셀 파일 중심의 데이터 관리</h4>
            <p>
                이 앱은 <strong>엑셀 파일을 데이터의 원본(Source of Truth)으로 사용</strong>하는 것을 중심으로 설계되었습니다. 모든 자료는 내 컴퓨터의 엑셀 파일에 안전하게 보관되며, 앱은 이 파일을 편집하는 도구 역할을 합니다.
            </p>
            
            <h4>
                <strong>워크플로우 요약:</strong>
                <code className="ml-2 text-xs">① 가져오기 → ② 앱에서 작업 → ③ 저장하기 (새 파일로 내보내기)</code>
            </h4>

            <ol>
                <li>
                    <strong>1. 데이터 가져오기:</strong> 앱 상단의 <code className="text-xs">'전체 데이터 가져오기'</code> 버튼을 클릭하여 템플릿 양식에 맞는 엑셀 파일을 불러옵니다. 파일의 모든 내용이 앱으로 로드됩니다.
                    <br/>
                    <small>* 처음 사용하신다면 [설정] &gt; [데이터 관리]에서 '템플릿 파일 다운로드'를 먼저 진행하세요.</small>
                </li>
                <li>
                    <strong>2. 앱에서 작업하기:</strong> 키워드, 성경, 설교 모드에서 자유롭게 자료를 추가, 수정, 삭제합니다. 모든 변경사항은 브라우저에 임시 저장됩니다.
                </li>
                <li>
                    <strong>3. 저장하기 (파일 업데이트):</strong> 상단에 빨간색 <code className="text-xs">'저장하기'</code> 버튼을 누르거나 단축키(Ctrl+S)를 사용하면, 현재 앱의 모든 데이터가 담긴 <strong>새로운 엑셀 파일</strong>이 다운로드됩니다.
                    <br/>
                    <strong className="text-red-600 dark:text-red-400">※ 중요: 기존에 불러왔던 파일은 수정되지 않고, 파일 이름에 시간이 기록된 새 파일이 생성됩니다. 이를 통해 버전 관리가 용이합니다.</strong>
                    <div className="not-prose mt-2 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-200 font-sans">
                            <strong className="font-semibold">💡 파일 저장 위치 팁:</strong>
                            <br />
                            파일이 저장되는 위치는 웹 브라우저의 설정에 따라 결정됩니다. 매번 저장 위치를 직접 선택하고 싶다면, 사용하시는 브라우저의 설정에서 "다운로드 전에 각 파일의 저장 위치 확인" 옵션을 활성화하세요.
                        </p>
                    </div>
                </li>
            </ol>
            
            <h4>✨ 주요 기능 상세 안내</h4>
            <ul>
                <li>
                    <strong>전체 검색:</strong> 상단의 검색창을 통해 키워드, 성경, 설교 등 모든 자료의 내용을 한 번에 검색할 수 있습니다.
                </li>
                <li>
                    <strong>빠른 수정:</strong> 키워드, 성경, 설교 모드에서 각 자료 항목을 <strong>더블클릭</strong>하면 바로 수정 창이 열립니다.
                </li>
                <li>
                    <strong>키워드 모드:</strong> 주제별로 자료를 정리합니다. 왼쪽 목록에서 키워드를 추가/선택하고, 오른쪽에서 관련 서적 인용문이나 메모를 관리합니다. 키워드 목록 상단의 검색창으로 특정 키워드나 그에 속한 자료 내용을 빠르게 찾을 수 있습니다.
                </li>
                <li>
                    <strong>성경 모드:</strong> 성경 본문별로 자료를 정리합니다. 왼쪽 목록에서 성경 책을 선택하고, 오른쪽에서 특정 구절에 대한 주석이나 참고 자료를 추가합니다. '새 자료 추가' 섹션에 '장:절' (예: <code>1:15-17</code>) 형식으로 입력하여 해당 위치에 자료를 추가하세요.
                </li>
                <li>
                    <strong>설교 모드:</strong> 개인 설교문이나 참고할 만한 타인 설교를 관리합니다. 왼쪽 목록에서 성경 책을 기준으로 설교를 필터링하여 볼 수 있습니다.
                </li>
            </ul>

            <h4>💎 고급 기능</h4>
            <ul>
                 <li>
                    <strong>AI 변환:</strong> '아래아 한글(HWP)' 등에서 복사한 텍스트나 책을 찍은 이미지를 앱의 데이터 형식으로 자동 변환합니다. 변환할 자료 유형(키워드, 성경, 설교)을 선택하고 내용을 붙여넣거나 이미지를 업로드하세요. 변환 결과를 미리보고 수정하여 앱에 바로 추가하거나 별도의 엑셀 파일로 다운로드할 수 있습니다. <strong>(이 기능은 설정에서 활성화하고 Gemini API 키를 등록해야 사용 가능하며, 사용량에 따라 비용이 발생할 수 있습니다.)</strong>
                </li>
                 <li>
                    <strong>Google Drive 동기화:</strong> 엑셀 파일 관리와는 <strong>별개의 기능</strong>으로, 데이터를 Google Drive에 실시간으로 백업하고 여러 기기에서 동기화할 수 있습니다. 엑셀 파일을 수동으로 옮기지 않고도 다른 컴퓨터나 브라우저에서 작업을 이어갈 수 있습니다.
                    <br/>
                    <small>* 이 기능은 앱의 내부 데이터를 Google Drive와 동기화하며, 엑셀 파일 자체를 동기화하는 것은 아닙니다. 설정 메뉴에서 Google API 키와 클라이언트 ID를 등록해야 사용할 수 있습니다.</small>
                </li>
            </ul>

            <h4>⚙️ 기타 설정</h4>
            <ul>
                <li><strong>화면:</strong> 앱 전체의 글자 크기를 조절하거나, 성경 모드에서 책 이름을 약어로 표시할 수 있습니다.</li>
                <li><strong>데이터 관리:</strong> 데이터 가져오기(Import)를 잘못했을 경우 이전 상태로 복원하는 기능, 템플릿 다운로드, 데이터 내보내기/가져오기 등을 제공합니다.</li>
                <li><strong>API 설정:</strong> Google Drive 동기화 및 AI 변환(Gemini)에 필요한 API 키를 관리합니다.</li>
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