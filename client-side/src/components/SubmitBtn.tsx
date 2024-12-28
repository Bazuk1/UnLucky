import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

// TODO: Mobile support for login form


function HeaderBtn({ clickEvent, text, icon } : { clickEvent: () => void, text: string, icon?: IconDefinition }) {
    return (
      <button type="submit" onClick={(e) => { clickEvent(); e.preventDefault(); }} className={`${!(!!icon) ? "py-6 px-8 text-xl " : ""}text-white flex items-center justify-center h-[40px] bg-green-500 px-4 py-2 rounded-md hover:brightness-105 shadow-green cursor-pointer`}>
        { !!icon && <FontAwesomeIcon icon={icon} className='mr-2' />}
        <span className="font-bold hidden md:block select-none">{text}</span>
      </button>
    );
  }
  
  export default HeaderBtn;