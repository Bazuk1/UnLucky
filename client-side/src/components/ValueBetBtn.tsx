function HeaderBtn({ clickEvent, text } : { clickEvent: () => void, text: string }) {
    return (
        <button className="bg-shark-700 md:px-3 px-1 py-1 rounded hover:brightness-110" onClick={clickEvent}>
            {text}
        </button>
    );
  }
  
  export default HeaderBtn;