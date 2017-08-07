var React = require('react');
var PropTypes = require('prop-types');
var Loading = require('./Loading');
import dictionary from '../../dictionary.js';
import letters from '../../letters2.json';
import Dawg from 'dawg-set';

class RackInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rack: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    var value = event.target.value;
    if (value.length > 7) {
      //Rack may not contain more than 7 letters;
    }
    else {
      this.setState(function () {
        return {
          rack: value
        }
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.onSubmit(
      this.props.rack
    )
  }

  render() {
    return (
      <div className='column' onSubmit={this.handleSubmit}>
        <label className='header' htmlFor='rackInput'>
          {this.props.label}
        </label>
        <input
          id={this.props.id}
          placeholder={this.props.placeholder}
          type='text'
          autoComplete='off'
          value={this.state.rack}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

class WordInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      word: ''
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    event.preventDefault();
    var value = event.target.value;
    if (value.length > 14) {
      //Word may not contain more than 14 letters
    }
    else {
      this.setState(function () {
        return {
          word: value
        }
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.onSubmit(
      this.props.word,
    )
  }

  render() {
    return (
      <div className='column' onSubmit={this.handleSubmit}>
        <label className='header' htmlFor='wordInput'>
          {this.props.label}
        </label>
        <input
          id={this.props.id}
          placeholder={this.props.placeholder}
          type='text'
          autoComplete='off'
          value={this.state.word}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

RackInput.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  //onChange: PropTypes.func.isRequired,
  //onSubmit: PropTypes.func.isRequired,
}

class WordSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      rack: '',
      word: '',
      score: '',
      dictionary: []
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const dictionaryArray = dictionary.split('\n');
    this.setState(function () {
      return {
        dictionary: Dawg.from(dictionaryArray.sort())
      }
    });
  }

  findPermutations(inputArr, callback) {
      let result = [];

      return new Promise(function(resolve, reject) {
        const permute = (arr, m = []) => {
          if (arr.length === 0) {
            result.push(m)
          } else {
            for (let i = 0; i < arr.length; i++) {
              let curr = arr.slice();
              let next = curr.splice(i, 1);
              permute(curr.slice(), m.concat(next))
          }
        }
      }

      permute(inputArr)
      resolve(result);
    });
  }

  verifyRackLetterCount(word) {
    var result;
    for (var i = 0; i < word.length; i++) {
      let regex = new RegExp(word[i], 'g');
      if (word.match(regex).length > letters[word[i].toUpperCase()].count) {
        result = false;
      } else {
        result = true;
      }
    }
    return result;
  }

  compareLetterCounts(rack, word) {
    let result = true;
    for (var i = 0; i < rack.length; i++) {
      let current = rack[i];
      let rackRegex = new RegExp(rack[i], 'g');
      let rackCount = rack.match(rackRegex).length;
      for (var j = 0; j < word.length; j++) {
        if (current === word[j]) {
          let wordRegex = new RegExp(word[j], 'g');
          let wordCount = word.match(wordRegex).length;
          if (rackCount + wordCount > letters[current.toUpperCase()].count) {
            result = false;
          }
        }
      }
    }
    return result;
  }

  handleChange(key) {

    return function (e) {
      var value = e.target.value;
      var state = {};
      const re = /[a-zA-Z]/g;
      state[key] = value;

      this.setState(function () {
        return {
          error: '',
          score: ''
        }
      });

      var verifyLetter = (letter) => {
        const re = /^[a-zA-Z]+$/g;
        return re.test(letter);
      }

      if (key === 'rack') {
        if (value.length <= 7 && value.length + this.state.word.length <= 15 && verifyLetter(value) || value === '') {
          this.setState(state);
        }
      } else if (key === 'word') {
        if (value.length <= 14 && value.length + this.state.rack.length <= 15 && verifyLetter(value) || value === '') {
          this.setState(state);
        }
      }
    }.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.word && this.verifyRackLetterCount(this.state.rack)) {
      this.findPermutations(this.state.rack.split(''))
        .then((permutations) => {
          let highScore = 0;
          for (var perm in permutations) {
            let score = 0;
            for (var letter in permutations[perm]) {
              score += letters[permutations[perm][letter].toUpperCase()].score;
            }
            if (score > highScore) {
              highScore = score;
            }
          }
          this.setState(function () {
            return {
              score: highScore
            }
          });
        })
    }
    else if (this.state.dictionary.has(this.state.word.toUpperCase()) &&
      this.compareLetterCounts(this.state.rack, this.state.word)) {
        this.findPermutations(this.state.rack.split(''))
          .then((permutations) => {
            let highScore = 0;
            let success = false;
            for (var i=0; i < permutations.length; i++) {
            };
            for (var perm in permutations) {
              let currentPerm = this.state.word.toUpperCase() + permutations[perm].join('').toUpperCase();
              if (this.state.dictionary.has(currentPerm)) {
                success = true;
                let score = 0;
                for (var letter in currentPerm) {
                  console.log()
                  score += letters[currentPerm[letter]].score;
                }
                if (score > highScore) {
                  highScore = score;
                }
              }
            }

            if (success) {
              this.setState(function () {
                return {
                  score: highScore
                }
              });
            } else {
              this.setState(function () {
                return {
                  error: 'Sorry! No word in the dictionary matches that combination.'
                }
              });
            }
          })
    } else if (!this.state.dictionary.has(this.state.word.toUpperCase())){
      this.setState(function () {
        return {
          error: 'Sorry! The word you entered is not in the dictionary.'
        }
      });
    } else if (!this.compareLetterCounts(this.state.rack, this.state.word)) {
      this.setState(function () {
        return {
          error: 'Sorry! A letter has been used too many times.'
        }
      });
    }

  }

  render() {

    return (
      <div>
        <h1 className='headline'>Scrabble Lite: Find the highest scoring word!</h1>
        <form className='column'>
          <label className='header' htmlFor='rackInput'>
            Rack
          </label>
          <input
            id='rackInput'
            type='text'
            autoComplete='off'
            placeholder="Up to 7 letters" onSubmit={this.handleSubmit}
            value={this.state.rack}
            onChange={this.handleChange('rack')}
          />
          <label className='header' htmlFor='wordInput'>
            Word
          </label>
          <input
            id='wordInput'
            type='text'
            autoComplete='off'
            placeholder="Between 2-14 letters" onSubmit={this.handleSubmit}
            value={this.state.word}
            onChange={this.handleChange('word')}
          />
          <label className='error' htmlFor='wordInput' style={{color: 'red', fontSize: '15px', fontWeight: '300'}}>
            {this.state.error}
          </label>
          <button
            className='button'
            type='submit'
            disabled={!this.state.rack}
            onClick={this.handleSubmit}
          >
          Submit
          </button>
          <label className='success' htmlFor='wordInput' style={{color: 'green', fontSize: '25px', fontWeight: '300'}}>
            {this.state.score ? `Nice! That's a score of ${this.state.score}` : ''}
          </label>
        </form>
      </div>
    );
  }
}

module.exports = WordSelect;
