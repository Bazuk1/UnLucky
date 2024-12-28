import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import DefaultTextInput from "./DefaultTextInput";
import Dropdown from "./Dropdown";
import { useState } from "react";

export default function Searcher({ searchType, TABS }: { searchType: string, TABS: string[] }) {

    const [selectedTab, setSelectedTab] = useState<string>(TABS[0]);

    return (
        <div className="flex flex-col w-full select-none">
            <div className="flex items-center">
                <div className="flex list-none">
                    {
                        TABS.map((tab) => {
                            return (
                                <li key={`tab-header-${tab}`} onClick={() => setSelectedTab(tab)} className={`px-5 py-1 font-[Flama-Bold] cursor-pointer text-2xl uppercase hover:opacity-80 ${tab === selectedTab ? "text-red-600 border-b-red-600 border-b-[3px]" : "text-white"}`}>
                                    <span>{tab}</span>
                                </li>
                            )
                        })
                    }
                </div>
                <div className="h-[1.5rem] w-[1px] bg-shark-200 mx-4">
                    {/* Divider */}
                </div>
                <DefaultTextInput 
                    inputName={`searcher-${searchType}`}
                    inputType="text"
                    inputTheme="transparent-bg text-size-medium extrabold ups flex-full"
                    updateCallback={(newValue) => console.log("new value", newValue)}
                    icon={faMagnifyingGlass}
                    placeholder={`Search ${searchType}`}
                />
            </div>
            <div>
                <Dropdown 
                    defaultValue="Recommended" 
                    textSize="text-lg"
                    optionList={["Recommended", "Most Popular", "Least Popular", "Price (Low to High)", "Price (High to Low)", "Newest", "Oldest"]}
                    updateCallback={(newValue) => console.log("new value", newValue)}
                />
            </div>
        </div>
    )
}