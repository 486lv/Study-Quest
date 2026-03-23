export {};

declare global {
  interface Window {
    electronAPI?: {
      saveData?: (filename: string, data: string) => Promise<unknown>;
      loadData?: (filename: string) => Promise<string | null>;
      notify?: (title: string, body: string) => Promise<unknown>;
      setAutoLaunch?: (enabled: boolean) => Promise<unknown>;
      setMinimizeToTray?: (enabled: boolean) => Promise<unknown>;
      getAppInfo?: () => Promise<unknown>;
      clearDevCache?: () => Promise<unknown>;
      webviewPreloadPath?: string;
      fetchMediaMeta?: (url: string) => Promise<{ ok?: boolean; title?: string; bvid?: string; aid?: string; durationSec?: number }>;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        preload?: string;
        allowpopups?: boolean | '';
        nodeintegrationinsubframes?: boolean | '';
        partition?: string;
      };
    }
  }
}


