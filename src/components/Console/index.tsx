import { useState } from 'react';
import './style.css';
// import { EventBus } from '../EventBus';

const Console = ({ children }: { children: React.ReactNode }) => {
  const [ isFilterOpen, setIsFilterOpen ] = useState(false);
  
  return (
    <div className="console">
      <div className="base">
        <div className="monitor">
          <div className="monitor-inner" style={{ width: '100%', height: '100%' }}>
            <div className={`filter-greenscreen ${isFilterOpen ? 'active' : ''}`}>
              <div className={`filter-grayscale ${isFilterOpen ? 'active' : ''}`}>
                { children }
              </div>
            </div>
          </div>
        </div>
        <div className="buttons middle">

          <div className="direction">
            <div className="direction-btn-wrapper top">
              <button className="direction-btn top" onClick={() => {}}></button>
            </div>
            <div className="direction-btn-wrapper right">
              <button className="direction-btn right" onClick={() => {}}></button>
            </div>
            <div className="direction-btn-wrapper bottom">
              <button className="direction-btn bottom" onClick={() => {}}></button>
            </div>
            <div className="direction-btn-wrapper left">
              <button className="direction-btn left" onClick={() => {}}></button>
            </div>
          </div>

          <div className="selection">
            <div className="circle-btn-wrapper">
              <button className="circle-btn" onClick={() => {}}>
              </button>
            </div>
            <div className="circle-btn-wrapper">
              <button className="circle-btn" onClick={() => {}}>
              </button>
            </div>
          </div>
        </div>
        <div className="buttons bottom">
          <div className="circle-btn-wrapper">
            <button className="circle-btn special" onClick={() => setIsFilterOpen(!isFilterOpen)}></button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn special" onClick={() => setIsFilterOpen(!isFilterOpen)}></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Console;