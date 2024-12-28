import { Link, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faGun, faGift, faRightToBracket, faBoxOpen, faBoxesStacked, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { SubmitBtn, CoinsCounter, AvatarBtn } from "./Components"
import { GlobalContext } from "../App";
import { useContext } from "react";

const banner = `${process.env.PUBLIC_URL}/banner.png`
const logo = `${process.env.PUBLIC_URL}/logo512.png`

const NAV: { title: string, icon: IconDefinition, url: string }[] = [
  {
    title: "ROLL",
    icon: faRocket,
    url: "/roll"
  },
  {
    title: "UNBOXING",
    icon: faBoxOpen,
    url: "/unboxing/list"
  },
  {
    title: "PVP",
    icon: faGun,
    url: "/pvp"
  },
  {
    title: "ITEMS",
    icon: faBoxesStacked,
    url: "/items"
  },
  {
    title: "REWARDS",
    icon: faGift,
    url: "/rewards"
  }
]

function Header({ userMenu } : { userMenu: { state : boolean, toggle : () => void } }) {
  const location = useLocation();

  const { loginForm, user, loading } = useContext(GlobalContext);

    return (
      <header className={`bg-shark-900 flex items-center px-3 md:px-5 h-20 fixed top-0 w-full z-20${loading.isPageLoading ? " pointer-events-none" : ""}`}>
        <Link to="/" className="select-none">
          <picture>
            <source media="(min-width: 768px)" srcSet={banner} />
            <img src={logo} alt="Logo" className="max-w-[48px] max-h-[48px] md:max-w-[160px] md:max-h-[64px] md:mx-4 mr-2 md:mr-6 cursor-pointer" />
          </picture>
        </Link>
        <nav className="list-none flex justify-center select-none h-full flex-1">
          <div className="flex md:justify-start list-none select-none h-full flex-1 justify-center">
          {
            NAV.map(link => {
              return (
                <li key={link.title} className={`font-bold text-white flex transition-opacity cursor-pointer header-btn-hover${location.pathname === link.url ? "" : " "}`}>
                  <Link to={link.url} onClick={() => loading.pageNavigator() } className={`flex items-center h-full relative px-5 md:px-4${location.pathname === link.url ? " before:w-full" : " before:w-0"}`}>
                    <FontAwesomeIcon icon={link.icon} className={`${location.pathname === link.url ? "text-red-500" : "opacity-50"}`} />
                    <span className={`hidden lg:block ml-2${location.pathname === link.url ? "" : " opacity-50"}`}>{link.title}</span>
                  </Link>
                </li>
              )
            })
          }
          </div>
          <div className="flex justify-end list-none select-none">
          { user.isLoggedIn ? 
            <li className="flex items-center">
              <CoinsCounter />
              <AvatarBtn clickEvent={userMenu.toggle} isFocused={userMenu.state} />
            </li>
            :
            <li className="flex items-center">
              <SubmitBtn text="LOGIN" icon={faRightToBracket} clickEvent={() => loginForm.toggleLoginForm()} />
            </li>
          }
          </div>
        </nav>
      </header>
    );
  }
  
  export default Header;