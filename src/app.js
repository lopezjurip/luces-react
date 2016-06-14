/* eslint no-console:0 */

import React, { Component } from 'react'
import io from 'socket.io-client'

import NOTES from './notes.js'

const host = 'http://localhost:3000'

export default class App extends Component {
  state = {
    notes: {},
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
    const notes = { ...this.state.notes, ...data };
    return this.setState({ notes });
  }

  render() {
    const { notes, error } = this.state

    if (error) console.log(error)

    return (
      <div className="container">
        <h1>All</h1>
        <div>
          <ul>
            {NOTES.map(note =>
              <li
                key={note}
                onClick={() => this.onNote(note)}
              >
                {note} : {notes[note] ? 'On' : 'Off'}
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}
