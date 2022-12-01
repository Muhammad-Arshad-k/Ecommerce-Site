const express = require('express');
const body    = require('body-parser');

require('dotenv').config()

const user = require('../model/userSchema');

const aEmail  = process.env.ADMIN_EMAIL
const aPassword = process.env.ADMIN_
