import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import FormGroup from 'react-bootstrap/FormGroup'
import FormLabel from 'react-bootstrap/FormLabel'
import Toast from 'react-bootstrap/Toast'
import Spinner from 'react-bootstrap/Spinner'
import { motion } from 'framer-motion/dist/framer-motion'
import { FaLock, FaBookReader, FaUser } from 'react-icons/fa'
import { IoMdMail } from 'react-icons/io'
import './login.css'

const toastMessages = ['Please fill in all fields !', 'invalid email format', 'invalid email/password', 'signup successful', 'email already registered']

export default function Login({ setData }) {
    const [showToast, setShowToast] = useState(false);  // toast for siplaying error messages
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [showSigninSpinner, setShowSigninSpinner] = useState(false);
    const [showSignupSpinner, setShowSignupSpinner] = useState(false);
    const [toastMessage, setToastMessage] = useState(toastMessages[0]);
    const [toastVariant, setToastVariant] = useState('danger');
    const [spinnerVariant, setSpinnerVariant] = useState('warning');

    async function validateLogin(e) {   // VALIDATE LOGIN DETAILS
        e.preventDefault();
        let email = document.querySelector('#email').value;
        let password = document.querySelector('#password').value;

        // validate email format
        let regExp = new RegExp('[a-z0-9]+@[a-z]+[.][a-z]{2,3}');
        let result = regExp.test(email);

        setToastVariant('danger');
        if (!email || !password) {  // if email or password field is empty, report error
            setToastMessage(toastMessages[0]);
            setShowToast(true);
            return 0;
        }
        if (!result) {  // report error if email format is invalid
            setToastMessage(toastMessages[1]);
            setShowToast(true);
            return 0;
        }
        
        else {
            e.target.disabled = true;
            document.querySelector('.sign_div').style.visibility = 'hidden';
            setShowToast(false);
            setShowSigninSpinner(true);
            try {
                const response = await fetch('https://handy-notes.herokuapp.com/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                const data = await response.json();

                e.target.disabled = false;
                setShowSigninSpinner(false);
                // pass data fields up to App.js
                if (data) {
                    setData(data.userName, data.email, data.notes);
                }
                // if a null json object is passed, user is unregistered
                else {
                    setToastMessage(toastMessages[2])   // message: invalid email/password
                    setShowToast(true);
                    document.querySelector('.sign_div').style.visibility = 'visible';
                }
            } catch (e) { console.log(e.message) }
        }
    }
    // validate signup details
    async function validateSignup(e) {
        e.preventDefault();
        let userName = document.querySelector('#userName').value;
        let email = document.querySelector('#email').value;
        let password = document.querySelector('#password').value;

        // validate email format
        let regExp = new RegExp('[a-z0-9]+@[a-z]+[.][a-z]{2,3}');
        let result = regExp.test(email);
        console.log('res: ', result);

        setToastVariant('danger');
        if (!userName || !email || !password) {     // if email or password field is empty, report error
            setToastMessage(toastMessages[0])       // message: please fill all fields
            setShowToast(true);
            return 0;
        }
        if (!result) {  // report error if email format is invalid
            setToastMessage(toastMessages[1])   // message: invalid email format
            setShowToast(true);
            return 0;
        }
        else {
            e.target.disabled = true;
            document.querySelector('.sign_div').style.visibility = 'hidden';
            setShowSignupSpinner(true);
            try {
                const response = await fetch('https://handy-notes.herokuapp.com/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userName: userName,
                        email: email,
                        password: password
                    })
                });
                const data = await response.json();

                e.target.disabled = false;
                setShowSignupSpinner(false);

                if (data.successful) {
                    setToastMessage(toastMessages[3]);  // message: signup successful
                    setToastVariant('success');         // toast dackground: green
                    setShowToast(true);
                    setShowSignupForm(false);           // return to login page
                    document.querySelector('.sign_div').style.visibility = 'visible';
                }
                else {
                    setToastMessage(toastMessages[4]);  // message: eamil already registered
                    setToastVariant('danger');         // toast dackground: green
                    setShowToast(true);
                    document.querySelector('.sign_div').style.visibility = 'visible';
                }
            } catch (e) {console.log(e.message)}
        }
    }

    return (
        <motion.div className='login_container' exit={{ x: '-100vw', transition: { duration: 0.6, ease: 'easeInOut' } }}>
            <Container>
                <Row>
                    <div className='login_form'>
                        <div className='input_section offset-lg-2 offset-md-1 col-lg-4 col-md-5 col-sm-12'>
                            <Toast className='toast'
                                bg={toastVariant} onClose={() => setShowToast(!showToast)}
                                show={showToast}
                                autohide
                                delay={3000}>
                                <Toast.Body>
                                    {toastMessage}
                                </Toast.Body>
                            </Toast>
                            {showSignupForm ?
                                <div className='sign_up_text'>Sign Up</div> :
                                <div className='handy_notes'>Handy Notes</div>
                            }
                            {showSignupForm ? '' : <div className='logo'><FaBookReader /></div>}
                            <Form>
                                {showSignupForm ?
                                    <FormGroup className='form_group'>
                                        <FormLabel htmlFor='userName'>User Name</FormLabel>
                                        <div className='logo_input'>
                                            <FaUser className='icon' />
                                            <Form.Control type='text' maxLength='12' name='userName' id='userName' placeholder='El-Dorado' />
                                        </div>
                                    </FormGroup> : ''
                                }
                                <FormGroup className='form_group'>
                                    <FormLabel htmlFor='email'>Email Address</FormLabel>
                                    <div className='logo_input'>
                                        <IoMdMail className='icon' />
                                        <Form.Control type='email' name='email' id='email' placeholder='dash@example.com' />
                                    </div>
                                </FormGroup>
                                <FormGroup className='form_group'>
                                    <FormLabel htmlFor='password'>Password</FormLabel>
                                    <div className='logo_input'>
                                        <FaLock className='icon' />
                                        <Form.Control type='password' name='password' id='password' placeholder='1qwerty6' />
                                    </div>
                                </FormGroup>

                                {showSignupForm ?
                                    <Button className='sign_up' onClick={validateSignup} type='submit'>
                                        Signup
                                        {showSignupSpinner ?
                                            <Spinner animation='border' role='status' variant='primary' size='sm' className='spinner' /> : ''
                                        }
                                    </Button> :
                                    <Button className='sign_in' onClick={validateLogin} type='submit'>
                                        Login
                                        {showSigninSpinner ?
                                            <Spinner animation='border' role='status' variant='warning' size='sm' className='spinner' /> : ''
                                        }
                                    </Button>
                                }
                                <div className='signup_div'>
                                    {showSignupForm ?
                                        <span className='sign_div'>Already have an account ? <span className='sign_in_span' onClick={() => setShowSignupForm(false)}>Signin</span></span> :
                                        <span className='sign_div'>New here ? Please <span className='sign_up_span' onClick={(e) => setShowSignupForm(true)}>Signup</span></span>
                                    }
                                </div>
                            </Form>
                        </div>
                        <div className='info_section col-lg-4 col-md-5 col-sm-12'>
                            <div>
                                <div className='logo'>
                                    <FaBookReader />
                                </div>
                                <div className='hello'>Hello,</div>
                                <div className='description'>record all your important notes on <br /> <span>Handy Notes</span> and access them anywhere</div>
                            </div>
                        </div>
                    </div>
                </Row>
            </Container>
        </motion.div >
    )
}