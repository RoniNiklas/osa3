const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        JSON.stringify(req.body),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}))
const formatPerson = (person) => {
    return {
        name: person.name,
        date: person.date,
        id: person.id,
        number: person.number,
    }
}
app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person
        .find({})
        .then(people => {
            res.json(people.map(formatPerson))
        })
        .catch(error => {
            console.log(error)
        })
})

app.get('/info', (req, res) => {
    Person.
        find({})
        .then(people => {
            res.json('puhelinluettelossa ' + people.length + ' henkilön tiedot')
        })
        .catch(error => {
            console.log(error)
        })
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (body.name === "") {
        return response.status(400).json({ error: "name missing" })
    }
    if (body.number === "") {
        return response.status(400).json({ error: "number missing" })
    }
    Person
        .find({})
        .then((people) => {
            if (people.some(n => n.name === body.name)) {
                return response.status(400).json({ error: "name must be unique" })
            }
            if (people.length > 0) {
                const biggestId = people.map(n => n.id).sort((a, b, ) => a - b).reverse()[0]
                const person = new Person({
                    name: body.name,
                    number: body.number,
                    id: biggestId + 1,
                    date: new Date()
                })
                person
                    .save()
                    .then((person) => {
                        response.json(formatPerson(person))
                    })
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number,
                    id: 1,
                    date: new Date()
                })
                person
                    .save()
                    .then((person) => {
                        response.json(formatPerson(person))
                    })
            }
        })
        .catch(error => {
            console.log(error)
        })


})

app.put('/api/persons/:id', (request, response) => {

    Person
        .findOne({ id: request.params.id })
        .then(person => {
            person.number = request.body.number
            person.save()
                .then(person => {
                    response.json(formatPerson(person))
                })
        })
        .catch(error => {
            console.log(error)
        })
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findOne({ id: request.params.id })
        .then(person => {
            if (person) {
                response.json(formatPerson(person))
            } else {
                response.status(404).end()
            }

        }).catch(error => {
            console.log(error)
            response.status(400).send({ error: 'malformatted id' })
        })
})

app.delete('/api/persons/:id', (request, response) => {
    /*
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    */

    Person
        .findOneAndRemove({ id: request.params.id })
        .then(result => {
            response.status(204).end()
        })
        .catch(error => {
            response.status(400).send({ error: 'malformatted id' })
        })
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})