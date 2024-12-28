
// Fix User Menu Hidden when clicking on the menu

import { faUser, faArrowRightFromBracket, faGift } from "@fortawesome/free-solid-svg-icons";
import MenuBtn from "./MenuBtn";
import { useContext } from "react";
import { GlobalContext } from "../App";

function UserMenu({ display, toggleDisplay, userLogout } : { display: boolean, toggleDisplay: () => void, userLogout: () => void }) {
  const { loading } = useContext(GlobalContext)

    return (
      <>
        <div onClick={toggleDisplay} className={`bg-transparent transition h-full w-full fixed top-0 left-0 z-[90] ${display && !loading.isLoading ? "block" : "hidden"}`}></div>
        <div className={`flex right-0 bg-shark-900 z-[110] flex-col p-4 fixed rounded-bl-lg ${display ? "user-menu" : "hidden"}`}>
          <MenuBtn text="Profile" icon={faUser} clickEvent={() => loading.pageNavigator("/profile")} />
          <div>
            <MenuBtn text="Rewards" icon={faGift} clickEvent={() => loading.pageNavigator("/rewards")} />
          </div>
          <MenuBtn text="Logout" icon={faArrowRightFromBracket} clickEvent={userLogout} />
        </div>
      </>
    );
  }
  
  export default UserMenu;