import { useState } from 'react';
import './App.css';

const Comp = () => {
  return <h1>Hello!</h1>;
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Comp name={'Georg'} children={<h1>Hello!</h1>} />

      <vwc-slotted-components></vwc-slotted-components>

      <vwc-named-slots title={() => 'narrow' + 0} subtitle="Hero">
        <span slot="title">Web components</span>
        <span slot="subtitle">Testing</span>
      </vwc-named-slots>

      <vwc-slotted>Hello there testing</vwc-slotted>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
