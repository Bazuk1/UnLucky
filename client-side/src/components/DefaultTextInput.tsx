import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HTMLInputTypeAttribute, useState } from "react";


function DefaultTextInput({ defaultValue, inputType, inputName, placeholder, updateCallback, inputTheme, icon }: { updateCallback: (newValue: string) => void, defaultValue?: string, inputType: HTMLInputTypeAttribute, inputName: string, placeholder?: string, inputTheme: string, icon?: IconDefinition }) {
    const [currentValue, setCurrentValue] = useState<string>(defaultValue || "")

    const handleThemeGenerator = () => {
        var returnedTheme = "rounded text-white outline-none";
        if (inputTheme.includes("flex-full")) returnedTheme += " flex-1"
        if (inputTheme.includes("transparent-bg")) returnedTheme += " bg-transparent"
        if (inputTheme.includes("border")) returnedTheme += " border-solid border-2 border-shark-700 focus:border-shark-600"
        if (inputTheme.includes("ups")) returnedTheme += " uppercase"
        if (inputTheme.includes("text-size-small")) returnedTheme += " text-lg p-2"
        if (inputTheme.includes("text-size-medium")) returnedTheme += " text-2xl font-medium p-3"
        if (inputTheme.includes("text-size-large")) returnedTheme += " text-4xl font-bold p-4"
        if (inputTheme.includes("extrabold")) returnedTheme += " font-[Flama-Medium]"
        return returnedTheme
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(e.target.value)
        updateCallback(e.target.value)
    }

    if (!!icon) {
      return ( 
      <div className={"flex items-center " + handleThemeGenerator()}>
        { !!icon && <FontAwesomeIcon icon={icon} className='mr-3 opacity-80 scale-90 cursor-pointer' /> }
        <input type={inputType} name={inputName} value={currentValue} onChange={handleInputChange} className={`outline-none bg-transparent${inputTheme.includes("ups") ? " uppercase" : ""}`} placeholder={placeholder} />
      </div>  
      )
    }
    return <input type={inputType} name={inputName} value={currentValue} onChange={handleInputChange} className={handleThemeGenerator()} placeholder={placeholder} />
}


export default DefaultTextInput;