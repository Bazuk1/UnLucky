import { Navigate, useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../App";
import { AccountTab, FairnessTab, LoadingLogo } from "../components/Components";
import { useContext, useEffect, useState } from "react";
import { DefaultInstance } from "../utils/serverConnection";

// Private profile for now

const progresstemp = 5200;

const LEVEL_PROGRESS = [
    300,
    900,
    2700,
    6500,
    14000,
    23000,
    34000,
    48000,
    64000,
    85000
]

export default function Profile() {
    const { user, alert, loading } = useContext(GlobalContext);
    const { user_id, selected_tab } = useParams();
    const navigate = useNavigate();

    // const [selectedTab, setSelectedTab] = useState<"ACCOUNT" | "FAIRNESS" | "STATS" | "GAME HISTORY">("ACCOUNT");
    const [profileLoading, setProfileLoading] = useState<boolean>(true);
    const [profileInfo, setProfileInfo] = useState({
        username: "w",
        avatar: "sheesh",
        accountLvl: 0,
        email: "",
    });

    function userLogout() {
        localStorage.removeItem("refToken");
        localStorage.removeItem("sessionToken");
        window.location.href = "/";
    }

    useEffect(() => {
        if (user.isLoggedIn && user.userInfo.user_id === user_id) {
            setProfileInfo({
                username: user.userInfo.username,
                avatar: user.userInfo.avatar,
                accountLvl: user.userInfo.accountLvl,
                email: user.userInfo.email
            })
        } else {
            DefaultInstance.get(`/${user_id}/public`).then(async (response) => {
                if (response.status === 200) {
                    setProfileInfo(response.data.user)
                } else {
                    console.log("Bad fetch =>", response.status);
                    alert.setAlertCode("error");
                }
            }).catch((error) => {
                if (error.response.status === 404 || error.response.status === 400) {
                    loading.pageNavigator("/")
                } else {
                    console.log(`Bad fetch => ${error.response ? error.response.status : "error"}`);
                    console.error(error)
                    alert.setAlertCode("error");
                }
            })
        }
    }, [user_id])

    useEffect(() => {
        // After loading the tab:
        var loadTimeout = setTimeout(() => setProfileLoading(false), 1000);
        return () => clearTimeout(loadTimeout);
    }, [profileLoading]);
    
    return (
      <div className="flex flex-col flex-1 m-6 w-full">
        <div className="flex flex-1 flex-col md:flex-row">
            <div className="self-center md:self-start">
                <div className="w-[256px] h-[256px] md:w-[128px] md:h-[128px] bg-cover z-10" style={{ backgroundImage: `url(${profileInfo.avatar})` }}></div>
            </div>
            <div className="flex flex-col flex-1 justify-center px-4 md:px-0 md:ml-8 select-none max-w-[960px] self-center w-full mt-2 md:mt-0">
                <div className="flex text-white font-bold md:items-baseline items-center md:text-left flex-col md:flex-row">
                    <span className="text-5xl uppercase flex-1 md:flex-[0]">{profileInfo.username}</span>
                    <span className="text-lg ml-2">LEVEL {profileInfo.accountLvl}</span>
                </div>
                <div className="flex h-[1.2rem] mt-2">
                    <div className="bg-shark-200 relative flex-1">
                        <div className="h-[1.2rem] bg-purple-800" style={{ width: `${(progresstemp/LEVEL_PROGRESS[profileInfo.accountLvl-1]*100).toFixed(0)}%` }}></div>
                        <span className="absolute right-1 top-[-3px] font-medium">{progresstemp}/{LEVEL_PROGRESS[profileInfo.accountLvl-1]}</span>
                    </div>
                    <span className="ml-2 text-white font-bold flex leading-[18px]"><span className="hidden md:block mr-1">LEVEL</span>{profileInfo.accountLvl+1}</span>
                </div>

            </div>
        </div>
        {
            user.userInfo.user_id === user_id ? <>
            <div className="bg-shark-700 my-4 p-2 flex rounded-md flex-col space-y-1 md:space-y-0 md:space-x-1 md:flex-row">
                {
                    ["summary", "stats", "fairness", "game history"].map((tab) => {
                        return (
                            // @ts-ignore
                            <li key={`ProfileTab-${tab}`} onClick={() => {navigate(`/profile/${user_id}/${tab.split(" ").join("-")}`); setProfileLoading(true); } } className={`list-none px-4 py-2 md:py-1 text-center cursor-pointer transition-opacity ${tab === selected_tab ? "bg-[#1e3930] text-[#00e258]" : "bg-shark-800 text-white hover:opacity-90"}  `}>
                                <span className="text-sm select-none whitespace-nowrap uppercase">{tab}</span>
                            </li>
                        )
                    })
                }
                <li onClick={userLogout} className="flex-1 flex justify-center md:justify-end items-center list-none mx-1 p-1 px-4">
                    <span className="text-xs select-none text-shark-300 hover:text-white cursor-pointer">LOGOUT</span>
                </li>
            </div>
            <div className="my-4 p-2 flex flex-1">
                {
                    profileLoading && <div className="flex-1 flex items-center mt-[10%] justify-center"><LoadingLogo /></div>
                }
                <div className={`${profileLoading ? "hidden" : "block"} flex flex-1`}>
                    {
                        selected_tab === "summary" ? <AccountTab />
                        : selected_tab === "stats" ? <div className="flex flex-1 justify-center mt-[10%]"><h5 className="uppercase font-bold text-white text-5xl select-none z-20">COMING SOON</h5><img src={`${process.env.PUBLIC_URL}/banner.png`} className="absolute opacity-40 mt-[-120px]" /></div>
                        : selected_tab === "fairness" ? <FairnessTab />
                        : selected_tab === "game-history" ? <div className="flex flex-1 justify-center mt-[10%]"><h5 className="uppercase font-bold text-white text-5xl select-none z-20">COMING SOON</h5><img src={`${process.env.PUBLIC_URL}/banner.png`} className="absolute opacity-40 mt-[-120px]" /></div>
                        : <Navigate to={`/profile/${user_id}/summary`} />
                    }
                </div>
            </div>
            </>
            : <div>Public Profile</div>
        }
      </div>
    );
}