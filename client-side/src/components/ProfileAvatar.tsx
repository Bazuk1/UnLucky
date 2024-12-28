function ProfileAvatar({ user } : { user: { username: string, accountLvl: number, avatar: string} }) {
    return (
      <div className="relative flex items-center w-[156px] h-[156px] justify-center cursor-default">
        <div className={`rounded-full w-[156px] h-[156px] absolute inline-block text-shark-400 ${user.accountLvl < 10 ? "text-shark-400" : "text-yellow-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="50 50 100 100">
            <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="6"></circle>
          </svg>
        </div>
        <div className="w-[120px] h-[120px] md:w-[124px] md:h-[124px] bg-cover rounded-full z-10" style={{ backgroundImage: `url(${user.avatar})` }}></div>
        <div className={`${user.accountLvl < 10 ? "bg-shark-300" : "bg-yellow-500"} text-black rounded-full absolute bottom-0 left-0 z-10 w-[40px] h-[40px] flex items-center justify-center border-[1px] border-shark-900`}>
          <span className={`font-medium select-none ${user.accountLvl < 10 ? "text-3xl" : "text-2xl"}`}>{user.accountLvl}</span>
        </div>
      </div>
    );
  }
    
  export default ProfileAvatar;
    