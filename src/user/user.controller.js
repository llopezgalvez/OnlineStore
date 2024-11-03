'use strict'

import User from './user.model.js'
import { generateJwt } from '../utils/generateToken.js'
import { checkPassword, encrypt, checkUpdate } from '../utils/validator.js'

export const register = async (req, res) => {
    try {
        let data = req.body
        data.password = await encrypt(data.password)

        let existsUsername = await User.findOne({ username: data.username })
        if (existsUsername) return res.status(409).send({ message: 'Username already exists' })

        let existsMail = await User.findOne({ mail: data.mail })
        if (existsMail) return res.status(409).send({ message: 'Mail already exists' })

        let user = new User(data)
        await user.save()
        return res.send({ message: 'Registered successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering user' })
    }
}

export const login = async (req, res) => {
    try {
        let { username, password, mail } = req.body
        let user = await User.findOne({ $or: [{ username: username }, { mail: mail }] })
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            return res.send({
                message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Failed to  login' })
    }
}

export const update = async (req, res) => {
    try {
        let { id } = req.params //ID del usaurio
        let userID = req.user.id
        let userRole = req.user.role
        let data = req.body

        if (userRole === 'ADMIN') {
            let update = checkUpdate(data, id)
            if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })

            let updateUser = await User.findOneAndUpdate(
                { _id: id },
                data,
                { new: true }
            )
            if (!updateUser) return res.status(401).send({ message: 'User not found and not updated' })

            return res.send({ message: 'Updated user', updateUser })
        } else {
            if (userID == id) {
                let update = checkUpdate(data, id)
                if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })

                let updateUser = await User.findOneAndUpdate(
                    { _id: id },
                    data,
                    { new: true }
                )
                if (!updateUser) return res.status(401).send({ message: 'User not found and not updated' })

                return res.send({ message: 'Updated user', updateUser })
            } else {
                return res.status(403).send({ message: 'You do not have permission to edit another user' })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating account' })
    }
}

export const deleteU = async (req, res) => {
    try {
        let { id } = req.params
        let userID = req.user.id
        let userRole = req.user.role

        if (userRole === 'ADMIN') {
            let deleteUser = await User.findOneAndDelete({ _id: id })
            if (!deleteUser) return res.status(404).send({ message: 'Account not found and not deleted' })
            return res.status(200).send({ message: `Account with username ${deleteUser.username} deteled successfully` })
        } else {
            if (userID == id) {
                let deleteUser = await User.findOneAndDelete({ _id: id })
                if (!deleteUser) return res.status(404).send({ message: 'Account not found and not deleted' })
                return res.status(200).send({ message: `Account with username ${deleteUser.username} deteled successfully` })
            } else {
                return res.status(403).send({ message: 'You do not have permission to delete another user' })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const listUser = async (req, res) => {
    try {
        let users = await User.find().populate({ path: 'shoppingCart.product', select: '-_id name' })
        if (users.length == 0) return res.status(404).send({ message: 'Not found' })
        return res.send({ users })
    } catch (error) {
        console.error(error)
        return res.status(401).send({ message: 'Error getting user' })
    }
}

export const searchUser = async (req, res) => {
    try {
        let { search } = req.body
        let user = await User.find({
            $or: [
                { name: search },
                { username: search }
            ]
        })
        if (user.length == 0) return res.status(404).send({ message: 'User not found' })
        return res.send({ message: 'User found', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching user' })
    }
}