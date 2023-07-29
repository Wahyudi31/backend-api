import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/UserModel.js";

export const getUsers = async(req, res) =>{
    try {
        const users = await Users.findAll({
            attributes:['id','nama','email']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const Register = async(req, res) =>{
    const { nama, email, password, confPassword } = req.body;
    if(password !== confPassword) return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            nama: nama,
            email: email,
            password: hashPassword,
        });
        res.status(200).json({msg: "Register Berhasil!!!"});
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const Login = async(req, res) =>{
    try {
        const user = await  Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "PASSWORD SALAH!!!"});
        const userId = user[0].id;
        const nama = user[0].nama;
        const email = user[0].email;
        const accessToken = jwt.sign({userId, nama, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '1h'
        });
        const refreshToken = jwt.sign({userId, nama, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        await Users.update({refresh_token:refreshToken},{
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({msg: "Email Tidak Di temukan!!!"});
    }
}

export const Logout = async(req, res) =>{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where:{
            refresh_token: refreshToken
        }
    });
    if(!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({refresh_token: null},{
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}