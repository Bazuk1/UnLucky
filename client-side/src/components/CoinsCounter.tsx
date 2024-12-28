import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../App";

interface CoinsAnimation {
  type: "win" | "lose" | null;
  amount: number | null;
}

function CoinsCounter() {
  const { user, showConfetti } = useContext(GlobalContext);
  const [lastAmount, setLastAmount] = useState<number>(user.coins)
  const [coinsAnimation, setCoinsAnimation] = useState<CoinsAnimation>({
    type: null,
    amount: null,
  });

  useEffect(() => {
    if (lastAmount < user.coins) {
      // Win
      setCoinsAnimation({
        type: "win",
        amount: user.coins-lastAmount,
      });
      showConfetti();
      // console.log("User won:", user.coins-lastAmount)
    } else if (lastAmount > user.coins) {
      // Lose
      setCoinsAnimation({
        type: "lose",
        amount: lastAmount-user.coins,
      });
      // console.log("User lost:", lastAmount-user.coins)
    }
    setLastAmount(user.coins);
  }, [user.coins]);

  useEffect(() => {
    var animationTimeout = setTimeout(() => setCoinsAnimation({
      type: null,
      amount: null,
    }), 1000);

    return () => {
      clearTimeout(animationTimeout);
    }
  }, [coinsAnimation]);

    return (
      <div className="rounded relative bg-black bg-opacity-20 p-2 px-3 md:block hidden">
        <FontAwesomeIcon icon={faCoins} className="text-yellow-400 mr-2" />
        <span className="text-white font-bold font-[UnLucky]">{user.coins.toFixed(2)}</span>
        {
          coinsAnimation.type && 
          <div className={`absolute w-full h-full z-10 bg-shark-900 left-0 flex items-center justify-center coins-${coinsAnimation.type} select-none`}>
            <span className="text-white font-bold text-[1.5rem]">
            {
              coinsAnimation.type === "win" ? <span className="text-green-500 text-[1.8rem]">+</span> 
              : 
              <span className="text-red-500 text-[1.8rem]">-</span>
            }
            {coinsAnimation.amount?.toFixed(2)}
            </span>
          </div>
        }
      </div>
    );
  }
  
  export default CoinsCounter;