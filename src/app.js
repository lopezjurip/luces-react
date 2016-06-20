/* eslint no-console:0 */

import React, { Component } from 'react'
import io from 'socket.io-client'

import NOTES from './notes.js'

const host = 'http://localhost:3000'

const Ball = (props) => {
  return (
    <h1 style={{ color: 'white' }}>Hello</h1>
  )
}

export default class App extends Component {
  state = {
    notes: {},
    balls: [...Array(6).keys()],
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

  update = (data) => {
    // Save to data store
    const notes = { ...this.state.notes, ...data }
    return this.setState({ notes })
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          {this.state.balls.map(ball =>
            <Ball key={ball} />
          )}
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    backgroundColor: 'black',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}
