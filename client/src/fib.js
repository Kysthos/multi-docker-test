import React, { Component } from 'react'
import axios from 'axios'

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ''
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  async fetchValues() {
    const { data: values } = await axios.get('/api/values/current')
    console.log(values)
    this.setState({ values })
  }

  async fetchIndexes() {
    const { data: seenIndexes } = await axios.get('/api/values/all')
    this.setState({ seenIndexes })
  }

  renderSeenIndexes() {
    return [...new Set(this.state.seenIndexes.map(({ number }) => number))].sort((a, b) => a - b).join(', ')
  }

  renderValues() {
    const entries = []
    for (const [key, val] of Object.entries(this.state.values))
      entries.push(
        <div key={key}>
          For index {key} I calculated {val}
        </div>
      )
    return entries
  }

  handleSubmit = async event => {
    event.preventDefault()

    await axios.post('/api/values', {
      index: this.state.index
    })

    await Promise.all([this.fetchIndexes(), this.fetchValues()])

    this.setState({ index: '' })
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values:</h3>
        {this.renderValues()}
      </div>
    )
  }
}

export default Fib