import React from 'react';
import { XMarkIcon } from './icons';

interface GeminiApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeminiApiGuideModal: React.FC<GeminiApiGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-3xl transform transition-all relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex-shrink-0">Google AI (Gemini) API 키 발급 안내</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow overflow-y-auto pr-4 -mr-4">
            <p className="lead">
                AI 변환 기능을 사용하려면 Google의 인공지능 모델인 Gemini를 사용해야 합니다. 이를 위해 개인 'API 키'를 발급받아 앱에 등록해야 합니다. 이 키는 API 사용량을 추적하고 비용을 관리하는 데 사용됩니다.
            </p>
            <div className="not-prose my-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-800 dark:text-yellow-200 text-xs">
                <p className="font-bold">⚠️ 중요: 비용 관련 안내</p>
                <p>Google은 API 사용에 대한 무료 할당량을 제공하지만, 이 한도를 초과하면 Google 계정에 연결된 결제 수단으로 비용이 청구될 수 있습니다. <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Gemini API 가격 정책</a>을 반드시 확인하고 사용량에 주의하세요.</p>
            </div>

            <h4>1단계: Google AI Studio 접속</h4>
            <ol>
                <li><a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio 웹사이트</a>에 접속하여 Google 계정으로 로그인합니다.</li>
                <li>서비스 약관에 동의하라는 창이 나타나면 내용을 확인하고 동의합니다.</li>
            </ol>
            
            <h4>2단계: 새 프로젝트에서 API 키 생성</h4>
            <ol>
                <li>로그인 후, 화면 왼쪽 메뉴에서 <strong>[Get API key]</strong>를 클릭합니다.</li>
                <li>Google Cloud 페이지로 이동합니다. 여기서 <strong>[+ Create API key in new project]</strong> 버튼을 클릭하여 새 프로젝트에서 API 키를 생성합니다.
                    <br/>
                    <small>기존에 Google Cloud 프로젝트가 있다면, 드롭다운 메뉴에서 기존 프로젝트를 선택하고 API 키를 생성할 수도 있습니다.</small>
                </li>
                <li>잠시 기다리면 API 키가 생성되어 팝업창에 표시됩니다.</li>
            </ol>

            <h4>3단계: API 키 복사 및 등록</h4>
            <ol>
                <li>생성된 API 키 (긴 글자와 숫자 조합) 옆의 복사 아이콘을 클릭하여 클립보드에 복사합니다.</li>
                <li>Heaven's Scribe 앱으로 돌아와 설정 창을 엽니다.</li>
                <li>'AI 변환 기능 (Google AI Gemini)' 섹션의 <strong>'Google AI Studio API 키'</strong> 입력란에 복사한 키를 붙여넣습니다.</li>
                <li><strong>[Gemini 키 저장]</strong> 버튼을 클릭하여 설정을 완료합니다.</li>
            </ol>
            
            <p className="font-semibold">
                이제 AI 변환 기능을 사용할 준비가 되었습니다!
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

export default GeminiApiGuideModal;