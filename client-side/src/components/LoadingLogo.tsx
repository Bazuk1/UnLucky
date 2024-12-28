const logobw = `${process.env.PUBLIC_URL}/logobw.png`

function LoadingLogo() {
    return (
        <div className="loading-container h-[100px] relative flex items-center justify-center" style={{ WebkitMaskImage: `url("${logobw}")` }}>
        <div className="transition-box"></div>
        <img src={logobw} alt="Logo"></img>
      </div>
    );
  }
  
  export default LoadingLogo;
  