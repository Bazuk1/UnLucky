import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

const Confetti = ({ display, setDisplay } : { display: boolean, setDisplay: () => void }) => {
    const [windowDims, setDims] = useState<{ width: number, height: number}>({
        width: window.innerWidth,
        height: window.innerHeight
    })
    
    const updateDims = () => {
        setDims({
            width: window.innerWidth,
            height: window.innerHeight
        })
    }

    useEffect(() => {
        window.addEventListener("resize", updateDims);
        return () => window.removeEventListener("resize", updateDims);
    }, [])

    return (
        <>
        {
            display &&
            <ReactConfetti
                recycle={false}
                numberOfPieces={1000}
                width={windowDims.width}
                height={windowDims.height}
                onConfettiComplete={setDisplay}
            />
        }
        </>
    )
}

export default Confetti;