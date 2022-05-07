import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { FaEdit, FaTrash } from 'react-icons/fa'
import './note.css'

export default function Note({ noteId, createdAt, noteTitle, note, handleSave, setShowEditModal, setShowDeleteModal, noteDetails }) {

    return (
        <>
            <div className='note_container col-12'>
                <div className='created_at'>
                    <span className='date'>{createdAt}</span>
                    <span className='edit_delete'>
                        <i className='edit' onClick={() => {setShowEditModal(true); noteDetails(noteId, noteTitle, note)}}><FaEdit /></i>
                        <i className='delete' onClick={() => {setShowDeleteModal(true), noteDetails(noteId, noteTitle, note)}}><FaTrash /></i>
                    </span>
                </div>
                <div className='note_content' onClick={(e) => {
                    let note = e.target;
                    if (note.classList.contains('active')) note.classList.remove('active');
                    else note.classList.toggle('active');
                }}>
                    <div className='note_title'>{noteTitle}</div>
                    <div className='note_body'>
                        {note}
                    </div>
                </div>
            </div >
        
        </>
    )
}