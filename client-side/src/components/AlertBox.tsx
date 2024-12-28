import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

function AlertBox({ msg } : { msg: string }) {
    return (
      <div className="alertBox dark:bg-shark-900 m-2 flex flex-col max-w-[18rem] border-[0.5px] border-green-400  z-[200]">
        <div className="flex items-center justify-center whitespace-nowrap">
          {(msg === "login_success" || msg === "bet_success" || msg === "update_EMAIL_success" || msg === "update_USERNAME_success" || msg === "update_CLIENT_SEED_success") && <FontAwesomeIcon className="text-green-400 m-2 mx-4 mr-2 order-1 w-8 h-8" icon={faCircleCheck} />}
          {(msg === "login_failure" || msg === "error" || msg === "update_failure") && <FontAwesomeIcon className="text-red-400 m-2 mx-4 mr-2 order-1 w-8 h-8" icon={faCircleXmark} />}
          {(msg === "bet_failed_coins" || msg === "timeout" || msg === "needtologin") && <FontAwesomeIcon className="text-yellow-400 m-2 mx-4 mr-2 order-1 w-8 h-8" icon={faTriangleExclamation} />}
          <span className="text-white font-light text-lg order-2 flex-1 px-2 pr-4 py-3 break-words">
            {msg === "login_success" && "Successfully Connected!"}
            {msg === "login_failure" && "Incorrect username or password. Please try again."}
            {msg === "update_failure" && "Can't update user information."}
            {msg === "bet_success" && "Placed bet successfully!"}
            {msg === "bet_failed_coins" && "Insufficient funds."}
            {msg === "error" && "Something went wrong..."}
            {msg === "timeout" && "Chill Bro..."}
            {msg === "needtologin" && "You Need to login first!"}
            {msg === "update_EMAIL_success" && "Your email has been updated successfully!"}
            {msg === "update_USERNAME_success" && "Your username has been updated successfully!"}
            {msg === "update_CLIENT_SEED_success" && "Your client seed has been updated successfully!"}
          </span>  
        </div>
        <div className="alert-loader h-[1px] bg-green-400 order-2 rounded-md"></div>
      </div>
    );
  }
  
export default AlertBox;