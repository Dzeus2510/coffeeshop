import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

function Registration() {

    let nav = useNavigate()

    const initialValues ={
        username: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string().min(3).max(20).required("You Must Input A Username"),
        password: Yup.string().min(4).max(20).required("You Must Input A Password"),
    });
    //validate users input for creating account

    const onSubmit = (data) => {
        axios.post("http://localhost:3001/auth", data).then((response) => {
            alert("created Successfully")
            nav("/login")
    });
    };
    //after done creating account, it will redirect to login page

  return (
    <div className="createPostPage">
        <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} >
            <Form className="formContainer">
                <br></br><label>Username: </label>
                <ErrorMessage name="username" component="span" />
                <Field id="formContainer" name="username" placeholder="Username" />
                <br></br><label>Password: </label>
                <ErrorMessage name="password" component="span" />
                <Field id="formContainer" type="password" name="password" placeholder="Password" />
                <br></br>
                <button type="submit">Create Account</button>
            </Form>
        </Formik>
    </div>
  )
}

export default Registration