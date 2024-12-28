import { GlobalContext } from "../App";
import { useContext, useState } from "react";
import { SubmitBtn, TextInput } from "../components/Components";
import { DefaultInstance } from "../utils/serverConnection";
import LoadingLogo from "./LoadingLogo";

function LoginForm({ display }: { display: boolean }) {
	const { loginForm, alert } = useContext(GlobalContext);

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const [showSuccess, setShowSuccess] = useState<boolean>(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.target.name === "username"
			? setUsername(e.target.value)
			: setPassword(e.target.value);
	};

	const loginUser = () => {
		if (password.length > 0 && username.length > 0) {
			console.log("Attempting To Login...");
			DefaultInstance.post("/login", {
				credentials: {
					username: username,
					password: password,
				},
			})
				.then(async (response) => {
					if (response.status === 200) {
						console.log("Acquired Refresh Token");
						console.log("New refToken:", response.data.refToken);
						localStorage.setItem("refToken", response.data.refToken);
						alert.setAlertCode("login_success");
						setShowSuccess(true);
						setTimeout(() => window.location.reload(), 3000);
					} else {
						console.log("Bad login =>", response.status);
						alert.setAlertCode("login_failure");
					}
				})
				.catch((error) => {
					console.log(
						`Bad login => ${error.response ? error.response.status : "error"}`
					);
					console.error(error);
					alert.setAlertCode("login_failure");
				});
		}
	};

	return (
		<>
			<div
				onClick={loginForm.toggleLoginForm}
				className={`bg-black opacity-40 transition h-full w-full fixed top-0 z-[90] ${
					display ? "block" : "hidden"
				}`}></div>
			{showSuccess ? (
				<div
					className={`bg-shark-800 fixed top-1/2 left-1/2 z-[100] text-white p-12 rounded shadow-popup flex flex-col items-center transform-fixed ${
						display ? "block" : "hidden"
					}`}>
					<LoadingLogo />
				</div>
			) : (
				<form
					autoComplete="off"
					className={`bg-shark-800 fixed top-1/2 left-1/2 z-[100] text-white p-12 rounded shadow-popup flex flex-col items-center transform-fixed ${
						display ? "block" : "hidden"
					}`}>
					<span className="font-bold text-4xl mt-2 mb-6 select-none">
						Login
					</span>
					<div className="flex flex-col mb-4 space-y-2">
						<TextInput
							inputType="text"
							inputName="username"
							currentValue={username}
							handleInputChange={handleInputChange}
							placeholder="Username"
						/>
						<TextInput
							inputType="password"
							inputName="password"
							currentValue={password}
							handleInputChange={handleInputChange}
							placeholder="Password"
						/>
					</div>
					<SubmitBtn text="LOGIN" clickEvent={loginUser} />
				</form>
			)}
		</>
	);
}

export default LoginForm;
