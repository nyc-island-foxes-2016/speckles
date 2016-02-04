'use strict';
import React, {
  Component,
  Text,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';
import Board from './Board';
import Dot from './Dot';
import MultipeerConnectivity from 'react-native-multipeer'
import styles from './stylesheet';

var REQUEST_URL = 'http://localhost:3000'
var POST_NEW_GAME = '/games'

class JoinGame extends Component {
  constructor(props) {
    super(props);
    this.state = {board: new Board(), letterPath: ''};
  }


  swap() {
    MultipeerConnectivity.send(
      [this.props.peer],
      {readyToStart: true, peer: this.props.peer},
      console.log('peer when sending readyToStart', this.props.peer)
    );
    console.log('sending start message to ', this.props.peer);
    this.props.navigator.replace({
      id: 'GameView',
      gameId: this.state.gameId,
      player: this.state.player,
      peer: this.props.peer,
      playerPath: this.state.letterPath
    });
  }

  setupPlayerTwo() {
    var update_url = REQUEST_URL + POST_NEW_GAME + '/' + this.props.gameId + '/accept';

    fetch(update_url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: this.props.gameId,
        player: 'Game-' + Math.round(1e6 * Math.random()),
        board: this.state.letterPath
      })
    })
    .then((response) => response.json())
    .then((responseData) => {
      this.setState({
        player: responseData.player,
        gameId: responseData.gameId
      });
      this.swap();
    });
  }

  handleDotClick(row: number, col: number, letter: char) {
    if(this.state.board.isClicked(row, col)) {
      return;
    }

    var letterPath = this.state.letterPath;

    this.setState({
      board: this.state.board.mark(row, col),
      letterPath: letterPath + letter
    });
  }

  render() {
    var letterSet = ['D', 'C', 'B', 'A'];

    var rows = this.state.board.grid.map((dots, row) =>
      <View key={row} style={styles.row}>
        {dots.map((clicked, col) =>
          <Dot
            key={col}
            clicked={clicked}
            onPress={this.handleDotClick.bind(this, row, col, letterSet.pop())}/>
        )}
      </View>
    );

    return (
      <View style={styles.container}>
        <Text style={styles.boardInstructions}>
        Your opponent is ready.
        </Text>
        <Text style={styles.boardInstructions}>
        Set your dot pattern and submit to play.
        </Text>
        <View>
          {rows}
        </View>
        <TouchableHighlight onPress={this.swap.bind(this)}>
          <Text style={styles.boardButton}>
            Submit Board
          </Text>
        </TouchableHighlight>
      </View>
    );
  }

}

module.exports = JoinGame;
