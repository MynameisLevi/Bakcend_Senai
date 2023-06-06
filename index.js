import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import express from 'express'
var router = express.Router();

import jwt from 'jsonwebtoken'

import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

const port = 3000

app.use(cors())
app.use(express.json())



router.use(async function (req, res, next) {

    if (!req.headers.authorization) {
        return next(createError.Unauthorized('Access token is required'))
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return next(createError.Unauthorized())
    }
    await jwt.verifyAccessToken(token).then(user => {
        req.user = user
        next()
    }).catch(e => {
        next(createError.Unauthorized(e.message))
    })
    next()
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        }
    })

    if (!user) {
        return res.status(500)
    }

    if (user.password == password) {

        const id = user.id

        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 3000 // expires in 50min
        })

        return res.status(200).send({"token":token})
    }

    return res.status(500)

})

app.post('/criar', async (req, res) => {

    const { email, password } = req.body

    const verify_user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (verify_user){
        return res.status(500).send("Usuario já existente !")
    }

    const user = await prisma.user.create({
        data: {
            email: email,
            password: password,
        }
    })

    return res.status(200).send(user)
})

app.delete('/user/:id', async (req, res) => {
    const { id } = req.params

    console.log(req.params.id)

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    })

    if (!user) {
        return res.status(400).send('Usuario não consta no banco de dados')
    }

    const deleteUser = await prisma.user.delete({
        where: {
            id,
        },
    })

    return res.status(200).send('Usuario Deletado')
})

app.get('/listar', (req, res) => {
    res.send('Hello World!')
})

app.put('/detalhar', (req, res) => {
    res.send('Hello World!')
})

app.delete('/remover', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})