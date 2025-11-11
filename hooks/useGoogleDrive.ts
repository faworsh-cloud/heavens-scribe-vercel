import { useState, useEffect, useCallback, useRef, SetStateAction } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useI18n } from '../i18n';
import { Keyword, BibleMaterialLocation, Sermon, UserProfile } from '../types';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
const APP_FILE_NAME = 'heavens_scribe_app_data.json';
const BACKUP_KEY = 'sermon-prep-backup';

interface DriveData {
  keywords: Keyword[];
  bibleData: BibleMaterialLocation[];
  sermons: Sermon[];
  lastModified: string;
}

export const useGoogleDrive = (
    apiKey: string,
    clientId: string,
    localKeywords: Keyword[],
    setLocalKeywords: (value: SetStateAction<Keyword[]>) => void,
    localBibleData: BibleMaterialLocation[],
    setLocalBibleData: (value: SetStateAction<BibleMaterialLocation[]>) => void,
    localSermons: Sermon[],
    setLocalSermons: (value: SetStateAction<Sermon[]>) => void,
    localLastModified: string,
    setLocalLastModified: (value: SetStateAction<string>) => void
) => {
    const { t } = useI18n();
    const [gapiReady, setGapiReady] = useState(false);
    const [gsiReady, setGsiReady] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [driveFileId, setDriveFileId] = useLocalStorage<string | null>('drive-file-id', null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
    const [driveFileName, setDriveFileName] = useState<string | null>(null);
    const [isBackupAvailable, setIsBackupAvailable] = useState(false);
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
    const signInSuccessCallback = useRef<(() => void) | null>(null);
    const isDriveInitialized = useRef(false);

    useEffect(() => {
        const backup = window.localStorage.getItem(BACKUP_KEY);
        setIsBackupAvailable(!!backup);
    }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            (window as any).gapi.load('client', () => {
                setGapiReady(true);
            });
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    useEffect(() => {
        if (!clientId) {
            setGsiReady(false);
            setTokenClient(null);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            try {
                const client = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: SCOPES,
                    callback: async (tokenResponse: any) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            (window as any).gapi.client.setToken({ access_token: tokenResponse.access_token });
                            setIsSignedIn(true);
                             try {
                                const userInfoResponse = await (window as any).gapi.client.request({
                                    path: 'https://www.googleapis.com/oauth2/v3/userinfo'
                                });
                                const profile = userInfoResponse.result;
                                setUserProfile({
                                    id: profile.sub,
                                    name: profile.name,
                                    email: profile.email,
                                    picture: profile.picture,
                                });
                            } catch (err) {
                                console.error("Error fetching user info:", err);
                            }
                            
                            if (signInSuccessCallback.current) {
                                signInSuccessCallback.current();
                                signInSuccessCallback.current = null; // Use once
                            }
                        }
                    },
                });
                setTokenClient(client);
                setGsiReady(true);
            } catch (error) {
                console.error("GSI client init error:", error);
                setTokenClient(null);
                setGsiReady(false);
            }
        }
        document.body.appendChild(script);
         return () => {
            document.body.removeChild(script);
        }
    }, [clientId, setUserProfile]);


    const handleSignIn = (onSuccess?: () => void) => {
        if (gsiReady && gapiReady && tokenClient) {
            if (onSuccess) {
              signInSuccessCallback.current = onSuccess;
            }
            tokenClient.requestAccessToken({prompt: ''});
        } else {
            alert(t('gdrive.authError'));
        }
    };
    
    const handleSignOut = () => {
        const token = (window as any).gapi.client.getToken();
        if (token !== null) {
            (window as any).google.accounts.oauth2.revoke(token.access_token, () => {});
            (window as any).gapi.client.setToken(null);
            setIsSignedIn(false);
            setDriveFileId(null);
            setDriveFileName(null);
            setSyncStatus('idle');
            setUserProfile(null);
            isDriveInitialized.current = false;
        }
    };

    const findFile = useCallback(async (): Promise<string | null> => {
        try {
            const response = await (window as any).gapi.client.drive.files.list({
                q: `name='${APP_FILE_NAME}' and mimeType='application/json' and trashed=false`,
                spaces: 'drive',
                fields: 'files(id, name)',
            });
            if (response.result.files && response.result.files.length > 0) {
                const file = response.result.files[0];
                setDriveFileName(file.name!);
                setDriveFileId(file.id!);
                return file.id!;
            }
            return null;
        } catch (error) {
            console.error('Error finding file:', error);
            return null;
        }
    }, [setDriveFileId]);

    const uploadData = useCallback(async (fileId: string, data: DriveData) => {
        try {
            await (window as any).gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                params: { uploadType: 'media' },
                body: JSON.stringify(data, null, 2),
            });
        } catch (error) {
            console.error('Error uploading data:', error);
            throw error;
        }
    }, []);

    const createFile = useCallback(async (): Promise<string | null> => {
        try {
            const response = await (window as any).gapi.client.drive.files.create({
                resource: {
                    name: APP_FILE_NAME,
                    mimeType: 'application/json',
                },
                fields: 'id, name',
            });
            const file = response.result;
            setDriveFileName(file.name!);
            setDriveFileId(file.id!);
            return file.id!;
        } catch (error) {
            console.error('Error creating file:', error);
            setSyncStatus('error');
            return null;
        }
    }, [setDriveFileId]);

    const downloadData = useCallback(async (fileId: string): Promise<DriveData | null> => {
        try {
            const response = await (window as any).gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            });
             if (typeof response.body === 'string' && response.body.length > 0) {
                return JSON.parse(response.body) as DriveData;
            }
            return { keywords: [], bibleData: [], sermons: [], lastModified: new Date(0).toISOString() };
        } catch (error: any) {
            console.error('Error downloading data:', error);
             if (error.status === 404) {
                return { keywords: [], bibleData: [], sermons: [], lastModified: new Date(0).toISOString() }; // File is empty or not found, treat as new
            }
            return null;
        }
    }, []);
    
    const syncData = useCallback(async () => {
        if (!isSignedIn) {
            alert(t('gdrive.notConnected'));
            return;
        }
        setSyncStatus('syncing');

        try {
            if (!isDriveInitialized.current) {
                if (!apiKey) {
                    alert(t('gdrive.apiKeyRequired'));
                    setSyncStatus('error');
                    return;
                }
                await (window as any).gapi.client.init({
                    apiKey: apiKey,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                isDriveInitialized.current = true;
            }

            let fileId = driveFileId || await findFile();

            if (!fileId) {
                if (window.confirm(t('gdrive.fileNotFoundConfirm', { fileName: APP_FILE_NAME }))) {
                    fileId = await createFile();
                    if (fileId) {
                        await uploadData(fileId, { keywords: localKeywords, bibleData: localBibleData, sermons: localSermons, lastModified: localLastModified });
                        alert(t('gdrive.newFileCreated'));
                        setSyncStatus('synced');
                        return;
                    }
                }
                if (!fileId) {
                    alert(t('gdrive.syncAbort'));
                    setSyncStatus('error');
                    return;
                }
            }
            
            const driveData = await downloadData(fileId);

            if (!driveData) {
                if (window.confirm(t('gdrive.fetchFailedConfirm'))) {
                   await uploadData(fileId, { keywords: localKeywords, bibleData: localBibleData, sermons: localSermons, lastModified: localLastModified });
                   setSyncStatus('synced');
                   alert(t('gdrive.localDataUploaded'));
                } else {
                   setSyncStatus('idle');
                }
                return;
            }
            
            const localData = { keywords: localKeywords, bibleData: localBibleData, sermons: localSermons, lastModified: localLastModified };

            const driveDate = new Date(driveData.lastModified || 0);
            const localDate = new Date(localLastModified || 0);

            if (Math.abs(driveDate.getTime() - localDate.getTime()) < 2000) {
                alert(t('gdrive.alreadyLatest'));
                setSyncStatus('synced');
                return;
            }
            
            if (driveDate > localDate) {
                window.localStorage.setItem(BACKUP_KEY, JSON.stringify(localData));
                setIsBackupAvailable(true);
                if (window.confirm(t('gdrive.remoteIsNewerConfirm'))) {
                    setLocalKeywords(driveData.keywords || []);
                    setLocalBibleData(driveData.bibleData || []);
                    setLocalSermons(driveData.sermons || []);
                    setLocalLastModified(driveData.lastModified);
                    alert(t('gdrive.syncComplete'));
                    setSyncStatus('synced');
                } else {
                    alert(t('gdrive.syncCancelled'));
                    setSyncStatus('idle');
                }
            } else {
                if (window.confirm(t('gdrive.localIsNewerConfirm'))) {
                    await uploadData(fileId, localData);
                    alert(t('gdrive.localDataUploaded'));
                    setSyncStatus('synced');
                } else {
                    alert(t('gdrive.uploadCancelled'));
                    setSyncStatus('idle');
                }
            }
        } catch (error) {
            console.error('Sync failed:', error);
            alert(t('gdrive.syncFailed'));
            setSyncStatus('error');
        }
    }, [
        isSignedIn, apiKey, driveFileId, localKeywords, localBibleData, localSermons, localLastModified, t,
        findFile, createFile, uploadData, downloadData, 
        setLocalKeywords, setLocalBibleData, setLocalSermons, setLocalLastModified
    ]);

    const restoreFromBackup = useCallback(() => {
        const backup = window.localStorage.getItem(BACKUP_KEY);
        if (backup) {
          if (window.confirm(t('gdrive.backupRestoreConfirm'))) {
            try {
              const parsedBackup: DriveData = JSON.parse(backup);
              setLocalKeywords(parsedBackup.keywords || []);
              setLocalBibleData(parsedBackup.bibleData || []);
              setLocalSermons(parsedBackup.sermons || []);
              setLocalLastModified(parsedBackup.lastModified || new Date().toISOString());
              alert(t('gdrive.backupRestored'));
            } catch (e) {
              alert(t('gdrive.backupCorrupted'));
              console.error("Backup restore failed:", e);
            }
          }
        } else {
          alert(t('gdrive.noBackup'));
        }
      }, [setLocalKeywords, setLocalBibleData, setLocalSermons, setLocalLastModified, t]);

    return {
        isSignedIn,
        syncStatus,
        driveFileName,
        isReady: gapiReady && gsiReady,
        handleSignIn,
        handleSignOut,
        syncData,
        isBackupAvailable,
        restoreFromBackup,
        userProfile,
    };
};
