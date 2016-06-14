/* eslint no-console:0 */

import React, { Component } from 'react'
import io from 'socket.io-client'

import NOTES from './notes.js'

const host = 'http://localhost:3000'

export default class App extends Component {
  state = {
    notes: [],
  }

  componentDidMount = () => {
    this.socket = io.connect(host)
    this.socket.on('connect', () => {
      console.log('Connected')
    })
    return fetch(`${host}/notes`)
      .then(result => result.json())
      .then(notes => this.setState({ ...this.state.notes, ...notes }))
  }

  onNote = (note) => fetch(`${host}/notes`, {
    method: 'POST',
    body: JSON.stringify({ [note]: true }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .catch(error => this.setState({ error }))

  render() {
    const { notes, error } = this.state

    if (error) console.log(error)

    return (
      <div className="container">
        <h1>All</h1>
        <div>
          <ul>
            {NOTES.map(note =>
              <li key={note} onClick={() => this.onNote(note)}>{note}</li>
            )}
          </ul>
        </div>
        <h1>Selected</h1>
        <div>
          <ul>
            {notes.map(note =>
              <li key={note} onClick={() => this.onNote(note)}>{note}</li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}
