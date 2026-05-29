import express from 'express'

import { getDBConnection } from '../db/db.js'

export async function getAvatars(req,res){

    const userid = req.session.userId
    const db = await getDBConnection()
    try {

        const getdata = await db.all(`SELECT * FROM avatars WHERE user_id = ? `,[userid])
        res.status(200).json({ avatars: getdata })

    }catch(err){
        res.status(500).json({error : err.message })
    }

}

export async function saveAvatar(req,res){

    const userid = req.session.userId
    let {imageUrl , prompt } = req.body
    const db = await getDBConnection()
    try {

        const insertdata = await db.run(`INSERT INTO avatars (image_url , prompt , user_id ) VALUES(?,?,?)`,[imageUrl, prompt, userid])
        res.status(201).json({ message: 'Avatar saved' } )

    }catch(err){
        res.status(500).json({error : err})
    }
}