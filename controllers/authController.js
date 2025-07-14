const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;

        // 1. Validate fields
        if (!name || !mobile || !email || !password) {
            return res.status(400).json({
                statusCode: 400,
                message: "All fields (name, mobile, email, password) are required"
            });
        }

        // 2. Check for existing user by mobile or email
        const existingUser = await User.findOne({
            $or: [{ mobile }, { email }]
        });

        if (existingUser) {
            return res.status(409).json({
                statusCode: 409,
                message: "Mobile number or Email already registered"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save new user
        const newUser = new User({
            name,
            mobile,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // 5. Respond without password
        res.status(201).json({
            statusCode: 201,
            message: "User registered successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                mobile: newUser.mobile,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Server error",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
        return res.status(400).json({
            statusCode: 400,
            message: "Mobile and password are required"
        });
    }

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                message: "Incorrect password"
            });
        }

        const userData = {
            id: user._id,
            name: user.name,
            mobile: user.mobile
        };

        res.status(200).json({
            statusCode: 200,
            message: "Login successful",
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Server error",
            error: error.message
        });
    }
};

const matchContacts = async (req, res) => {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
        return res.status(400).json({
            statusCode: 400,
            message: "Contacts array is required",
        });
    }

    try {
        const matchedUsers = await User.find({
            mobile: { $in: contacts },
        }).select('name mobile _id'); // Only return required fields

        res.status(200).json({
            statusCode: 200,
            users: matchedUsers.map(user => ({
                userId: user._id,
                name: user.name,
                mobile: user.mobile,
            })),
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Server error",
            error: error.message,
        });
    }
};


module.exports = { registerUser, loginUser, matchContacts };
