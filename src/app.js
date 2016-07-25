/* eslint no-console:0 */

import React, { Component } from 'react'
import { MorphReplace } from 'react-svg-morph';
import Sound from 'react-sound';
import renderIf from 'render-if';
import io from 'socket.io-client'
import Prefixer from 'inline-style-prefixer'

// import NOTES from './notes.js'

const host = 'http://luces-api.lopezjuri.com'

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

class Ball extends Component {

  componentDidMount() {
    if (this.props.note) {
      this.timeout = setTimeout(() => {
        this.props.onDeselect();
      }, 2000)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.note) {
      this.timeout = setTimeout(() => {
        this.props.onDeselect();
      }, 2000)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  render() {
    const { note, onSelect, ...props } = this.props;

    return (
      <div {...props}>
        <div onMouseDown={onSelect} onTouchStart={onSelect} {...props}>
          <MorphReplace width={100} height={100} duration={200}>
            {note ? <Note key="checked" /> : <Circle key="checkbox" />}
          </MorphReplace>
        </div>

        {renderIf(note)(() =>
          <Sound
            url={`/assets/${note.trim().toUpperCase().replace('#', 's')}.mp3`}
            playStatus={Sound.status.PLAYING}
          />
        )}

      </div>
    )
  }
}

const NOTES = [
  'c1',
  'd1',
  'e1',
  'f1',
  'g1',
  'a1',
]

export default class App extends Component {
  state = {
    notes: {},
    selected: NOTES.map(() => false),
  }

  componentDidMount = () => {
    this.socket = io.connect(host, {
      transports: ['websocket', 'polling'],
    })
    this.socket.on('connect', () => {
      console.log('Connected')
    })
    this.socket.on('notes', data => this.update(data))
  }

  onNote = (note, toggle = true) => {
    const options = {
      method: 'POST',
      body: JSON.stringify({ [note]: toggle }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
    return fetch(`${host}/notes`, options)
      .catch(error => this.setState({ error }))
  }

  onMouseDown = (note, isDown) => {
    const notes = { ...this.state.notes }
    notes[note] = isDown
    if (isDown) this.onNote(note, isDown)
    this.setState({ notes });
  }

  update = (data) => {
    // Save to data store
    const notes = { ...this.state.notes, ...data }
    return this.setState({ notes })
  }

  render() {
    const { notes, error } = this.state

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          {NOTES.map((note, i) =>
            <Ball
              key={i}
              note={notes[note] ? note : null}
              onSelect={() => (notes[note] ? null : this.onMouseDown(note, true))}
              onDeselect={() => this.onMouseDown(note, false)}
            />
          )}
        </div>
        {renderIf(error)(() =>
          <div style={styles.error}>
            <p style={{ color: COLORS.GRAY }}>{error.message}</p>
          </div>
        )}
      </div>
    )
  }
}

const prefixer = new Prefixer()
const styles = prefixer.prefix({
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
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginRight: 15,
  },
})
