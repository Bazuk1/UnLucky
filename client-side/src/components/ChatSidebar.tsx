//pt-20

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faChevronRight, faHamburger } from "@fortawesome/free-solid-svg-icons";

import { LoadingSpinner } from "./Components";
import { useEffect, useState } from "react";

function ChatSidebar({ display, toggleSidebar } : { display: boolean, toggleSidebar: () => void }) {

  const [chatText, setChatText] = useState<string>("")
  const [showMainChat, setMainChatVisibility] = useState<boolean>(false);
  const [isChatLoading, setChatLoading] = useState<boolean>(true);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Attempting to send message")
    e.preventDefault();
  }

  useEffect(() => {
    if (display) {
      setChatLoading(true);
      var loadTimeout = setTimeout(() => setMainChatVisibility(display), 1000);
    }
    else setMainChatVisibility(display)
    return () => clearTimeout(loadTimeout);
  }, [display])

  useEffect(() => {
    // Load Chat Messages here
    var chatLoadTimeout = setTimeout(() => setChatLoading(false), 2000); //temporarily
    return () => clearTimeout(chatLoadTimeout);
  }, [isChatLoading])

    return (
      <div className={`bg-shark-900 flex fixed top-20 bottom-0 sm:w-0 transition-[width] duration-500 z-10 ${display ? "lg:w-[340px] md:w-[280px]" : "md:w-[40px]"}`}>
        {
          display ? <FontAwesomeIcon onClick={toggleSidebar} icon={faXmark} className="m-2 text-shark-400 w-6 h-6 absolute right-0 cursor-pointer hover:text-shark-300" />
                  : <FontAwesomeIcon onClick={toggleSidebar} icon={faChevronRight} className="text-shark-400 absolute self-center right-2 w-6 h-6 cursor-pointer hover:text-shark-300 hover:right-0 transition-all" />
        }
        {
          showMainChat &&
          <div className="flex flex-col flex-1">
            {
              isChatLoading ?
              <div className="justify-center items-center flex flex-1 flex-col">
                <LoadingSpinner w={64} h={64} />
              </div>
              : 
              <div className="justify-center items-center flex flex-1 flex-col">
                {/* Main Chat */}
              </div>
            }
            <form onSubmit={sendMessage}>
              <div className="flex justify-self-end items-center bg-shark-700 p-2">
                <input type="text" value={chatText} onChange={(e) => setChatText(e.target.value)} className="rounded text-lg bg-transparent flex-1 outline-none border-solid border-shark-600 border-2 p-1 font-medium text-white focus:border-shark-500" placeholder="Type a message" />
                {/* <button type='submit' className="ml-2 flex items-center justify-center">
                  <FontAwesomeIcon icon={faChevronRight} className="text-green-500 w-8 h-8 cursor-pointer hover:text-green-400" />
                </button> */}
              </div>
            </form>
          </div>
        }
      </div>
    );
  }
  
  export default ChatSidebar;