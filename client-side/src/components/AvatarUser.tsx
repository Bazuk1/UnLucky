function AvatarUser({ user } : { user: { username: string, accountLvl: number, avatar: string} }) {
  return (
    <div className="relative flex items-center w-[48px] h-[48px] justify-center cursor-default scale-75">
      <div className={`rounded-full w-[48px] h-[48px] absolute inline-block text-shark-400 ${user.accountLvl < 10 ? "text-shark-400" : "text-yellow-500"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="50 50 100 100">
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="6"></circle>
        </svg>
      </div>
      <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] bg-cover rounded-full z-10" style={{ backgroundImage: `url(${user.avatar})` }}></div>
      <div className={`${user.accountLvl < 10 ? "bg-shark-300" : "bg-yellow-500"} text-black rounded-full absolute bottom-[-2px] left-[-2px] z-10 w-[20px] h-[20px] flex items-center justify-center border-[1px] border-shark-900`}>
        <span className={`font-medium select-none ${user.accountLvl < 10 ? "text-sm" : "text-xs"}`}>{user.accountLvl}</span>
      </div>
    </div>
  );
}
  
export default AvatarUser;
  