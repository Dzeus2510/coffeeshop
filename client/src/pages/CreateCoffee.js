import axios from 'axios';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

function CreateCoffee() {

    let nav = useNavigate()

    const initialValues = {
        name: "",
        address: "",
        category: "Cafe",
        phone: "",
        website: "",
        image: "",
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().min(3).max(20).required("You Must Input A Name"),
        address: Yup.string().min(10).max(80).required("You Must Input An Address"),
    });

    const onSubmit = (data) => {
        axios.post("http://localhost:3001/cafes/create", data, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
            },
        }).then((response) => {
            if (response.data === "Success") {
                alert("created Coffee Successfully")
                nav("/")
            } else {
                alert(response.data)
            }
        });
    };

    return (
        <div className="createPostPage">
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} enableReinitialize={true} >
                <Form className="formContainer">
                    <br></br><label>Name: </label>
                    <ErrorMessage name="name" component="span" />
                    <Field id="formContainer" name="name" placeholder="Name" />
                    <br></br><label>Address: </label>
                    <ErrorMessage name="address" component="span" />
                    <Field id="formContainer" name="address" placeholder="Address" />
                    <br></br><label>Category: </label>
                    <Field as="select" id="formContainer" name="category" initialValues="Cafe">
                        <option value="Cafe">Cafe</option>
                        <option value="Coffee Shop">Coffee Shop</option>
                        <option value="Restaurant">Restaurant</option>
                    </Field>
                    <br></br><label>Phone: </label>
                    <Field id="formContainer" name="phone" placeholder="Phone" />
                    <br></br><label>Website: </label>
                    <Field id="formContainer" name="website" placeholder="Website" />
                    <br></br><label>Image: </label>
                    <Field id="formContainer" name="image" placeholder="Image" />
                    <button type="submit">Create Coffee Shop</button>
                </Form>
            </Formik>
        </div>
    )
}

export default CreateCoffee