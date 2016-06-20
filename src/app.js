/* eslint no-console:0 */

import React, { Component } from 'react'
import { MorphReplaceResize } from 'react-svg-morph';
import io from 'socket.io-client'

// import NOTES from './notes.js'

const host = 'http://localhost:3000'

const COLORS = {
  BLACK: '#262626',
  WHITE: '#ECF0F1',
  GRAY: '#808C8D',
}

class Note extends Component {
  static defaultProps = {
    size: 50,
    fill: COLORS.WHITE,
  }

  render() {
    const { size, fill } = this.props;
    return (
      <svg width={size} height={size} fill={fill} viewBox={`0 0 ${size} ${size}`}>
        <g>
          <path d="m37.3 5v25q0 1.1-0.8 2t-1.9 1.3-2.3 0.8-2.2 0.2-2.1-0.2-2.3-0.8-1.9-1.3-0.8-2 0.8-2 1.9-1.3 2.3-0.8 2.1-0.2q2.4 0 4.3 0.9v-12l-17.1 5.3v15.8q0 1.1-0.8 2t-1.9 1.4-2.3 0.7-2.2 0.2-2.1-0.2-2.3-0.7-1.9-1.4-0.8-2 0.8-2 1.9-1.3 2.3-0.7 2.1-0.3q2.4 0 4.3 0.9v-21.6q0-0.7 0.5-1.2t1-0.8l18.6-5.7q0.3-0.1 0.6-0.1 0.9 0 1.6 0.6t0.6 1.5z" />
        </g>
      </svg>
    );
  }
}

class Circle extends Component {
  static defaultProps = {
    size: 50,
    fill: COLORS.GRAY,
  }

  render() {
    const { size, fill } = this.props;
    return (
      <svg width={size} height={size} fill={fill} viewBox={`0 0 ${size} ${size}`}>
        <g>
          <path d="m20.1 5.7q-2.9 0-5.5 1.2t-4.6 3-3 4.6-1.1 5.5 1.1 5.5 3 4.6 4.6 3 5.5 1.2 5.6-1.2 4.5-3 3.1-4.6 1.1-5.5-1.1-5.5-3.1-4.6-4.5-3.1-5.6-1.1z m17.2 14.3q0 4.7-2.3 8.6t-6.3 6.2-8.6 2.3-8.6-2.3-6.2-6.2-2.3-8.6 2.3-8.6 6.2-6.2 8.6-2.3 8.6 2.3 6.3 6.2 2.3 8.6z" />
        </g>
      </svg>
    );
  }
}

const Ball = ({ ball, ...props }) => {
  return (
    <div {...props}>
      <MorphReplaceResize width={100} height={100}>
        {ball ? <Note key="checked" /> : <Circle key="checkbox" />}
      </MorphReplaceResize>
    </div>
  )
}

export default class App extends Component {
  state = {
    notes: {},
    balls: [...Array(6).keys()].map(() => false),
  }

  componentDidMount = () => {
    this.socket = io.connect(host)
    this.socket.on('connect', () => {
      console.log('Connected')
    })
    this.socket.on('notes', data => this.update(data))

    return fetch(`${host}/notes`)
      .then(result => result.json())
      .then(data => this.update(data))
  }

  onNote = (note) => {
    const options = {
      method: 'POST',
      body: JSON.stringify({ [note]: !this.state.notes[note] }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
    return fetch(`${host}/notes`, options)
      .then(result => result.json())
      .then(notes => this.setState({ notes }))
      .catch(error => this.setState({ error }))
  }

  onMouseDown = (index, isDown) => {
    const balls = [...this.state.balls];
    balls[index] = isDown;
    this.setState({ balls });
  }

  update = (data) => {
    // Save to data store
    const notes = { ...this.state.notes, ...data }
    return this.setState({ notes })
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          {this.state.balls.map((ball, i) =>
            <Ball
              key={i}
              ball={ball}
              onMouseDown={() => this.onMouseDown(i, true)}
              onMouseUp={() => this.onMouseDown(i, false)}
              onTouchStart={() => this.onMouseDown(i, true)}
              onTouchEnd={() => this.onMouseDown(i, false)}
            />
          )}
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    backgroundColor: COLORS.BLACK,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // display: 'flex',
    // flex: 1,
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}
