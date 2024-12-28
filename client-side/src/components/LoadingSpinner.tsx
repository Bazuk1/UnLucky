function LoadingSpinner({ w, h } : { w?: number; h?: number }) {
    return (
      <div className="spinner" style={{ width: w, height: h}}></div>
    );
  }
  
  export default LoadingSpinner;
  