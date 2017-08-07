var React = require('react');
var WordSelect = require('./WordSelect');

class App extends React.Component {
  render() {
    return (
      <div className='container'>
         <WordSelect />
      </div>
    );
  }
}

module.exports = App;
