import React, { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Toast from 'react-bootstrap/Toast'
import Spinner from 'react-bootstrap/Spinner'
import Note from '../Note/Note'
import { FaBookReader, FaSearch, FaTelegram } from 'react-icons/fa'
import { IoMdMenu, IoMdArrowDropdown} from 'react-icons/io'
import { IconContext } from 'react-icons'
import { motion } from 'framer-motion/dist/framer-motion'
import './notes.css'

const containerVariants = {
    hidden: {
        x: '100vw'
    },
    visible: {
        x: 0,
        transition: {
            duration: 0.3,
            ease: 'easeInOut',
            staggerChildren: 1,
            when: 'beforeChildren'
        }
    }
}
const childrenVariants = {
    hidden: {
        opacity: 0, scale: 0.7,
    },
    visible: {
        opacity: 1, scale: 1,
        transition: {
            duration: 0.2
        }
    }
}

const toastMessages = ['Note added', 'Note updated !', 'Note deleted !'];

export default function Notes({ sortNotes }) {
    // toggles between add note screen and notes list, depending on whether or not notes array is empty
    const [noNotes, setNoNotes] = useState(false);
    // make notes array stateful to cause a re-render when a note is added, deleted or edited
    const [notes_s, setNotes_s] = useState([]);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');

    const [filteredNotes_s, setFilteredNotes_s] = useState([]); // contains filtered notes based on search
    const [showFiltered, setShowFiltered] = useState(false);

    const [noteId, setNoteId] = useState('');   // note id of selected note
    const [noteTitle, setNoteTitle] = useState(''); // note title of selected note
    const [note, setNote] = useState('');   // note body of selected note

    const [textAreaValue, setTextAreaValue] = useState(note);   // note body in textarea of edit modal
    const [titleAreaValue, setTitleAreaValue] = useState(noteTitle);    // note title in text field of edit modal 

    const [showEditModal, setShowEditModal] = useState(false);  // toggle for note editing modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);  // toggle for note deletion modal
    const [showAddModal, setShowAddModal] = useState(false);    // toggle for note addition modal

    const [showSpinner, setShowSpinner] = useState(false);    // toggle for note addition modal
    const [toastMessage, setToastMessage] = useState(toastMessages[0]);
    const [changesMade, setChangesMade] = useState(false);    // only send update request if changes are made
    const [showModalToast, setshowModalToast] = useState(false);    //
    const [showSuccessToast, setShowSuccessToast] = useState(false);    //

    // get note list from local storage on page refresh
    useEffect(() => {
        let getLocalSave = JSON.parse(localStorage.getItem('local save'));  // contains email, username and notes
        if (getLocalSave) {
            setUserName(getLocalSave.userName)
            setEmail(getLocalSave.email);
            setNotes_s(getLocalSave.notes);
        }
        // console.log('props notes: ', )
    }, [])

    useEffect(() => {
        if (notes_s.length === 0) setNoNotes(true);
        else setNoNotes(false);
    }, [notes_s]);

    // handle filtering of notes based on search
    function handleSearch(e) {
        // console.log(e.target.value);
        let searchToken = e.target.value;

        if (searchToken === '') {
            setShowFiltered(false);
            console.log(0)
        }
        else {
            let matched = notes_s.map(note => {
                if (note.noteTitle.includes(searchToken)) { return note }
                // console.log(note);
            }).filter(note => { // filter 'undefined' entries from 'matched' array
                if (!note) return false;
                return true;
            });
            console.log(matched);
            setFilteredNotes_s(matched);
            setShowFiltered(true);
        }
    }

    // save new note to database
    async function handleAddNote(e) {
        let noteTitle = document.querySelector('.title_area').value;
        let note = document.querySelector('.text_area').value;
        if (noteTitle.length !== 0 && note.length !== 0) {   // prrocess add request only if note title and note body is provided
            e.target.disabled = true;
            document.querySelector('.cancel_btn').disabled = true;
            setShowSpinner(true);
            try {
                const response = await fetch('https://handy-notes.herokuapp.com/addnote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: email,
                        noteTitle: noteTitle,
                        note: note,
                    })
                });
                const data = await response.json();
                if (data) {
                    setShowAddModal(false);
                    saveToLocalStorage(data.notes);
                    e.target.disabled = false;
                    document.querySelector('.cancel_btn').disabled = true;
                    setShowSpinner(false);
                    setToastMessage(toastMessages[0]); // messsage: note added
                    setShowSuccessToast(true);
                }
            } catch (error) { console.log(error.message) }
        }
        else {
            setshowModalToast(true);
        }
    }

    // save the note to database and get new array of notes. Re-render notes list
    async function handleUpdate(e) {
        if (titleAreaValue.length !== 0 && textAreaValue.length !== 0 && changesMade) {
            e.target.disabled = true;
            document.querySelector('.cancel_btn').disabled = true;
            setShowSpinner(true);
            try {
                const response = await fetch('https://handy-notes.herokuapp.com/updatenote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        noteId: noteId,
                        noteTitle: titleAreaValue,
                        note: textAreaValue,
                        userEmail: email
                    })
                });
                const data = await response.json(); // data contains an 'updatedNotes' object
                if (data) {
                    setShowEditModal(false);
                    saveToLocalStorage(data.notes);
                    setChangesMade(false);
                    e.target.disabled = false;
                    document.querySelector('.cancel_btn').disabled = true;
                    setShowSpinner(false);
                    setToastMessage(toastMessages[1]); // messsage: note updated !
                    setShowSuccessToast(true);
                }
            } catch (error) { console.log(error.message) }
        }
        else {
            setshowModalToast(true);
        }
    }

    // delete the note from database and get new array of notes. Re-render notes list
    async function handleDelete(e) {
        try {
            e.target.disabled = true;
            document.querySelector('.cancel_btn').disabled = true;
            setShowSpinner(true);
            const response = await fetch('https://handy-notes.herokuapp.com/deletenote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({  // provide user email and note id
                    userEmail: email,
                    noteId: noteId,
                })
            });
            const data = await response.json();
            if (data) {
                setShowDeleteModal(false);
                saveToLocalStorage(data.notes);
                e.target.disabled = false;
                document.querySelector('.cancel_btn').disabled = true;
                setShowSpinner(false);
                setToastMessage(toastMessages[2]); // messsage: note added
                setShowSuccessToast(true);
            }
        } catch (error) { console.log(error.message) }
    }
    // saves fetched server data to local storage and set notes to the  updated notes
    function saveToLocalStorage(dataNotes) {
        let sortedNotes = sortNotes(dataNotes)    // pass updated notes up to sort method in App.js
        let localSave = {
            email: email,
            userName: userName,
            notes: sortedNotes
        };
        localStorage.setItem('local save', JSON.stringify(localSave));
        setNotes_s(sortedNotes);
    }

    // get the details of the specific note whose edit or delete btn is toggled
    function noteDetails(noteId, noteTitle, note) {
        setNoteId(noteId);
        setNoteTitle(noteTitle);
        setNote(note);
    }

    return (
        <motion.div className='notes_container' variants={containerVariants} initial='hidden' animate='visible'>
            <Container>
                <Row>
                    <div className='header col-lg-12'>
                        <div className='logo_and_site_name col-lg-4 col-md-4 col-sm-6 col-6'>
                            <div className='logo'><FaBookReader /></div>
                            <div className='site_name'>Handy Notes</div>
                        </div>
                        <div className='search_box col-lg-4 col-md-4 d-none d-md-block'>
                            <Form>
                                <FaSearch className='search_icon' />
                                <Form.Control type='text' placeholder='search notes' onChange={handleSearch} />
                            </Form>
                        </div>
                        <div className='user_and_menu_icon col-lg-4 col-md-4 col-sm-6 col-6'>
                            <span className='user_name'>| {userName.charAt(0).toUpperCase() + userName.substring(1, 11).toLowerCase()}</span>
                            <IoMdMenu className='menu_icon' onClick={() => {
                                let menu = document.querySelector('.menu');
                                if (menu.classList.contains('active')) menu.classList.remove('active');
                                else menu.classList.toggle('active');
                            }} />
                        </div>
                    </div>

                    {/* show toast to prompt successfull note additions, updates and deletions */}
                    <Toast className='success_toast'
                        bg='success' onClose={() => setShowSuccessToast(!showSuccessToast)}
                        show={showSuccessToast}
                        autohide
                        delay={3000}>
                        <Toast.Body>
                            {toastMessage}
                        </Toast.Body>
                    </Toast>

                    {/* if notes array is empty prompt user to add a note*/}
                    {noNotes ?
                        <div className='no_notes'>
                            <div className='inner_div'>
                                <div className='text'>You currently have no saved notes</div>
                                <Button onClick={() => { setShowAddModal(true); console.log('true'); }}>Add a note</Button>
                            </div>
                        </div> :
                        /*retrieve a note from the notes array and create a Note component*/
                        <>
                            <div className='notes_list'>
                                {showFiltered ?
                                    filteredNotes_s.map(note => {
                                        return <motion.div variants={childrenVariants}><Note key={note._id} noteId={note._id} createdAt={note.createdAt} noteTitle={note.noteTitle} note={note.note} handleUpdate={handleUpdate} setShowEditModal={setShowEditModal} setShowDeleteModal={setShowDeleteModal} noteDetails={noteDetails} /></motion.div>
                                    }) :
                                    notes_s.map(note => {
                                        return <motion.div variants={childrenVariants}><Note key={note._id} noteId={note._id} createdAt={note.createdAt} noteTitle={note.noteTitle} note={note.note} handleUpdate={handleUpdate} setShowEditModal={setShowEditModal} setShowDeleteModal={setShowDeleteModal} noteDetails={noteDetails} /></motion.div>
                                    })
                                }
                            </div>
                            {/* also show add note button at buttom-right of screen */}
                            <Button className='add_note' onClick={() => setShowAddModal(true)}>+</Button>
                        </>
                    }
                </Row>
                <IconContext.Provider value={{ color: 'white' }}>
                    <div className='menu'>
                        <ul>
                            <li>
                                <Form className='search_box d-block d-md-none'>
                                    <FaSearch className='search_icon' />
                                    <Form.Control type='text' placeholder='search notes' onChange={handleSearch} />
                                </Form>
                            </li>
                            <li>
                                <div className='drop_contacts' onClick={() => {
                                    let span = document.querySelector('.developer_contact_dropdown');
                                    if (span.classList.contains('active')) span.classList.remove('active');
                                    else span.classList.toggle('active');
                                }}>
                                    Contact developer
                                    <span><IoMdArrowDropdown /></span>
                                </div>
                                <div className='developer_contact_dropdown'>
                                    {/* <div><IoMdMail className='icon'/><a href="mailto:jeromeakumasi01@gmail.com">gmail</a></div> */}
                                    <div><FaTelegram className='icon' /><a href='https://t.me/jaakumasi' target='_blank'>telegram</a></div>
                                </div>
                            </li>
                            <li><NavLink replace to='/' className='logout'>Logout</NavLink></li>
                        </ul>
                    </div>
                </IconContext.Provider>
            </Container>

            {/* ADD NOTE MODAL */}
            <Modal show={showAddModal}
                onHide={() => { setShowAddModal(false); setShowSpinner(false) }}
                onEnter={() => { setshowModalToast(false); document.querySelector('.title_area').focus() }}
                backdrop='static'
                className='modal'>
                <Toast className='toast'
                    bg='danger' onClose={() => { setshowModalToast(!showModalToast); setShowSpinner(false) }}
                    show={showModalToast}
                    autohide
                    delay={3000}>
                    <Toast.Body>
                        Please fill in all fields
                    </Toast.Body>
                </Toast>
                <Modal.Header closeButton className='modal_header'>
                    <Modal.Title className='modal_title'><span className='add_note'>Add Note</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal_body'>
                    <Form>
                        <div className='group'>
                            <div className='title_div'>Title</div>
                            <Form.Control className='title_area' />
                        </div>
                        <Form.Control as='textarea' wrap='' className='text_area' />
                    </Form>
                </Modal.Body>
                {showSpinner ?
                    <Spinner animation='border' role='status' variant='primary' size='sm' className='spinner' /> : ''
                }
                <Modal.Footer className='modal_footer'>
                    <Button onClick={handleAddNote} className='save_btn'>save</Button>
                    <Button onClick={() => setShowAddModal(false)} className='cancel_btn'>cancel</Button>
                </Modal.Footer>
            </Modal>

            {/* EDIT NOTE MODAL */}
            <Modal show={showEditModal}
                onHide={() => { setShowEditModal(false); setShowSpinner(false) }}
                onEnter={() => { setTextAreaValue(note); setTitleAreaValue(noteTitle); setshowModalToast(false); document.querySelector('.text_area').focus() }}
                className='modal'
                backdrop='static'>
                <Toast className='toast'
                    bg='danger' onClose={() => { setshowModalToast(!showModalToast); setShowSpinner(false) }}
                    show={showModalToast}
                    autohide
                    delay={3000}>
                    <Toast.Body>
                        {changesMade ? 'Please fill in all fields' : 'No changes made'}
                    </Toast.Body>
                </Toast>
                <Modal.Header closeButton className='modal_header'>
                    <Modal.Title className='modal_title'><span className='edit_note'>Edit Note</span> | <span className='note_title'>{noteTitle}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal_body'>
                    <Form>
                        <div className='group'>
                            <div className='title_div'>Title</div>
                            <Form.Control className='title_area' value={titleAreaValue} onChange={e => { setTitleAreaValue(e.target.value); setChangesMade(true) }} />
                        </div>
                        <Form.Control as='textarea' className='text_area' value={textAreaValue} onChange={e => { setTextAreaValue(e.target.value); setChangesMade(true) }} />
                    </Form>
                </Modal.Body>
                {showSpinner ?
                    <Spinner animation='border' role='status' variant='success' size='sm' className='spinner' /> : ''
                }
                <Modal.Footer className='modal_footer'>
                    <Button onClick={handleUpdate} className='update_btn'>update</Button>
                    <Button onClick={() => setShowEditModal(false)} className='cancel_btn'>cancel</Button>
                </Modal.Footer>
            </Modal>

            {/* DELETE NOTE MODAL */}
            <Modal show={showDeleteModal}
                onHide={() => { setShowDeleteModal(false); setShowSpinner(false) }}
                backdrop='static'
                className='modal'>
                <Modal.Header closeButton className='modal_header'>
                    <Modal.Title className='modal_title'><span className='edit_note'>delete Note</span> | <span className='note_title'>{noteTitle}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal_body'>
                    <div className='confirm_delete'>Confirm note deletion !</div>
                </Modal.Body>
                {showSpinner ?
                    <Spinner animation='border' role='status' variant='danger' size='sm' className='spinner' /> : ''
                }
                <Modal.Footer className='modal_footer'>
                    <Button onClick={handleDelete} className='delete_btn'>confirm</Button>
                    <Button onClick={() => setShowDeleteModal(false)} className='cancel_btn'>cancel</Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    )
}