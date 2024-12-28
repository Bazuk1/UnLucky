import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function Dropdown({
	defaultValue,
	optionList,
	updateCallback,
	textSize,
}: {
	defaultValue: string;
	textSize: string;
	optionList: string[];
	updateCallback: (newValue: string) => void;
}) {
	const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
	const [isListOpen, setListView] = useState<boolean>(false);

	const toggleDropdown = () => setListView((prevState) => !prevState);
	const updateValue = (newValue: string) => {
		setSelectedValue(newValue);
		toggleDropdown();
		updateCallback(newValue);
	};

	return (
		<>
			<div
				onClick={toggleDropdown}
				className={`bg-transparent transition h-full w-full fixed top-0 left-0 z-[90] ${
					isListOpen ? "block" : "hidden"
				}`}></div>
			<div
				className={`relative ${
					textSize === "text-sm"
						? "min-w-[9rem] max-w-[10.5rem]"
						: textSize === "text-md"
						? "min-w-[10.5rem] max-w-[12rem]"
						: "min-w-[11.5rem] max-w-[13rem]"
				}`}>
				<div
					onClick={toggleDropdown}
					className={`flex items-center bg-transparent text-white transition-opacity duration-300 ${textSize} font-[Flama-Bold] hover:opacity-70 select-none cursor-pointer`}>
					<span className="uppercase mr-2 text-yellow-300">
						{selectedValue}
					</span>
					<FontAwesomeIcon icon={faChevronDown} />
				</div>
				{isListOpen && (
					<div className="optionList rounded-md list-none absolute z-[100] select-none max-h-[160px] overflow-x-hidden overflow-y-auto min-h-[40px] bg-shark-700 top-0 left-0 w-full">
						{optionList.map((option, idx) => {
							return (
								<li
									key={`dropdown-option-${idx}`}
									onClick={() => updateValue(option)}
									className={`pl-4 py-2 leading-[0px] flex-1 cursor-pointer bg-white ${
										option === selectedValue
											? "text-white "
											: "text-shark-100 bg-opacity-0 hover:"
									}bg-opacity-[.05]`}>
									<span
										className={`font-sans ${textSize}${
											option === selectedValue ? " font-medium" : ""
										}`}>
										{option}
									</span>
								</li>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
