import axios from 'axios'
import React, { useState } from 'react'

function ChangePassword() {

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const changePassword = () => {
        axios.put("http://localhost:3001/auth/changepassword", { oldPassword: oldPassword, newPassword: newPassword }, {
            headers: { accessToken: localStorage.getItem("accessToken") },
        }).then((response) => {
            if(response.data.error){
                alert(response.data.error);
            }
            alert("Changed Successfully")
        })
    }
    //Change password

    return (
        <div>
            <h1>ChangePassword</h1>
            <input type='password' placeholder='Old Password' onChange={(event) => { setOldPassword(event.target.value) }}></input>
            <input type='password' placeholder='New Password' onChange={(event) => { setNewPassword(event.target.value) }}></input>
            <button onClick={changePassword}>Save</button>
        </div>
    )
}

export default ChangePassword