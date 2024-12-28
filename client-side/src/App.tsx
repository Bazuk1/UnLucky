import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Header, ChatSidebar, LoginForm, AlertBox, UserMenu, Confetti } from "./components/Components";
import { createContext, useEffect, useState } from "react";

import * as Pages from "./pages/Pages";
import PageLoader from "./components/PageLoader";
import { fetchAuthUserInfo, initializeConnection } from "./utils/serverConnection";
import { socket } from "./utils/socketConnection";

export interface IUser {
  user_id: string;
  email: string;
  username: string;
  avatar: string;
  accountLvl: number;
}

export type GlobalContextType = {
  loginForm: {
    showLoginForm: boolean;
    toggleLoginForm: () => void;
  },
  user: {
    userInfo: any;
    setUserInfo: (newUserInfo: any) => void;
    isLoggedIn: boolean;
  },
  loading: {
    isLoading: boolean;
    toggleLoading: () => void;
  },
  alert: {
    alertCode: string;
    setAlertCode: () => void;
  }
};

export const GlobalContext = createContext<GlobalContextType | any>(null);

function App() {
  const navigate = useNavigate();

  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alertCode, setAlertCode] = useState<string>("");
  const [isMuted, setIsMuted] = useState(true);

  // eslint-disable-next-line
  const [showChat, setShowChat] = useState<boolean>(window.innerWidth > 1200 && localStorage.getItem('showChat') === "true");
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [PageLoad, setPageLoad] = useState<boolean>(true);

  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [enableConfetti, setEnableConfetti] = useState<boolean>(false);

  // Page Visibility
  // const [isPageVisible, setIsPageVisible] = useState(true);
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     setIsPageVisible(!document.hidden);
  //   }
  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, []);

  function userLogout() {
    localStorage.removeItem("refToken");
    localStorage.removeItem("sessionToken");
    window.location.href = "/";
  }

  function pageNavigator(path?: string) {
    !!path && navigate(path);
    setPageLoad(true)
  }

  useEffect(() => {
    const confettiTemp = localStorage.getItem("showConfetti")
    if (confettiTemp && (confettiTemp === "true" || confettiTemp === "false")) {
      if (confettiTemp === "true") setEnableConfetti(true);   
    } else {
      localStorage.setItem("showConfetti", "true");
      setEnableConfetti(true);
    }
      window.addEventListener("resize", (e: any) => {
        if (localStorage.getItem('showChat') === "true") setShowChat(e.target.innerWidth > 1200)
      })
    const initServer = async () => {
      const serverConnection = await initializeConnection();
      if (serverConnection === "success-authenticated" || serverConnection === "success") {
        if (serverConnection === "success-authenticated") {
          const userInfo = await fetchAuthUserInfo();
          if (userInfo) {
            setUserInfo(userInfo)
            setUserCoins(userInfo.coins)
          }
          else setUserInfo(null)
        }
        setTimeout(() => setIsLoading(false), 1000);
      }
      console.log(`Connected to the server with the code: ${serverConnection}`)  
    }
    initServer();
  }, [])

  useEffect(() => {
    socket.on("updateUserCoins", (res) => {
      if (res.type === "updateUserCoins") {
        setUserCoins(res.data.coins)
      } else console.log("something went wrong => updateUserCoins");

    })
    return () => {
      socket.removeAllListeners("updateUserCoins")
    }
  }, [socket])

  // Audio Controller Mute
  useEffect(() => {
    const handleInteraction = () => {
      setIsMuted(false);
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);

  useEffect(() => {
    setShowUserMenu(false)
    var pageLoading = setTimeout(() => setPageLoad(false), 400);
    return () => clearTimeout(pageLoading);
  }, [PageLoad]);


  useEffect(() => {
    var alertTimeout = setTimeout(() => setAlertCode(""), 4000);
    return () => clearTimeout(alertTimeout);
  }, [alertCode])

  // useEffect(() =>{
  //   var hideConfetti = setTimeout(() => setShowConfetti(false), 4000);
  //   return () => clearTimeout(hideConfetti)
  // }, [showConfetti])

  return (
    <div className="App">
      { PageLoad && <PageLoader /> }
      <GlobalContext.Provider value={{
        loginForm: {
          showLoginForm, toggleLoginForm: () => setShowLoginForm(prevState => !prevState)
        },
        user: {
          userInfo, setUserInfo, isLoggedIn: !!userInfo, coins: userCoins
        },
        loading: {
          isLoading, toggleLoading: () => setIsLoading(prevState => !prevState), pageNavigator, isPageLoading: PageLoad
        },
        alert: {
          alertCode, setAlertCode
        },
        audio: {
          isMuted: isMuted,
        },
        showConfetti: () => setShowConfetti(true)
      }}>
        { alertCode.length > 0 && <AlertBox msg={alertCode} /> }
        { !(!!userInfo) && <LoginForm display={showLoginForm} /> }
        <Header userMenu={{ toggle: () => setShowUserMenu(prevState => !prevState), state: showUserMenu }} />
        <UserMenu display={showUserMenu} toggleDisplay={() => setShowUserMenu(prevState => !prevState)} userLogout={userLogout} />
        <ChatSidebar display={showChat} toggleSidebar={() => 
            setShowChat(prevState => {
              localStorage.setItem('showChat', (!prevState).toString());
              return !prevState;
            })} />
        {
          enableConfetti && <Confetti display={showConfetti} setDisplay={() => setShowConfetti(false)} /> 
        }
        {
          !isLoading && 
          <main className={`flex justify-center flex-1 ${isLoading || PageLoad ? "hidden" : "block"} ${showChat ? "lg:ml-[340px] md:ml-[280px]" :  "md:ml-[40px]" }`}>
            <Routes>
              <Route path="/" element={<Navigate to="/roll" />} />
              <Route path="/roll" element={<Pages.Roll />} />
              <Route path="/roll/history" element={<div>Roll history</div>} />
              <Route path="/pvp" element={<Pages.Pvp />} />
              <Route path="/rewards" element={<Pages.Rewards />} />
              { !!userInfo && <Route path="/profile" element={<Navigate to={`/profile/${userInfo.user_id}/summary`} />} /> }
              <Route path="/profile/:user_id/:selected_tab" element={<Pages.Profile />} />
              <Route path="/unboxing">
                <Route path="list" element={<Pages.CaseList />} />
                <Route path="view/:case_id" element={<Pages.Unboxing />} />
                <Route index element={<Navigate to="/unboxing/list" />} />
              </Route>
              <Route path="/items">
                <Route path="list" element={<Pages.ItemList />} />
                <Route index element={<Navigate to="/items/list" />} />
              </Route>
            </Routes> 
          </main>
        }

      </GlobalContext.Provider>
    </div>
  );
}

export default App;
