import React, { useState, useEffect } from 'react'
import personService from './services/persons'
import Notification from './components/Notification'

const Filter = ({ value, handleChange }) => <div>filter shown with <input value={value} onChange={handleChange} /></div>

const PersonForm = ({ newName, handleNameChange, newNumber, handleNumberChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} /></div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>)
}

const Persons = ({ persons, deletePersonOf }) => persons.map(person => <Person key={person.name} person={person} deletePerson={() => deletePersonOf(person.id)} />)

const Person = ({ person, deletePerson }) => <div>{person.name} {person.number} <button onClick={deletePerson}>delete</button></div>

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [successfulMessage, setSuccessfulMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()

    const nameAlreadyAdded = persons.some((person) => person.name === newName)

    if (nameAlreadyAdded) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(person => person.name === newName)
        const changedPerson = { ...person, number: newNumber }

        personService
          .update(person.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))

            setNewName('')
            setNewNumber('')
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }

      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))

          setNewName('')
          setNewNumber('')

          setSuccessfulMessage(`Added ${returnedPerson.name}`)
          setTimeout(() => {
            setSuccessfulMessage(null)
          }, 3000)
        })
    }
  }

  const deletePersonOf = (id) => {
    const { name } = persons.find(person => person.id === id)
    if (window.confirm(`delete ${name}?`)) {
      personService
        .remove(id)
        .then(status => {
          if (status === 204) {
            setPersons(persons.filter(person => person.id !== id))
          }
        })
        .catch(error => {
          setErrorMessage(`information of ${name} has already been removed from server`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 3000)
          setPersons(persons.filter(person => person.id !== id))
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleNameFilterChange = (event) => {
    setNameFilter(event.target.value)
  }

  const filteredPersons = persons.filter((person) => person.name.toUpperCase().includes(nameFilter.toUpperCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification type='success' message={successfulMessage} />
      <Notification type='error' message={errorMessage} />
      <Filter value={nameFilter} handleChange={handleNameFilterChange} />
      <h3>add a new</h3>
      <PersonForm newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} handleSubmit={addName} />
      <h3>Numbers</h3>
      <Persons persons={filteredPersons} deletePersonOf={(id) => deletePersonOf(id)} />
    </div>
  )
}

export default App
