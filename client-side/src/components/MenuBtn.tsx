import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";


function MenuBtn({ clickEvent, text, icon } : { clickEvent: () => void, text: string, icon: IconDefinition | null }) {
    return (
      <li onClick={(e) => { clickEvent(); e.preventDefault(); }} className={`text-lg menu-btn flex items-center justify-center h-[40px] bg-transparent pr-20 py-2 my-[4px] pl-2 rounded-md cursor-pointer ${text === "Rewards" ? "text-[#4ade80]" : "text-white"}`}>
        {!!icon && <FontAwesomeIcon icon={icon} className='mr-3 transition-transform w-[24px] h-[24px]' />}
        <span className="font-semibold md:block select-none transition-transform flex-1">{text}</span>
      </li>
    );
  }
  
  export default MenuBtn;