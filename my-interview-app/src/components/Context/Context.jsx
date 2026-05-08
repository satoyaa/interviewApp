
import { createContext} from 'react';

//ページ移動用のコンテクスト
//historyAreaとhistoryNavigationをつなぐためにApp.jsxで実装
export const AppContext = createContext({
    history_ID: "",
    setHistory_ID: () => {}
});
