

function TextInput({ handleInputChange, currentValue, inputType, inputName, placeholder }: { handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, currentValue?: string | number | readonly string[], inputType: string, inputName: string, placeholder?: string }) {
    return (
        <input type={inputType} name={inputName} value={currentValue} onChange={handleInputChange} className="rounded text-2xl bg-transparent outline-none border-solid border-shark-700 border-2 p-3 font-medium focus:border-shark-600" placeholder={placeholder} />
    )
}


export default TextInput;